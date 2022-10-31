exports.Fournisseurs = {
  getAllFournisseurs: `SELECT * FROM DAF_FOURNISSEURS WHERE 1=1`,
  getFournisseursCount: `SELECT COUNT(*) as count FROM DAF_FOURNISSEURS`,
  RibsFournisseurValid: `select f.nom, rf.* from [ATNER_DW].[dbo].[DAF_FOURNISSEURS] f, [ATNER_DW].[dbo].[DAF_RIB_Fournisseurs] rf
  where f.id = rf.FournisseurId and rf.validation = 'Validé'`,
  FournisseursRibValid: `SELECT f.*, rf.rib, rf.validation FROM  [dbo].[DAF_FOURNISSEURS] f, [dbo].[DAF_RIB_Fournisseurs] rf 
  where f.id = rf.id
  AND rf.validation = 'validé'`,
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
  ribfournisseursvalid: `SELECT * FROM [dbo].[DAF_RIB_Fournisseurs] 
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
};

exports.factures = {
  getCount: `SELECT COUNT(*) as count FROM [dbo].[DAF_FA_VC]`,
  getAll: `SELECT * FROM [dbo].[DAF_FA_VC] where 1=1 `,
  getOne: `SELECT * FROM [dbo].[DAF_FA_VC] where id=@id`,
  getAllFactures: `SELECT * FROM [dbo].[DAF_FA_VC]
  order by nom , datedoc `,
};
