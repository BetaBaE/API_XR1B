// Exportations pour AvancePayer
exports.AvancePayer = {
  // Requête SQL pour obtenir le nombre total d'avances payées
  getAvancePayerCount: `
    SELECT COUNT(*) as count
    FROM [dbo].[DAF_LOG_FACTURE] lf 
    INNER JOIN [dbo].[DAF_factureNavette] fn ON 
      CASE 
        WHEN lf.idAvance 
        LIKE 'av%' THEN TRY_CAST(SUBSTRING(lf.idAvance, 3, LEN(lf.idAvance)) AS INT)
        ELSE lf.idAvance
      END = fn.idfacturenavette
    INNER JOIN [dbo].[DAF_FOURNISSEURS] fou ON fou.id = fn.idfournisseur 
    INNER JOIN chantier ch ON ch.id = fn.codechantier
  `,

  // Requête SQL pour récupérer les détails des avances payées
  getAvancePayer: `
    SELECT DISTINCT
      fn.Bcommande,
      fn.montantAvance,
      fn.idfacturenavette as id,
      fou.CodeFournisseur,
      fou.nom,
      ch.LIBELLE,
      ch.id as codechantier,
      lf.etat,
      lf.modepaiement,
      fn.ficheNavette
    FROM [dbo].[DAF_LOG_FACTURE] lf 
    INNER JOIN [dbo].[DAF_factureNavette] fn ON 
      CASE 
        WHEN lf.idAvance LIKE 'av%' THEN TRY_CAST(SUBSTRING(lf.idAvance, 3, LEN(lf.idAvance)) AS INT)
        ELSE lf.idAvance
      END = fn.idfacturenavette
    INNER JOIN [dbo].[DAF_FOURNISSEURS] fou ON fou.id = fn.idfournisseur 
    INNER JOIN chantier ch ON ch.id = fn.codechantier
  `,
};
