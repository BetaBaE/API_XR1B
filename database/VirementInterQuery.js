exports.virementsInter = {
  create: `
    INSERT INTO [dbo].[DAF_VIREMENTS_INTER]
        (
         [fournisseurId]
        ,[ribFournisseurId]
        ,[interOrderVirementId]
        ,[montantDevise]
        ,[Redacteur]
        ,[dateCreation]
        )
    VALUES
        (
         @fournisseurId
        ,@ribFournisseurId
        ,@interOrderVirementId
        ,@montantDevise
        ,@Redacteur
        ,getdate()
        )
  `,

  CheckedFournisseurDejaExiste: `  
    select count(*) 
    from DAF_VIREMENTS_INTER
    where ribFournisseurId=@ribFournisseurId
  `,

  getCount: "SELECT COUNT(*) as count FROM [dbo].[DAF_VIREMENTS_INTER]",

  getAll: `
    SELECT v.[id]
        ,[interOrderVirementId]
        ,f.nom
        ,rf.rib
        ,[montantDevise]
        ,v.Etat
        ,v.dateoperation
    FROM  [dbo].[DAF_VIREMENTS_INTER] v
        ,[dbo].[DAF_RIB_Fournisseurs] rf
        ,[dbo].[DAF_FOURNISSEURS] f
    where v.fournisseurId = f.id
      and v.ribFournisseurId = rf.id
      and 1=1
  `,

  getDataFromLog: `SELECT * FROM [dbo].[DAF_FactureDevise] where 1=1 `,

  createLog: `
   INSERT INTO [dbo].[DAF_LOG_INTER]
             ([idFacture]
             ,[idfournisseur]
             ,[NomFournisseur]
             ,[IdViremenetInter]
             ,[TOTALDevise]
             ,[NETAPAYERDEVISE]
             ,[etat]
             ,[modepaiement]
             ,[DateCreation]
             )             
       VALUES
  `,

  update: `Update [dbo].[DAF_VIREMENTS_INTER]
              set Etat=@Etat,
              DateOperation=@DateOperation
              where id=@id
  `,

  getOne: `
    SELECT v.[id]
        ,[interOrderVirementId]
        ,f.nom
        ,rf.rib
        ,[montantDevise]
        ,v.Etat
        ,v.DateOperation
    FROM  [dbo].[DAF_VIREMENTS_INTER] v
        ,[dbo].[DAF_RIB_Fournisseurs] rf
        ,[dbo].[DAF_FOURNISSEURS] f
    where v.fournisseurId = f.id
      and v.ribFournisseurId = rf.id
      and v.[id] = @id
  `,

  updateLogWhenAnnule: `
    update [dbo].[DAF_LOG_INTER] 
    set etat = 'Annuler'
    where [IdViremenetInter] = @interOrderVirementId
    and NomFournisseur=@nom
  `,

  updateLogWhenReglee: `
    update [dbo].[DAF_LOG_INTER]
    set etat='Reglee', 
    DateOperation=@dateOperation
    where IdViremenetInter = @interOrderVirementId
    and NomFournisseur=@nom
    and etat <> 'Annuler'
  `,
};
