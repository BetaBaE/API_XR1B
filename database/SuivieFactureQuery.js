exports.SuivieFacture = {
  // Cette requête récupère des enregistrements distincts des factures avec divers détails, en excluant celles dont le numéro de facture contient un tiret.
  getSuivieFacture: `
SELECT DISTINCT 
      [id],                  -- ID de la facture
      [BonCommande],         -- Bon de commande
      [chantier],            -- Chantier/Projet
      [DateFacture],         -- Date de la facture
      [TTC],               -- Total TTC (Toutes Taxes Comprises)
	
		[HT],                  -- Total HT (Hors Taxes)
      [numeroFacture],       -- Numéro de la facture
      [MontantTVA],         -- Montant de la TVA
      [CodeFournisseur],     -- Code du fournisseur
      [nom],                 -- Nom du fournisseur
      [datecheque],          -- Date du chèque
      [dateecheance],        -- Date d'échéance
      [ficheNavette],        -- Fiche navette
      [dateOperation],       -- Date de l'opération
      [modepaiement],       -- Mode de paiement
      [banque],              -- Banque
      [designation],         -- Désignation
      [numerocheque],        -- Numéro du chèque
      [montantAvance],      -- Montant de l'avance
      [etat],                -- État
      ModePaiementID,        -- numero de l'ordere de virement 
     ACompteREG,
	 AcomptevAL, 
	 CASE 
        WHEN etat = 'pas encore' THEN DATEDIFF(DAY, DateFacture, GETDATE())   -- Calcul du nombre de jours depuis la date de la facture si l'état est "pas encore payé"
        ELSE NULL  
      END AS nbrJour   --  Nombre de jours depuis la date de la facture
      
    FROM DAF_SuivieFacture   
    WHERE numeroFacture NOT LIKE '%-'  -- Exclusion des factures dont le numéro contient un tiret
  `,

  // Cette requête compte le nombre total de factures en excluant celles dont le numéro de facture contient un tiret.
  getSuivieFacturecount: `
    SELECT COUNT(*) as count
    FROM DAF_SuivieFacture  
    WHERE numeroFacture NOT LIKE '%-'   -- Exclusion des factures dont le numéro contient un tiret
  `,

  // Cette requête récupère toutes les factures échues.
  getSuivieFactureEchu: `SELECT * 
    FROM DAF_SuivieFactureEchu
    WHERE 1=1
  `,

  // Cette requête compte le nombre total de factures échues.
  getSuivieFactureEchucount: `
    SELECT COUNT(*) as count
    FROM DAF_SuivieFactureEchu 
    WHERE 1=1
  `,

  // Cette requête récupère des factures non payées avec divers détails.
  getSuivieFactureNonPayé: `
    SELECT DISTINCT 
      [id],                  -- ID de la facture
      [BonCommande],         -- Bon de commande
      [chantier],           -- Chantier/Projet
      [DateFacture],         -- Date de la facture
      [TTC],                 -- Total TTC (Toutes Taxes Comprises)
      [HT],                 -- Total HT (Hors Taxes)
      [numeroFacture],      --Numéro de la facture
      [MontantTVA],          -- Montant de la TVA
      [CodeFournisseur],    --Code du fournisseur
      [nom],                 -- Nom du fournisseur
      [datecheque],         -- Date du chèque
      [dateecheance],        -- Date d'échéance
      [ficheNavette],        -- Fiche navette
      [dateOperation],      -- Date de l'opération
      [modepaiement],        -- Mode de paiement
      [banque],              -- Banque
      [designation],         -- Désignation
      [numerocheque],       -- Numéro du chèque
      [montantAvance],       -- Montant de l'avance
      [etat],                -- État
      ModePaiementID       -- ID du mode de paiement
    FROM DAF_SuivieFacture 
    WHERE 1=1
  `,

  // Cette requête compte le nombre total de factures non payées ou en cours.
  getSuivieFactureNonPayéCount: `
    SELECT COUNT(*) as count
    FROM DAF_SuivieFacture  
    WHERE (Etat = 'pas encore' OR Etat = 'En cours')
  `,

  // Cette requête récupère les années distinctes des dates de facturation.
  getAnneSuivieFacture: `
    SELECT DISTINCT YEAR(datefacture) as year
    FROM DAF_SuivieFacture
    ORDER BY YEAR(datefacture)
  `,

  // Cette requête récupère les montants des factures et des règlements par fournisseur pour une année donnée, ainsi que le montant restant dû.
  getSuivieFactureNonPayéByFournisseur: `
    SELECT 
      nom,  -- Nom du fournisseur
      SUM(CASE WHEN YEAR(datefacture) = @annee THEN ttc ELSE 0 END) AS sumFacture,  -- Somme des factures pour l'année donnée
      SUM(CASE WHEN YEAR(dateoperation) = @annee THEN ttc ELSE 0 END) AS sumReglement, -- Somme des règlements pour l'année donnée
      SUM(CASE WHEN YEAR(datefacture) >= @annee AND etat <>'reglee' THEN ttc ELSE 0 END) AS Reste -- Montant restant dû pour l'année donnée
    FROM 
      daf_suiviefacture 
    WHERE  
      UPPER(nom) LIKE UPPER('%'+@nom+'%')  -- Recherche par nom de fournisseur
    GROUP BY 
      nom  --  Groupement par nom de fournisseur
  `,
};

// Note: SuivieFacture est une vue qui contient toutes les informations de la facture depuis sa création jusqu'à son paiement.
