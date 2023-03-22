exports.Fournisseurs = {
  getAllFournisseurs: `SELECT * FROM DAF_FOURNISSEURS WHERE 1=1`,
  getFournisseursCount: `SELECT COUNT(*) as count FROM DAF_FOURNISSEURS`,
  createFournisseur: `INSERT INTO DAF_FOURNISSEURS( CodeFournisseur, nom )
     VALUES( @codeFournisseur, @nom )`,
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
  FROM [dbo].[DAF_Order_virements_test]
  where datecreation like '%${new Date().getFullYear()}%'`,
  getCount: `SELECT COUNT(*) as count FROM [dbo].[DAF_Order_virements_test]`,
  create: `INSERT INTO [dbo].[DAF_Order_virements_test]
           ([id],
            [directeursigne]
           ,[ribAtner]
          )
     VALUES
           (@id,
            @directeursigne
           ,@ribAtner
           )`,
  getAll: `SELECT  ov.*, ra.nom, ra.rib
  FROM [dbo].[DAF_Order_virements_test] ov,[dbo].[DAF_RIB_ATNER] ra
  where ov.ribAtner = ra.id `,
  getOne: `SELECT  ov.*, ra.nom, ra.rib
  FROM [dbo].[DAF_Order_virements_test] ov,[dbo].[DAF_RIB_ATNER] ra
  where ov.ribAtner = ra.id and ov.id = @id`,
  update: `UPDATE [dbo].[DAF_Order_virements_test]
   SET [ribAtner] = @ribAtner,
   [directeursigne]=@directeursigne
      ,[etat] = @etat
  WHERE id = @id`,
  orderVirementsEnCours: `SELECT * FROM [dbo].[DAF_Order_virements_test]
  WHERE etat = 'En cours'`,
  orderVirementsEtat: `SELECT * FROM [dbo].[DAF_Order_virements_test]
  WHERE etat in('En cours')
  and total <> 0`,
  AddToTotal:
    "update [DAF_Order_virements_test] set total = total+@montantVirement where id =@id",
  MiunsFromTotal:
    "update [DAF_Order_virements_test] set total = total-@montantVirement where id =@id",
  getHeaderPrint: `SELECT  ov.*, ra.nom, ra.rib
  FROM [dbo].[DAF_Order_virements_test] ov,[dbo].[DAF_RIB_ATNER] ra
  where ov.ribAtner = ra.id and ov.id = @ovId`,
  getBodyPrint: `
      SELECT v.[id]
      ,[orderVirementId]
      ,f.nom
      ,rf.rib
      ,[montantVirement],
      v.Etat
  FROM  [dbo].[DAF_VIREMENTS_test] v ,
      [dbo].[DAF_RIB_Fournisseurs] rf,
      [dbo].[DAF_FOURNISSEURS] f
  where v.fournisseurId = f.id
    and v.ribFournisseurId = rf.id
    and Etat = 'En cours'
    and [orderVirementId] = @ovId`,
  updateVirements: `update [dbo].[DAF_VIREMENTS_test] set Etat = 'Reglee'
                      where orderVirementId = @id`,

  updateLogFacture: `update [dbo].[DAF_LOG_FACTURE_test] set Etat = 'Reglee'
                        where orderVirementId = @id`,

  updateDateExecution: `update [dbo].[DAF_Order_virement_tests] set dateExecution = GETDATE()
                            where id = @id`,

  updateVirementsAnnuler: `update [dbo].[DAF_LOG_FACTURE_test] set Etat = 'Annuler'
                      where orderVirementId = @id`,

  updateLogFactureAnnuler: `update [dbo].[DAF_LOG_FACTURE_test] set Etat = 'Annulé'
                        where orderVirementId = @id`,
  updateordervirementAnnuler: `update [dbo].[DAF_Order_virements_tests] set Etat = 'Annule' ,
                        total = 0
                        where id = @id`,
};

exports.factures = {
  getCount: `SELECT COUNT(*) as count FROM [dbo].[DAF_FA_VC]`,
  getAll: `SELECT * FROM [dbo].[DAF_FA_VC] where 1=1 `,
  getOne: `SELECT * FROM [dbo].[DAF_FA_VC] where id=@id`,
  getAllFactures: `SELECT * FROM [dbo].[DAF_FA_VC]
  order by nom , datedoc `,
  getfacturebyfournisseurid: `Select fa.* from [dbo].[DAF_FOURNISSEURS] f,[dbo].[Daf_facture_fusionner] fa

  where
  f.id=@id and
  fa.CODEDOCUTIL not in (SELECT  CODEDOCUTIL
  FROM [ATNER_DW].[dbo].[DAF_LOG_FACTURE_test]
  WHERE [etat] in ('En cours','Reglee' ))
   and  fa.nom=f.nom
  order by fa.DateFacture`,
};

exports.virements = {
  // sumFacture: `
  // SELECT  SUM(netapayer) as netapayer
  // FROM(
  //   select sum(NETAPAYER) as netapayer from [ATNER_DW].[dbo].[DAF_FA_VC]
  //   where MontantFacture is null
  //   and id in (@facturelistString)
  //       UNION ALL
  //   select sum(MontantFacture) as netapayer from [ATNER_DW].[dbo].[DAF_FA_VC]
  //   where MontantFacture is not null
  //   and id in (@facturelistString)
  //   ) sum `,
  create: `
  INSERT INTO [dbo].[DAF_VIREMENTS_TEST]
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
  getCount: "SELECT COUNT(*) as count FROM [dbo].[DAF_VIREMENTS_TEST]",
  getAll: `
  SELECT v.[id]
      ,[orderVirementId]
      ,f.nom
      ,rf.rib
      ,[montantVirement],
      v.Etat,
      v.dateoperation
  FROM  [dbo].[DAF_VIREMENTS_TEST] v ,
      [dbo].[DAF_RIB_Fournisseurs] rf,
      [dbo].[DAF_FOURNISSEURS] f
  where v.fournisseurId = f.id
    and v.ribFournisseurId = rf.id
    and 1=1
  `,
  getDataFromLogFacture: `SELECT * FROM [ATNER_DW].[dbo].[Daf_facture_fusionner] where 1=1 `,
  createLogFacture: `
 INSERT INTO [dbo].[DAF_LOG_FACTURE_test]
           ([CODEDOCUTIL]
           ,[CODECHT]
            ,[NOM]
           ,[LIBREGLEMENT]
           ,[DATEDOC]
           ,[TOTALTTC]
           ,[TOTHTNET]
           ,[TOTTVANET]
           ,[NETAPAYER]
           ,[orderVirementId])
     VALUES`,
  update: `Update [dbo].[DAF_VIREMENTS_TEST]
            set Etat=@Etat,
            dateOperation=@dateOperation
            where id=@id`,
  getOne: `
  SELECT v.[id]
      ,[orderVirementId]
      ,f.nom
      ,rf.rib
      ,[montantVirement],
      v.Etat
  FROM  [dbo].[DAF_VIREMENTS_TEST] v ,
      [dbo].[DAF_RIB_Fournisseurs] rf,
      [dbo].[DAF_FOURNISSEURS] f
  where v.fournisseurId = f.id
    and v.ribFournisseurId = rf.id
    and v.[id] = @id
 `,

  updateLogFactureWhenAnnuleV:
    "update [dbo].[DAF_LOG_FACTURE_test] set Etat = 'Annulé' where [orderVirementId] =@orderVirementId and nom=@nom",
};

exports.logFactures = {
  getLogFactureCount: `SELECT COUNT(*) as count FROM [dbo].[DAF_LOG_FACTURE_test]
       where
      NETAPAYER<>0
    `,
  getLogFactures: `SELECT * FROM [dbo].[DAF_LOG_FACTURE_test] where 1=1 and

      NETAPAYER<>0`,
};
exports.chantiers = {
  getChantiers: "select * from chantier where  CODEAFFAIRE is  not null",
  getcountChantier:
    "select count(*) from chantier where  CODEAFFAIRE is  not null",
};

exports.factureres = {
  getfactureres: `select
f.id,
f.fullName
,f.numeroFacture
,f.BonCommande
,f.TTC,
f.createdDate
,f.DateFacture
,f.HT
,f.MontantTVA,
d.designation as "designation" ,
fou.nom as "nom",
fou.CodeFournisseur,
f.verifiyMidelt,
f.updatedBy
FROM [dbo].[factureresptionne] f
inner join [dbo].[FactureDesignation] d on d.id=f.iddesignation
inner join   [dbo].[DAF_FOURNISSEURS] fou on fou.id=f.idfournisseur
where deletedAt is null`,
  getcountfactureres: `
SELECT COUNT(*) as count
FROM [dbo].[factureresptionne] f
inner join [dbo].[FactureDesignation] d on d.id=f.iddesignation
inner join   [dbo].[DAF_FOURNISSEURS] fou on fou.id=f.idfournisseur
where deletedAt is null`,
  createfacture: `INSERT INTO [dbo].[factureresptionne](
  [numeroFacture]
,[BonCommande]
,[TTC]
,[idfournisseur]
,[DateFacture]
,[iddesignation]
,[fullName]
)
  values  (
     @numeroFacture
    ,@BonCommande
    ,@TTC
    ,@idfournisseur
    ,@DateFacture
    ,@iddesignation
    ,@fullName
    )`,
  getOne: `select
f.id,
f.fullName
,f.numeroFacture
,f.BonCommande
,f.TTC
,f.DateFacture

,f.HT
,f.MontantTVA,
d.designation as "designation" ,
fou.nom as "nom",
fou.CodeFournisseur,
f.verifiyMidelt
FROM [dbo].[factureresptionne] f
inner join [dbo].[FactureDesignation] d on d.id=f.iddesignation
inner join   [dbo].[DAF_FOURNISSEURS] fou on fou.id=f.idfournisseur
where deletedAt is null and f.id=@id`,
  alreadyexist:
    "select count(*) from  [dbo].[factureresptionne] where numeroFacture =@numeroFacture and BonCommande =@BonCommande",
  delete: `UPDATE [dbo].[factureresptionne]
SET  deletedAt=getDate(),
numeroFacture='----'+CAST(id as varchar(20))  +'----'
WHERE id = @id `,

  edit: `UPDATE [dbo].[factureresptionne]
SET  deletedAt=getDate(),
numeroFacture='----'+CAST(id as varchar(20))  +'----'
WHERE id = @id `,
  getfacturebyfournisseurnom: `select * from [dbo].[factureresptionne]
where deletedAt is null and idfournisseur
 in(select id from [dbo].[DAF_FOURNISSEURS] where nom=@nom)
 `,
  gethistoriquefacture: `SELECT f.id
,f.numeroFacture
,f.BonCommande
,f.TTC
,f.DateFacture
,f.HT,
f.createdDate
,f.MontantTVA,
d.designation as "designation" ,
fou.nom as "nom",
fou.CodeFournisseur
FROM [dbo].[factureresptionne] f ,  [dbo].[FactureDesignation] d,
[dbo].[DAF_FOURNISSEURS] fou
where d.id=f.iddesignation  and fou.id=f.idfournisseur  and deletedAt is  not null `,

  gethistoriquefacturecount: `SELECT COUNT(*) as count
FROM [dbo].[factureresptionne] f ,  [dbo].[FactureDesignation] d,
[dbo].[DAF_FOURNISSEURS] fou
where d.id=f.iddesignation  and fou.id=f.idfournisseur  and deletedAt is  not null `,
  getfacturebyfournisseur: `select f.* from [dbo].[factureresptionne] f,
[dbo].[DAF_factureNavette] fn
   where
   fn.idFacture=f.id   and
   f.id not in (select facture from DAF_LOG_FACTURE_paye)
   and

  and idfournisseur in(select id from [dbo].[DAF_FOURNISSEURS] where id=@id)`,
  getfacturevalider: `select
  f.id,
  f.fullName
  ,f.numeroFacture
  ,f.BonCommande
  ,f.TTC
  ,f.DateFacture

  ,f.HT
  ,f.MontantTVA,
  d.designation as "designation" ,
  fou.nom as "nom",
  fou.CodeFournisseur,
  f.verifiyMidelt,
  f.createdDate
  FROM [dbo].[factureresptionne] f

  inner join [dbo].[FactureDesignation] d on d.id=f.iddesignation
  inner join   [dbo].[DAF_FOURNISSEURS] fou on fou.id=f.idfournisseur
  where deletedAt is null and f.verifiyMidelt is null`,
  getcountvalider: `SELECT COUNT(*) as count FROM [dbo].[factureresptionne] where deletedAt is null and verifiyMidelt is null`,

  validerfacture: `UPDATE [dbo].[factureresptionne]
  SET  verifiyMidelt=@verifiyMidelt,
  updatedBy=@updatedBy,
  BonCommande=@BonCommande
WHERE id = @id `,
};
exports.factureFicheNavette = {
  create: `INSERT INTO [dbo].[DAF_factureNavette]
  ([codechantier],
    [idFacture],
    [ficheNavette])
  VALUES (@codechantier,@idFacture,@ficheNavette) `,

  get: `seLECT fn.idfacturenavette as id
  ,f.numeroFacture
  ,f.BonCommande
  ,f.TTC
  ,f.DateFacture
  ,f.HT,ch.LIBELLE as "chantier"
  ,f.MontantTVA,
  d.designation as "designation" ,
  fou.nom as "nom",
  fn.ficheNavette as "ficheNavette",
  fou.CodeFournisseur
  FROM [dbo].[factureresptionne] f ,  [dbo].[FactureDesignation] d,
  [dbo].[DAF_FOURNISSEURS] fou,[dbo].[DAF_factureNavette] fn , [dbo].[chantier] ch
  where d.id=f.iddesignation  and fou.id=f.idfournisseur
and fn.codechantier=ch.CODEAFFAIRE
  and f.id=fn.idFacture
  and deletedAt is null `,

  getCount: `seLECT COUNT(*) as count
  FROM [dbo].[factureresptionne] f ,  [dbo].[FactureDesignation] d,
  [dbo].[DAF_FOURNISSEURS] fou,[dbo].[DAF_factureNavette] fn , [dbo].[chantier] ch
  where d.id=f.iddesignation  and fou.id=f.idfournisseur
and fn.codechantier=ch.CODEAFFAIRE
  and f.id=fn.idFacture
  and deletedAt is   null `,
  getOne: `seLECT fn.idfacturenavette as id
  ,f.numeroFacture
  ,f.BonCommande
  ,f.TTC
  ,f.DateFacture
  ,f.HT,ch.LIBELLE as "chantier"
  ,f.MontantTVA,
  d.designation as "designation" ,
  fou.nom as "nom",
  fn.ficheNavette as "ficheNavette",
  fou.CodeFournisseur
  FROM [dbo].[factureresptionne] f ,  [dbo].[FactureDesignation] d,
  [dbo].[DAF_FOURNISSEURS] fou,[dbo].[DAF_factureNavette] fn , [dbo].[chantier] ch
  where d.id=f.iddesignation  and fou.id=f.idfournisseur
and fn.codechantier=ch.CODEAFFAIRE
  and f.id=fn.idFacture
  and deletedAt is null
  and fn.idfacturenavette=@id`,
  update: `update [dbo].[DAF_factureNavette]
      set ficheNavette=@ficheNavette
      where idfacturenavette=@id`,
};

exports.designation = {
  getdesignationCount:
    "SELECT COUNT(*) as count FROM [dbo].[FactureDesignation]",
  getDesignation: "SELECT * FROM [dbo].[FactureDesignation] where 1=1 ",
  getdesignationbynom: `SELECT *
     FROM [dbo].[FactureDesignation]
     where id=@id `,
};
exports.all = {
  getAll: `select distinct f.id as id , f.BonCommande,f.DateFacture,f.nom as "fournisseur",f.CodeFournisseur,
  f.HT,f.TTC, f.MontantTVA,f.numeroFacture,f.verifiyMidelt,
  f.designation ,f.ficheNavette , f.codechantier,f.dateExecution as "Dateexecution",
  f.ribAtner, f.etat, f.total,
  f.orderVirementId,f.chantier,p.dateOperation,p.Etat,
  rf.rib,awt.nom as "banque"
  from faovchantier  f
left join (SElect * from DAF_RIB_ATNER) awt ON awt.id =f.ribAtner
left join (select * from DAF_VIREMENTS_test ) p on p.orderVirementId=f.orderVirementId
left join (select * from DAF_RIB_Fournisseurs) rf on rf.FournisseurId=f.idfournisseur
where f.numeroFacture not like '%-%'`,

  getAllcount: `
    select count(*) as count
    from faovchantier  f
    left join DAF_RIB_ATNER awt on f.ribAtner=awt.id
    left join DAF_VIREMENTS_test p on p.orderVirementId=f.orderVirementId
    left join DAF_RIB_Fournisseurs rf on rf.FournisseurId=f.idfournisseur
    where
     f.numeroFacture not like '%-%'
    `,
};
