exports.Fournisseurs = {
  getAllFournisseurs: `SELECT * FROM DAF_FOURNISSEURS WHERE 1=1`,
  getFournisseursCount: `SELECT COUNT(*) as count FROM DAF_FOURNISSEURS`,
  RibsFournisseurValid: `select f.nom, rf.* from [ATNER_DW].[dbo].[DAF_FOURNISSEURS] f, [ATNER_DW].[dbo].[DAF_RIB_Fournisseurs] rf
  where f.id = rf.FournisseurId and rf.validation = 'Validé'`,
  FournisseursRibValid: `SELECT f.CodeFournisseur, f.nom, rf.* FROM  [dbo].[DAF_FOURNISSEURS] f, [dbo].[DAF_RIB_Fournisseurs] rf 
  where f.id = rf.FournisseurId
  AND rf.validation = 'validé' AND f.nom not in (SELECT
 distinct [NOM]   
  FROM [ATNER_DW].[dbo].[DAF_LOG_FACTURE] WHERE etat!='Annulé'  and orderVirementId =@ovId)`,
};

exports.ribTemporaire = {
  getRibs: `SELECT rt.*, f.nom as fournisseur FROM DAF_RIB_TEMPORAIRE rt, DAF_FOURNISSEURS f WHERE rt.fournisseurid = f.id AND  1=1`,
  getRibCount: `SELECT COUNT(*) as count FROM DAF_RIB_TEMPORAIRE`,
  createRibs: `INSERT INTO DAF_RIB_TEMPORAIRE( FournisseurId,rib )
     VALUES( @FournisseurId,@rib )`,
};

exports.ribFournisseur = {
  create: `INSERT INTO [dbo].[DAF_RIB_Fournisseurs]
           ([FournisseurId]
           ,[rib]
           )
     VALUES
           (@FournisseurId,
           @rib
          )`,
  getAll: `SELECT rf.*, f.nom as fournisseur FROM [dbo].[DAF_RIB_Fournisseurs] rf, DAF_FOURNISSEURS f   WHERE rf.fournisseurid = f.id AND  1=1`,
  getCount: `SELECT COUNT(*) as count FROM [dbo].[DAF_RIB_Fournisseurs]`,
  edit: `UPDATE [dbo].[DAF_RIB_Fournisseurs]
      SET FournisseurId = @FournisseurId
      ,rib = @rib
      ,validation = @validation
    WHERE id = @id `,
  getOne: `SELECT rf.*, f.nom as fournisseur FROM [dbo].[DAF_RIB_Fournisseurs] rf, DAF_FOURNISSEURS f   WHERE rf.fournisseurid = f.id AND  rf.id = @id`,
  RibsValid: `select * from [ATNER_DW].[dbo].[DAF_RIB_Fournisseurs] where validation = 'Validé'`,
  ribfournisseursvalid: `distinct SELECT * FROM [dbo].[DAF_RIB_Fournisseurs] 
  where validation = 'validé'`,
};

exports.ribAtner = {
  getAll: `SELECT * FROM [dbo].[DAF_RIB_ATNER]`,
  getCount: `SELECT COUNT(*) as count FROM [dbo].[DAF_RIB_ATNER]`,
  create: `INSERT INTO [dbo].[DAF_RIB_ATNER]
           ([nom]
           ,[rib])
     VALUES
           (@nom
           ,@rib)`,
  update: `UPDATE [dbo].[DAF_RIB_ATNER]
   SET [nom] = @nom
      ,[rib] = @rib
 WHERE id = @id `,
  getOne: `SELECT * FROM [dbo].[DAF_RIB_ATNER] WHERE id = @id`,
};

exports.Users = {
  create: `INSERT INTO [dbo].[DAF_USER]
            ([fullname]
            ,[username]
            ,[Role]
            ,[hached_password]
            ,[salt])
           VALUES
            (@fullname
            ,@username
            ,@Role
            ,@hached_password
            ,@salt)`,

  update: `UPDATE [dbo].[DAF_USER]
    SET [fullname] = @fullname
      ,[username] = @username
      ,[Role] = @Role
      ,[isActivated] = @isActivated
    WHERE id = @id`,
  getCount: `SELECT COUNT(*) as count FROM [dbo].[DAF_USER]`,
  getAll: `SELECT * FROM [dbo].[DAF_USER] where 1=1 `,
  getOne: `SELECT * FROM [dbo].[DAF_USER] WHERE id = @id`,
  getOneUsename: `SELECT * FROM [dbo].[DAF_USER] WHERE username = @username`,
};

