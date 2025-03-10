exports.EcheanceFourniseur = {
  getCount: `
    select count(*) as count from DAF_EcheanceFournisseur
`,
  getAll: `
    select 
        e.id, 
        f.nom ,
        e.EcheanceJR,
        e.ConvJR 
    from DAF_EcheanceFournisseur e 
        left join DAF_FOURNISSEURS f on e.idfournisseur = f.id
    where 1=1
  `,
  getOne: `
  select 
        e.id, 
        f.nom ,
        e.idFournisseur,
        e.EcheanceJR,
        e.ConvJR 
    from DAF_EcheanceFournisseur e 
        left join DAF_FOURNISSEURS  f on e.idfournisseur = f.id
    where e.id = @id
  `,

  getOneByFournisseur: `
  select 
        e.id, 
        f.nom ,
        e.idFournisseur,
        e.EcheanceJR,
        e.ConvJR 
    from DAF_EcheanceFournisseur e 
        left join DAF_FOURNISSEURS  f on e.idfournisseur = f.id
    where f.id = @idf
  `,

  create: `
    INSERT INTO DAF_EcheanceFournisseur
            (
            [idFournisseur]
            ,[EcheanceJR]
            ,[ConvJR]
            )
        VALUES(
            @idFournisseur
            ,@EcheanceJR
            ,@ConvJR
            )
  `,
  update: `
    UPDATE [dbo].[DAF_EcheanceFournisseur]
    SET  [EcheanceJR] = @EcheanceJR
        ,[ConvJR] = @ConvJR
    WHERE id = @id
  `,
};
