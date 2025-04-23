exports.TMPFournisseurs = {
  getCountTmpFournisseur: `
    SELECT count(*) as count
    FROM [dbo].[DAF_TMP_FOURNISSEURS]
    WHERE 1=1`,

  createTmpFournisseur: `
    INSERT INTO [dbo].[DAF_TMP_FOURNISSEURS]
            ([nom]
            ,[Redacteur]
            ,[catFournisseur])
        VALUES
            (@nom
            ,@Redacteur
            ,@catFournisseur)`,

  getAllTmpFournisseurs: `
    SELECT [id]
        ,[nom]
        ,[Redacteur]
        ,[Validateur]             
        ,[dateCreation]
        ,[dateValidation]
        ,[catFournisseur]
        ,[etat]
    FROM [dbo].[DAF_TMP_FOURNISSEURS]
    WHERE 1=1
    `,
  getOneTmpFournisseurs: `
    SELECT [id]
        ,[nom]
        ,[Redacteur]
        ,[Validateur]
        ,[dateCreation]
        ,[dateValidation]
        ,[catFournisseur]
        ,[etat]
    FROM [dbo].[DAF_TMP_FOURNISSEURS]
    WHERE id = @id
    `,

  updateTmpFournisseur: `
    UPDATE DAF_TMP_FOURNISSEURS
        SET [etat] = @etat
        ,[Validateur] = @validateur
        ,[dateValidation] = GETDATE()
    WHERE id = @id
    `,
};
