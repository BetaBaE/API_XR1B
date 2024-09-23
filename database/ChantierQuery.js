// Exportations pour Chantiers
exports.chantiers = {
  // Récupère tous les chantiers
  getChantiers: `
    SELECT * 
    FROM chantier
  `,

  // Récupère le nombre total de chantiers
  getcountChantier: `
    SELECT COUNT(*) 
    FROM chantier
  `,

  // Récupère les chantiers associés à une facture spécifique
  getChantiersbyfactureid: `
    SELECT * 
    FROM chantier
    WHERE id IN (
      SELECT codechantier 
      FROM DAF_FactureSaisie
      WHERE id = @id  -- Filtre par identifiant de la facture
    )
  `,

  // Récupère les informations de chantier et le rédacteur associé à un bon de commande spécifique
  getChantierbyBc: `
   SELECT c.LIBELLE,cde.* 
  FROM [ENTETECDEFOURNISSEUR] cde inner join chantier c on (cde.codecht = c.id) -- Jointure pour obtenir le nom du chantier
    WHERE cde.CODEDOCUTIL = @Boncommande --  Filtre par identifiant du bon de commande
  `,

  getChantierbyFA: `
   with BCBRFA  AS
(
select CODEDOCDESTINATION as d from TRACABILITEDOC where CODEDOCORIGINE=@Boncommande -- METTRE LE NUM BC
union all
select CODEDOCDESTINATION FROM BCBRFA, TRACABILITEDOC
where BCBRFA.d= TRACABILITEDOC.CODEDOCORIGINE)
SELECT f.nom,
f.RTCFIELD1 as NumeroFacture,
f.DATEDOC as DateFacture,
f.TOTALTTC,
f.RTCFIELD2 as FN,
concat(c.[cheminDA],'\\05 - Interface Achats\\02 - Demandes d''achat\\',f.RTCFIELD3) AS DA 
from BCBRFA , ENTETEFACTUREFOURNISSEUR f
inner join chantier c on(c.id =  f.CODECHT) 
where (BCBRFA.d=f.CODEDOCUTIL) and f.CLEETATDOC='54'

  `,
};
