exports.FactureClient = {
  getCount: `
    SELECT COUNT(*) AS count
    FROM [dbo].[DAF_FactureClient] fc
    LEFT JOIN [dbo].[DAF_Marche] m ON m.[id] = fc.[idMarche]
    WHERE 1 = 1
  `,

  getAll: `
    SELECT
      fc.[id],
      fc.[idMarche],
      fc.[numeroFacture],
      fc.[dateFacture],
      fc.[HT],
      fc.[Tva],
      fc.[TTC],
      fc.[RestitAccompte],
      fc.[retenueGarantie1],
      fc.[retenueGarantie2],
      fc.[CautionRG],
      fc.[idCautionRG],
      fc.[Penalite],
      fc.[Approvisionnement],
      fc.[revPrix],
      fc.[netTTC],
      fc.[etat],
      fc.[createdBy],
      fc.[createdAt],
      fc.[updatedBy],
      fc.[updatedAt],
      m.[numero] AS marcheNumero,
      m.[codeAffaire],
      m.[tauxTva] AS marcheTauxTva,
      c.[numero] AS cautionNumero,
      ch.[LIBELLE] AS chantierLibelle
    FROM [dbo].[DAF_FactureClient] fc
    LEFT JOIN [dbo].[DAF_Marche] m ON m.[id] = fc.[idMarche]
    LEFT JOIN [dbo].[DAF_Caution] c ON c.[id] = fc.[idCautionRG]
    LEFT JOIN [dbo].[chantier] ch ON ch.[CODEAFFAIRE] = m.[codeAffaire]
    WHERE 1 = 1
  `,

  getOne: `
    SELECT
      fc.[id],
      fc.[idMarche],
      fc.[numeroFacture],
      fc.[dateFacture],
      fc.[HT],
      fc.[Tva],
      fc.[TTC],
      fc.[RestitAccompte],
      fc.[retenueGarantie1],
      fc.[retenueGarantie2],
      fc.[CautionRG],
      fc.[idCautionRG],
      fc.[Penalite],
      fc.[Approvisionnement],
      fc.[revPrix],
      fc.[netTTC],
      fc.[etat],
      fc.[createdBy],
      fc.[createdAt],
      fc.[updatedBy],
      fc.[updatedAt],
      m.[numero] AS marcheNumero,
      m.[codeAffaire],
      m.[tauxTva] AS marcheTauxTva,
      c.[numero] AS cautionNumero,
      ch.[LIBELLE] AS chantierLibelle
    FROM [dbo].[DAF_FactureClient] fc
    LEFT JOIN [dbo].[DAF_Marche] m ON m.[id] = fc.[idMarche]
    LEFT JOIN [dbo].[DAF_Caution] c ON c.[id] = fc.[idCautionRG]
    LEFT JOIN [dbo].[chantier] ch ON ch.[CODEAFFAIRE] = m.[codeAffaire]
    WHERE fc.[id] = @id
  `,

  getMarcheById: `
    SELECT [id], [numero], [codeAffaire], [tauxTva]
    FROM [dbo].[DAF_Marche]
    WHERE [id] = @idMarche
  `,

  getCautionById: `
    SELECT [id], [montant], [idMarche], [type]
    FROM [dbo].[DAF_Caution]
    WHERE [id] = @idCautionRG
  `,

  getCautionsDisponibles: `
    SELECT c.[id], c.[numero], c.[montant]
    FROM [dbo].[DAF_Caution] c
    WHERE c.[idMarche] = @idMarche
      AND c.[type] = 'CRG'
      AND c.[id] NOT IN (
        SELECT fc.[idCautionRG]
        FROM [dbo].[DAF_FactureClient] fc
        WHERE fc.[idCautionRG] IS NOT NULL
          AND fc.[etat] <> 'annulee'
          AND (@currentFactureId IS NULL OR fc.[id] <> @currentFactureId)
      )
    ORDER BY c.[numero] ASC
  `,

  getEtatById: `
    SELECT [id], [etat], [idMarche]
    FROM [dbo].[DAF_FactureClient]
    WHERE [id] = @id
  `,

  create: `
    INSERT INTO [dbo].[DAF_FactureClient]
      ([idMarche]
      ,[numeroFacture]
      ,[dateFacture]
      ,[HT]
      ,[Tva]
      ,[TTC]
      ,[RestitAccompte]
      ,[retenueGarantie1]
      ,[retenueGarantie2]
      ,[CautionRG]
      ,[idCautionRG]
      ,[Penalite]
      ,[Approvisionnement]
      ,[revPrix]
      ,[netTTC]
      ,[etat]
      ,[createdBy])
    OUTPUT inserted.id
    VALUES
      (@idMarche
      ,@numeroFacture
      ,@dateFacture
      ,@HT
      ,@Tva
      ,@TTC
      ,@RestitAccompte
      ,@retenueGarantie1
      ,@retenueGarantie2
      ,@CautionRG
      ,@idCautionRG
      ,@Penalite
      ,@Approvisionnement
      ,@revPrix
      ,@netTTC
      ,@etat
      ,@createdBy)
  `,

  update: `
    UPDATE [dbo].[DAF_FactureClient]
    SET
      [idMarche] = @idMarche,
      [numeroFacture] = @numeroFacture,
      [dateFacture] = @dateFacture,
      [HT] = @HT,
      [Tva] = @Tva,
      [TTC] = @TTC,
      [RestitAccompte] = @RestitAccompte,
      [retenueGarantie1] = @retenueGarantie1,
      [retenueGarantie2] = @retenueGarantie2,
      [CautionRG] = @CautionRG,
      [idCautionRG] = @idCautionRG,
      [Penalite] = @Penalite,
      [Approvisionnement] = @Approvisionnement,
      [revPrix] = @revPrix,
      [netTTC] = @netTTC,
      [etat] = @etat,
      [updatedBy] = @updatedBy,
      [updatedAt] = GETDATE()
    WHERE [id] = @id
  `,
};