exports.ordervirements = {
  getCountByYear: `SELECT  COUNT(*) +1 as count
  FROM [dbo].[DAF_Order_virements] 
  where datecreation like '%${new Date().getFullYear()}%'`,
  getCount: `SELECT COUNT(*) as count FROM [dbo].[DAF_Order_virements]`,
  create: `INSERT INTO [dbo].[DAF_Order_virements]
           ([id]
           ,[ribAtner]
          )
     VALUES
           (@id
           ,@ribAtner
           )`,
  getAll: `SELECT  ov.*, ra.nom, ra.rib
  FROM [dbo].[DAF_Order_virements] ov,[dbo].[DAF_RIB_ATNER] ra
  where ov.ribAtner = ra.id `,
  getOne: `SELECT  ov.*, ra.nom, ra.rib
  FROM [dbo].[DAF_Order_virements] ov,[dbo].[DAF_RIB_ATNER] ra
  where ov.ribAtner = ra.id and ov.id = @id`,
  update: `UPDATE [dbo].[DAF_Order_virements]
   SET [ribAtner] = @ribAtner
      ,[etat] = @etat
  WHERE id = @id`,
  orderVirementsEnCours: `SELECT * FROM [dbo].[DAF_Order_virements]
  WHERE etat = 'En cours'`,
  orderVirementsEtat: `SELECT * FROM [dbo].[DAF_Order_virements]
  WHERE etat in('En cours')
  and total <> 0`,
  AddToTotal:
    "update [DAF_Order_virements] set total = total+@montantVirement where id =@id",
  MiunsFromTotal:
    "update [DAF_Order_virements] set total = total-@montantVirement where id =@id",
  getHeaderPrint: `SELECT  ov.*, ra.nom, ra.rib
  FROM [dbo].[DAF_Order_virements] ov,[dbo].[DAF_RIB_ATNER] ra
  where ov.ribAtner = ra.id and ov.id = @ovId`,
  getBodyPrint: `
      SELECT v.[id]
      ,[orderVirementId]
      ,f.nom
      ,rf.rib
      ,[montantVirement],
      v.Etat
  FROM  [dbo].[DAF_VIREMENTS] v ,
      [dbo].[DAF_RIB_Fournisseurs] rf, 
      [dbo].[DAF_FOURNISSEURS] f
  where v.fournisseurId = f.id 
    and v.ribFournisseurId = rf.id 
    and Etat = 'En cours'
    and [orderVirementId] = @ovId`,
  updateVirements: `update [dbo].[DAF_VIREMENTS] set Etat = 'Reglee' 
                      where orderVirementId = @id`,

  updateLogFacture: `update [dbo].[DAF_LOG_FACTURE] set Etat = 'Reglee' 
                        where orderVirementId = @id`,

  updateDateExecution: `update [dbo].[DAF_Order_virements] set dateExecution = GETDATE() 
                            where id = @id`,
};

exports.factures = {
  getCount: `SELECT COUNT(*) as count FROM [dbo].[DAF_FA_VC]`,
  getAll: `SELECT * FROM [dbo].[DAF_FA_VC] where 1=1 `,
  getOne: `SELECT * FROM [dbo].[DAF_FA_VC] where id=@id`,
  getAllFactures: `SELECT * FROM [dbo].[DAF_FA_VC]
  order by nom , datedoc `,
  getfacturebyfournisseurid: `Select fa.* from [dbo].[DAF_FOURNISSEURS] f,[dbo].[DAF_FA_VC] fa
  where f.nom = fa.nom
  and f.id=@id
  and fa.id not in (SELECT [CODEDOCUTIL]
  FROM [ATNER_DW].[dbo].[DAF_LOG_FACTURE]
  WHERE [etat] in ('En cours','Validé' ))
  order by fa.DATEDOC`,
};

exports.virements = {
  sumFacture: `select SUM(NETAPAYER) as Totale from [dbo].[DAF_FA_VC]
where 1=1 `,
  create: `
  INSERT INTO [dbo].[DAF_VIREMENTS]
      (
       [fournisseurId]
      ,[ribFournisseurId]
      ,[orderVirementId]
      ,[montantVirement])
  VALUES
      (
       @fournisseurId
      ,@ribFournisseurId
      ,@orderVirementId
      ,@montantVirement
      )`,
  getCount: "  SELECT COUNT(*) as count FROM [dbo].[DAF_VIREMENTS]",
  getAll: `
  SELECT v.[id]
      ,[orderVirementId]
      ,f.nom
      ,rf.rib
      ,[montantVirement],
      v.Etat
  FROM  [dbo].[DAF_VIREMENTS] v ,
      [dbo].[DAF_RIB_Fournisseurs] rf, 
      [dbo].[DAF_FOURNISSEURS] f
  where v.fournisseurId = f.id 
    and v.ribFournisseurId = rf.id 
    and 1=1 
  `,
  getDataFromLogFacture: `SELECT * FROM [ATNER_DW].[dbo].[DAF_VIEW_FACTURE] where 1=1 `,
  createLogFacture: `
  INSERT INTO [dbo].[DAF_LOG_FACTURE]
           ([CODEDOCUTIL]
           ,[CODECHT]
           ,[DATEDOC]
           ,[NOM]
           ,[LIBREGLEMENT]
           ,[TOTALTTC]
           ,[TOTHTNET]
           ,[NETAPAYER]
           ,[TOTTVANET]
           ,[orderVirementId])
     VALUES `,
  update: `Update [dbo].[DAF_VIREMENTS] set Etat=@Etat where id=@id`,
  getOne: `
  SELECT v.[id]
      ,[orderVirementId]
      ,f.nom
      ,rf.rib
      ,[montantVirement],
      v.Etat
  FROM  [dbo].[DAF_VIREMENTS] v ,
      [dbo].[DAF_RIB_Fournisseurs] rf, 
      [dbo].[DAF_FOURNISSEURS] f
  where v.fournisseurId = f.id 
    and v.ribFournisseurId = rf.id 
    and v.[id] = @id
 `,

  updateLogFactureWhenAnnuleV:
    "update [dbo].[DAF_LOG_FACTURE] set Etat = 'Annulé' where [orderVirementId] =@orderVirementId and nom=@nom",
};

exports.logFactures = {
  getLogFactureCount: "SELECT COUNT(*) as count FROM [dbo].[DAF_LOG_FACTURE]",
  getLogFactures: "SELECT * FROM [dbo].[DAF_LOG_FACTURE] where 1=1 ",
};
