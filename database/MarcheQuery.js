exports.Marche = {
  getCount: `
    SELECT COUNT(*) AS count
    FROM [dbo].[DAF_Marche] m
    LEFT JOIN [dbo].[chantier] c ON c.[id] = m.[codeAffaire]
    WHERE 1 = 1
  `,

  getAll: `
    SELECT
      m.[id],
      m.[numero],
      m.[codeAffaire],
      c.[id] AS chantierId,
      c.[CODEAFFAIRE] AS codeAffaireText,
      m.[objet],
      m.[partenaire],
      m.[client],
      m.[montant],
      m.[natissementBankId],
      m.[dateMES],
      m.[delai],
      m.[bailleur],
      m.[statut],
      m.[dateRP],
      m.[PV_RP],
      m.[dateRD],
      m.[PV_RD],
      m.[tauxTva],
      m.[createdBy],
      m.[createdAt],
      m.[updatedBy],
      m.[updatedAt],
      c.[LIBELLE] AS chantierLibelle,
      b.[nom] AS bankNom
    FROM [dbo].[DAF_Marche] m
    LEFT JOIN [dbo].[chantier] c ON c.[id] = m.[codeAffaire]
    LEFT JOIN [dbo].[DAF_RIB_ATNER] b ON b.[id] = m.[natissementBankId]
    WHERE 1 = 1
  `,

  getOne: `
    SELECT
      m.[id],
      m.[numero],
      m.[codeAffaire],
      c.[id] AS chantierId,
      c.[CODEAFFAIRE] AS codeAffaireText,
      m.[objet],
      m.[partenaire],
      m.[client],
      m.[montant],
      m.[natissementBankId],
      m.[dateMES],
      m.[delai],
      m.[bailleur],
      m.[statut],
      m.[dateRP],
      m.[PV_RP],
      m.[dateRD],
      m.[PV_RD],
      m.[tauxTva],
      m.[createdBy],
      m.[createdAt],
      m.[updatedBy],
      m.[updatedAt],
      c.[LIBELLE] AS chantierLibelle,
      b.[nom] AS bankNom
    FROM [dbo].[DAF_Marche] m
    LEFT JOIN [dbo].[chantier] c ON c.[id] = m.[codeAffaire]
    LEFT JOIN [dbo].[DAF_RIB_ATNER] b ON b.[id] = m.[natissementBankId]
    WHERE m.[id] = @id
  `,

  create: `
    INSERT INTO [dbo].[DAF_Marche]
      ([numero]
      ,[codeAffaire]
      ,[objet]
      ,[partenaire]
      ,[client]
      ,[montant]
      ,[natissementBankId]
      ,[dateMES]
      ,[delai]
      ,[bailleur]
      ,[statut]
      ,[dateRP]
      ,[PV_RP]
      ,[dateRD]
      ,[PV_RD]
      ,[tauxTva]
      ,[createdBy])
    OUTPUT inserted.id
    VALUES
      (@numero
      ,@codeAffaire
      ,@objet
      ,@partenaire
      ,@client
      ,@montant
      ,@natissementBankId
      ,@dateMES
      ,@delai
      ,@bailleur
      ,@statut
      ,@dateRP
      ,@PV_RP
      ,@dateRD
      ,@PV_RD
      ,@tauxTva
      ,@createdBy)
  `,

  update: `
    UPDATE [dbo].[DAF_Marche]
    SET
      [numero] = @numero,
      [codeAffaire] = @codeAffaire,
      [objet] = @objet,
      [partenaire] = @partenaire,
      [client] = @client,
      [montant] = @montant,
      [natissementBankId] = @natissementBankId,
      [dateMES] = @dateMES,
      [delai] = @delai,
      [bailleur] = @bailleur,
      [statut] = @statut,
      [dateRP] = @dateRP,
      [PV_RP] = @PV_RP,
      [dateRD] = @dateRD,
      [PV_RD] = @PV_RD,
      [tauxTva] = @tauxTva,
      [updatedBy] = @updatedBy,
      [updatedAt] = GETDATE()
    WHERE [id] = @id
  `,
};
