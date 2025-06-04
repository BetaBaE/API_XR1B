exports.factureDevise = {
  // Get all invoices
  getAll: `
    SELECT fd.[id]
      ,d.NumDossier 
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
      ,de.designation
      ,f.nom
      ,[dateDoc]
      ,[numDoc]
      ,[codeChantier]
      ,fd.[dateCreation]
      ,fd.[Redacteur]
      ,[dateDouane]
  FROM [DAF_FactureDevise] fd
  left join DAF_FOURNISSEURS f on fd.idFournisseur = f.id
  left join DAF_Dossier d on fd.idDossier =d.id
  left join FactureDesignation de on fd.iddesignation = de.id
  where 1 = 1
    `,

  // Get total count of invoices
  getCount: `
      SELECT COUNT(*) AS count
      FROM [APP_COMPTA].[dbo].[DAF_FactureDevise]
    `,

  // Create a new invoice
  create: `
       INSERT INTO [APP_COMPTA].[dbo].[DAF_FactureDevise] (
        [idDossier],
        [Devise],
        [MontantHtDevise],
        [MontantTvaDevise],
        [MontantTTCDevise],
        [TauxInit],
        [MontantHtDh],
        [MontantTvaDh],
        [MontantTTCDh],
        [iddesignation],
        [idFournisseur],
        [dateDoc],
        [numDoc],
        [codeChantier],
        [Redacteur],
        [dateDouane]
      ) VALUES (
        @idDossier,
        @Devise,
        @MontantHtDevise,
        @MontantTvaDevise,
        @MontantTTCDevise,
        @TauxInit,
        @MontantHtDh,
        @MontantTvaDh,
        @MontantTTCDh,
        @iddesignation,
        @idFournisseur,
        @dateDoc,
        @numDoc,
        @codeChantier,
        @Redacteur,
        @dateDouane
      )
    `,

  // Update an invoice
  update: `
      UPDATE [APP_COMPTA].[dbo].[DAF_FactureDevise]
      SET
        [idDossier] = @idDossier,
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
        [dateModification] = GETDATE(),
        [ModifierPar] = @ModifierPar,
        [dateDouane] = @dateDouane
      WHERE id = @id
    `,

  // Get one invoice by ID
  getOne: `
      SELECT *
      FROM [APP_COMPTA].[dbo].[DAF_FactureDevise]
      WHERE id = @id
    `,

  // Get invoices by dossier ID
  getByDossierId: `
      SELECT *
      FROM [APP_COMPTA].[dbo].[DAF_FactureDevise]
      WHERE idDossier = @idDossier
    `,

  // Get invoices by supplier
  getBySupplier: `
      SELECT *
      FROM [APP_COMPTA].[dbo].[DAF_FactureDevise]
      WHERE idFournisseur = @idFournisseur
    `,

  // Get invoices by construction site code
  getByChantier: `
      SELECT *
      FROM [APP_COMPTA].[dbo].[DAF_FactureDevise]
      WHERE codeChantier = @codeChantier
    `,

  // Get invoices by date range
  getByDateRange: `
      SELECT *
      FROM [APP_COMPTA].[dbo].[DAF_FactureDevise]
      WHERE dateDoc BETWEEN @startDate AND @endDate
    `,
};
