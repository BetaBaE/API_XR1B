exports.StFournisseur = {
  chefferDAffaire: `
select FORMAT(DateFacture, 'yyyy-MM') as id , FORMAT(DateFacture, 'yyyy-MM') as mois , sum(TTC) as TTC
from DAF_FactureSaisie fa inner join DAF_FOURNISSEURS f on fa.idfournisseur = f.id
where nom = @nom and fa.Etat <> 'Annuler' and fa.deletedAt is null
group by FORMAT(DateFacture, 'yyyy-MM')
order by mois
    `,

  FAStateForByFournisseur: `
  
WITH sumFASaisie AS (
  SELECT
    1 AS id,
    'FA Saisie' AS name,
    COALESCE(SUM(TTC - Acompte), 0) AS NetApaye
  FROM DAF_FactureSaisie fa
  INNER JOIN DAF_FOURNISSEURS f ON fa.idfournisseur = f.id
  WHERE f.nom = @nom
    AND etat = 'Saisie'
),

sumAVnoRestit as (
 select 2 as id ,
  'Av non restitué' as name , 
  COALESCE(SUM(Montant), 0) AS NetApaye
 from DAF_RestitAvance
 where idFacture is null
 and Etat <> 'Annuler'
 and nom = @nom
),

FADispoAvecFN AS (
  SELECT
    3 AS id,
    'FN Disponible' AS name,
    COALESCE(SUM(TTC - Acompte), 0) AS NetApaye
  FROM DAF_FactureSaisie fa
  INNER JOIN DAF_FOURNISSEURS f ON fa.idfournisseur = f.id
  WHERE f.nom = @nom
    AND fa.id IN (SELECT idFacture FROM DAF_factureNavette)
    AND etat IN ('Saisie')
    AND ([dateoperation] > FORMAT(GETDATE(), 'yyyy-01-01') OR [dateoperation] IS NULL)
    AND YEAR(fa.DateFacture) <= YEAR(GETDATE())
),

FAProgPourPaie AS (
  SELECT
    4 AS id,
    'FA En Cours' AS name,
    COALESCE(SUM(TTC - Acompte), 0) AS NetApaye
  FROM DAF_FactureSaisie fa
  INNER JOIN DAF_FOURNISSEURS f ON fa.idfournisseur = f.id
  WHERE f.nom = @nom
    AND fa.id IN (SELECT idFacture FROM DAF_factureNavette)
    AND etat IN ('En cours')
    AND ([dateoperation] > FORMAT(GETDATE(), 'yyyy-01-01') OR [dateoperation] IS NULL)
    AND YEAR(fa.DateFacture) <= YEAR(GETDATE())
),

resume AS (
  SELECT * FROM sumFASaisie
  UNION ALL
  SELECT * FROM   sumAVnoRestit
  UNION ALL
  SELECT * FROM FADispoAvecFN
  UNION ALL
  SELECT * FROM FAProgPourPaie
)
  
  `,

  paiementByMonth: `
SELECT
  FORMAT(CASE
    WHEN DateOperation IS NULL THEN DateCreation
    WHEN DateCreation IS NULL THEN DateOperation
    WHEN DateOperation >= DateCreation THEN DateOperation
    ELSE DateCreation
  END, 'yyyy-MM') AS id,
  FORMAT(CASE
    WHEN DateOperation IS NULL THEN DateCreation
    WHEN DateCreation IS NULL THEN DateOperation
    WHEN DateOperation >= DateCreation THEN DateOperation
    ELSE DateCreation
  END, 'yyyy-MM') AS Mois,
  SUM(NETAPAYER) AS [Montant Paiement]
FROM DAF_LOG_FACTURE
WHERE etat <> 'Annuler'
  AND DateOperation >= '2025-01-01'
  AND nom = @nom
GROUP BY nom,
  FORMAT(CASE
    WHEN DateOperation IS NULL THEN DateCreation
    WHEN DateCreation IS NULL THEN DateOperation
    WHEN DateOperation >= DateCreation THEN DateOperation
    ELSE DateCreation
  END, 'yyyy-MM')
ORDER BY Mois DESC
  `,

  paiementDetailByMonth: `
SELECT
  CONCAT(CODEDOCUTIL, '|', CONVERT(varchar(10), DateDouc, 23), '|', ISNULL(CODECHT, '')) AS id,
  CODEDOCUTIL,
  DateDouc,
  CODECHT,
  TOTALTTC,
  NETAPAYER,
  ISNULL(RAS, 0) AS RAS,
  ISNULL(RASIR, 0) AS RasIR,
  etat,
  CASE WHEN LEFT(idDocPaye, 2) = 'fr' THEN 'Facture' ELSE 'Avance' END AS typeDoc
FROM DAF_LOG_FACTURE
WHERE FORMAT(CASE
    WHEN DateOperation IS NULL THEN DateCreation
    WHEN DateCreation IS NULL THEN DateOperation
    WHEN DateOperation >= DateCreation THEN DateOperation
    ELSE DateCreation
  END, 'yyyy-MM') = @mois
  AND nom = @nom
  AND etat <> 'Annuler'
ORDER BY DateDouc DESC
  `,

  soldeFournisseur: `
WITH sumSaisie AS (
  SELECT SUM(ttc - Acompte) AS sumSai
  FROM DAF_FactureSaisie fa
  LEFT JOIN DAF_FOURNISSEURS fr ON fa.idfournisseur = fr.id
  WHERE fr.nom = @nom
    AND etat = 'Saisie'
),
sumRestit AS (
  SELECT SUM(Montant) AS sumRes
  FROM DAF_RestitAvance
  WHERE nom = @nom
    AND idFacture IS NULL
    AND etat <> 'Annuler'
)
SELECT
  COALESCE((SELECT sumSai FROM sumSaisie), 0)
  - COALESCE((SELECT sumRes FROM sumRestit), 0) AS solde
  `,
};
