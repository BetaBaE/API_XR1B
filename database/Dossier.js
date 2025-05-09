exports.Dossier = {
  getAll: `
        SELECT *
        FROM [DAF_Dossier]
        where 1=1
    `,

  getCount: `
            SELECT COUNT(*) AS count 
            FROM [DAF_Dossier]
        `,

  create: `
        INSERT INTO [dbo].[DAF_Dossier]
           ([Libele]
           ,[idFournisseur]
           ,[Redacteur]
           ,[NumDossier])
     VALUES
           (@Libele
           ,@idFournisseur
           ,@Redacteur
           ,@NumDossier)
    `,
};
