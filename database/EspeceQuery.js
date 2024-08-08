exports.espece = {
  // Crée un nouvel enregistrement d'espèce pour un fournisseur
  create: `
    INSERT INTO [dbo].[DAF_espece]
        (
         [fournisseurId],
         [montantVirement],
         [redacteur])
    VALUES
        (
         @fournisseurId,
         @montantVirement,
         @redacteur
        )`,

  // Récupère le nombre total d'enregistrements d'espèce
  getCount: "SELECT COUNT(*) as count FROM [dbo].[DAF_espece]",

  // Récupère tous les enregistrements d'espèce avec les détails des fournisseurs
  getAll: `
    SELECT v.[id],
        v.[Datepaiement],
        [montantVirement],
        f.nom as "fournisseur",
        CodeFournisseur
    FROM [dbo].[DAF_espece] v,
        [dbo].[DAF_FOURNISSEURS] f
    WHERE v.fournisseurId = f.id
      AND 1 = 1
    `,

  // Récupère des données depuis la table de log des factures
  getDataFromLogFacture: `SELECT * FROM [dbo].[DAF_CalculRasNetApaye] WHERE 1 = 1`,

  // Crée une nouvelle entrée dans le log des factures
  createLogFacture: `
   INSERT INTO [dbo].[DAF_LOG_FACTURE]
             ([CODEDOCUTIL],
              [CODECHT],
              [NOM],
              [LIBREGLEMENT],
              [datedouc],
              [TOTALTTC],
              [TOTHTNET],
              [TOTTVANET],
              [NETAPAYER],
              [ModePaiementID],
              [etat],
              [modepaiement],
              [idAvance],
              [Ras],
              [DateOperation])
       VALUES`,

  // Crée une restitution d'avance
  createRestit: `
       INSERT INTO [dbo].[DAF_RestitAvance]
                 ([idAvance],
                  [Montant],
                  [Redacteur],
                  [etat],
                  [nom],
                  [ModePaiement])
           VALUES`,

  // Crée une nouvelle entrée dans la table des RAS
  CreateRasFactue: `INSERT INTO [dbo].[DAF_RAS_Tva]
             ([idFournisseur],
              [RefernceDOC],
              [CategorieFn],
              [dateFactue],
              [dateOperation],
              [etat],
              [HT],
              [TauxTva],
              [Pourcentage_TVA],
              [RaS],
              [PourcentageRas],
              [modePaiement],
              [Nom])
       VALUES`,
  ChangeEtatAvanceWhenRegler: ` update DAF_Avance 
     set Etat='Regler'
     where id=@idAvance
    
    `,
};
