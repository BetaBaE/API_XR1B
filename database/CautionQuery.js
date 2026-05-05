exports.Caution = {
  getCount: `
    SELECT COUNT(*) AS count
    FROM [dbo].[DAF_Caution] c
    LEFT JOIN [dbo].[DAF_Marche] m ON m.[id] = c.[idMarche]
    WHERE 1 = 1
  `,

  getAll: `
    SELECT
      c.[id],
      c.[numero],
      c.[banqueId],
      c.[nature],
      c.[type],
      c.[idMarche],
      c.[numeroDossier],
      c.[dateDelivrance],
      c.[dateEcheance],
      c.[montant],
      c.[idFournisseur],
      c.[origine],
      c.[taux],
      c.[createdBy],
      c.[createdAt],
      c.[updatedBy],
      c.[updatedAt],
      m.[numero] AS marcheNumero,
      m.[codeAffaire],
      b.[nom] AS banqueNom,
      f.[nom] AS fournisseurNom,
      ch.[LIBELLE] AS chantierLibelle
    FROM [dbo].[DAF_Caution] c
    LEFT JOIN [dbo].[DAF_Marche] m ON m.[id] = c.[idMarche]
    LEFT JOIN [dbo].[DAF_RIB_ATNER] b ON b.[id] = c.[banqueId]
    LEFT JOIN [dbo].[DAF_FOURNISSEURS] f ON f.[id] = c.[idFournisseur]
    LEFT JOIN [dbo].[chantier] ch ON ch.[CODEAFFAIRE] = m.[codeAffaire]
    WHERE 1 = 1
  `,

  getOne: `
    SELECT
      c.[id],
      c.[numero],
      c.[banqueId],
      c.[nature],
      c.[type],
      c.[idMarche],
      c.[numeroDossier],
      c.[dateDelivrance],
      c.[dateEcheance],
      c.[montant],
      c.[idFournisseur],
      c.[origine],
      c.[taux],
      c.[createdBy],
      c.[createdAt],
      c.[updatedBy],
      c.[updatedAt],
      m.[numero] AS marcheNumero,
      m.[codeAffaire],
      b.[nom] AS banqueNom,
      f.[nom] AS fournisseurNom,
      ch.[LIBELLE] AS chantierLibelle
    FROM [dbo].[DAF_Caution] c
    LEFT JOIN [dbo].[DAF_Marche] m ON m.[id] = c.[idMarche]
    LEFT JOIN [dbo].[DAF_RIB_ATNER] b ON b.[id] = c.[banqueId]
    LEFT JOIN [dbo].[DAF_FOURNISSEURS] f ON f.[id] = c.[idFournisseur]
    LEFT JOIN [dbo].[chantier] ch ON ch.[CODEAFFAIRE] = m.[codeAffaire]
    WHERE c.[id] = @id
  `,

  create: `
    INSERT INTO [dbo].[DAF_Caution]
      ([numero]
      ,[banqueId]
      ,[nature]
      ,[type]
      ,[idMarche]
      ,[numeroDossier]
      ,[dateDelivrance]
      ,[dateEcheance]
      ,[montant]
      ,[idFournisseur]
      ,[origine]
      ,[taux]
      ,[createdBy])
    OUTPUT inserted.id
    VALUES
      (@numero
      ,@banqueId
      ,@nature
      ,@type
      ,@idMarche
      ,@numeroDossier
      ,@dateDelivrance
      ,@dateEcheance
      ,@montant
      ,@idFournisseur
      ,@origine
      ,@taux
      ,@createdBy)
  `,

  update: `
    UPDATE [dbo].[DAF_Caution]
    SET
      [numero] = @numero,
      [banqueId] = @banqueId,
      [nature] = @nature,
      [type] = @type,
      [idMarche] = @idMarche,
      [numeroDossier] = @numeroDossier,
      [dateDelivrance] = @dateDelivrance,
      [dateEcheance] = @dateEcheance,
      [montant] = @montant,
      [idFournisseur] = @idFournisseur,
      [origine] = @origine,
      [taux] = @taux,
      [updatedBy] = @updatedBy,
      [updatedAt] = GETDATE()
    WHERE [id] = @id
  `,
};
