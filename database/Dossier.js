exports.Dossier = {
  getCountByYear: `
    select count(*)+1 num 
    from DAF_Dossier
    where YEAR(dateCreation) = YEAR(GETDATE())
    `,
  getAll: `
    SELECT d.[id]
        ,[Libele]
        ,f.nom
        ,d.[dateCreation]
        ,[MontantHtTotal]
        ,d.[Redacteur]
        ,[NumDossier]
        ,d.Etat
    FROM [DAF_Dossier] d left join DAF_FOURNISSEURS f on d.idFournisseur = f.id
    where 1 = 1
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

  getOne: `
    SELECT d.[id]
        ,[Libele]
        ,f.nom
        ,d.[dateCreation]
        ,[MontantHtTotal]
        ,d.[Redacteur]
        ,[NumDossier]
        ,d.[idFournisseur]
         ,d.Etat
    FROM [DAF_Dossier] d left join DAF_FOURNISSEURS f on d.idFournisseur = f.id
        where d.[id] = @id
  `,
  update: `
    UPDATE [dbo].[DAF_Dossier]
    SET [Etat] = @Etat
    WHERE id = @id
  `,
  getFournisseurByIdDossier: `
    SELECT 
        f.id,
        f.nom as name
    FROM [DAF_Dossier] d left join DAF_FOURNISSEURS f
    on d.idFournisseur = f.id
    where  d.id = @id
  `,
};
