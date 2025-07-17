// factureDeviseQuery.js
exports.factureDevise = {
  // Get all facture devises
  getAll: `
    SELECT [id]
          ,[idDossier]
          ,[Devise]
          ,[MontantHtDevise]
          ,[MontantTvaDevise]
          ,[MontantTTCDevise]
          ,[MontantPreparation]
          ,[CumulPaiementDevise]
          ,[TauxInit]
          ,[MontantHtDh]
          ,[MontantTvaDh]
          ,[MontantTTCDh]
          ,[iddesignation]
          ,[idFournisseur]
          ,[dateDoc]
          ,[numDoc]
          ,[codeChantier]
          ,[dateCreation]
          ,[Redacteur]
          ,[dateDouane]
    FROM [dbo].[DAF_FactureDevise]
  `,

  // Count all facture devises
  getCount: `
    SELECT COUNT(*) AS count 
    FROM [dbo].[DAF_FactureDevise]
  `,

  // Create a new facture devise
  create: `
    INSERT INTO [dbo].[DAF_FactureDevise]
    ([idDossier]
    ,[Devise]
    ,[MontantHtDevise]
    ,[MontantTvaDevise]
    ,[MontantTTCDevise]
    ,[TauxInit]
    ,[MontantHtDh]
    ,[MontantTvaDh]
    ,[MontantTTCDh]
    ,[iddesignation]
    ,[idFournisseur]
    ,[dateDoc]
    ,[numDoc]
    ,[codeChantier]
    ,[Redacteur]
    ,[dateDouane])
    VALUES 
    (@idDossier, @Devise, @MontantHtDevise, @MontantTvaDevise, @MontantTTCDevise,
     @TauxInit, @MontantHtDh, @MontantTvaDh,
     @MontantTTCDh, @iddesignation, @idFournisseur, @dateDoc, @numDoc, @codeChantier,
     @Redacteur, @dateDouane)
  `,

  // Update a facture devise
  update: `
    UPDATE [dbo].[DAF_FactureDevise]
    SET [idDossier] = @idDossier,
        [Devise] = @Devise,
        [MontantHtDevise] = @MontantHtDevise,
        [MontantTvaDevise] = @MontantTvaDevise,
        [MontantTTCDevise] = @MontantTTCDevise,
        [MontantPreparation] = @MontantPreparation,
        [CumulPaiementDevise] = @CumulPaiementDevise,
        [TauxInit] = @TauxInit,
        [MontantHtDh] = @MontantHtDh,
        [MontantTvaDh] = @MontantTvaDh,
        [MontantTTCDh] = @MontantTTCDh,
        [iddesignation] = @iddesignation,
        [idFournisseur] = @idFournisseur,
        [dateDoc] = @dateDoc,
        [numDoc] = @numDoc,
        [codeChantier] = @codeChantier,
        [ModifierPar] = @ModifierPar,
        [dateDouane] = @dateDouane
    WHERE id = @id
  `,

  // Get one facture devise by ID
  getOne: `
    SELECT * FROM [dbo].[DAF_FactureDevise]
    WHERE id = @id
  `,

  // Get factures by dossier ID
  getByDossier: `
    SELECT * FROM [dbo].[DAF_FactureDevise]
    WHERE idDossier = @idDossier
  `,
};
