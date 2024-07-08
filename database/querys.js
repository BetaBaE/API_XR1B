
exports.Fournisseurs = {
  getFournisseurClean: `select * from DAF_FOURNISSEURS
  where ICE is not null and catFournisseur is  not null
and Identifiantfiscal is not null`,
  getNomfournisseur: `select  nom from DAF_FOURNISSEURS where nom  LIKE '%'+@nom+'%'`, 
  getallfournisseurwithecheanceLoi:`
  select * from DAF_FOURNISSEURS
where id in(SELECT
      [idfournisseur]
  FROM [dbo].[DAF_echeanceloiFournisseur])
  `,  
  getAllFournisseurs: `SELECT fou.datecreation,fou.id,fou.Redacteur ,fou.addresse, fou.CodeFournisseur, fou.Identifiantfiscal, fou.ICE, fou.nom,
  fou.exonorer,
  echr.modalitePaiement as echeancereel , 
  echl.modalitePaiement as echeanceloi,
  fou.mail,fou.catFournisseur
FROM DAF_FOURNISSEURS fou
LEFT JOIN (
SELECT idfournisseur, MAX(id) as id
FROM DAF_echeanceloiFournisseur 
GROUP BY idfournisseur
) AS echl_max
ON fou.id = echl_max.idfournisseur

LEFT JOIN DAF_echeanceloiFournisseur echl
ON echl.id = echl_max.id

LEFT JOIN (
SELECT idfournisseur, MAX(id) as id
FROM DAF_echeanceReelFournisseur 
GROUP BY idfournisseur
) AS echr_max
ON fou.id = echr_max.idfournisseur

LEFT JOIN DAF_echeanceReelFournisseur echr
ON echr.id = echr_max.id
where 1=1 `,
  
  
  getNomfournisseur: `select  nom from DAF_FOURNISSEURS where nom  LIKE '%'+@nom+'%'`,
  getallfournisseurwithecheanceLoi: ` select * from DAF_FOURNISSEURS
                                        where id in(SELECT [idfournisseur]
                                        FROM [dbo].[DAF_echeanceloiFournisseur])  `,


  getFournisseursCount: `SELECT COUNT(*) as count FROM DAF_FOURNISSEURS`,
  createFournisseur: `INSERT INTO DAF_FOURNISSEURS(CodeFournisseur,nom,ICE,Identifiantfiscal,mail,addresse
    ,Redacteur,catFournisseur)
     VALUES(@CodeFournisseur, @nom,@ICE,@IF,@mail,@addresse,@Redacteur,@catFournisseur)`,
     RibsFournisseurValid: `select f.nom, f.catFournisseur,
     f.CodeFournisseur, rf.* ,f.exonorer
from [dbo].[DAF_FOURNISSEURS] f, [dbo].[DAF_RIB_Fournisseurs] rf
where f.id = rf.FournisseurId and rf.validation = 'Confirmer'
and f.id not in (select FournisseurId from daf_virements where ordervirementId=@ovId and etat<>'Annuler')
and f.catFournisseur is not null`,
  //   FournisseursRibValid: `SELECT f.CodeFournisseur, f.nom, rf.* FROM  [dbo].[DAF_FOURNISSEURS] f, [dbo].[DAF_RIB_Fournisseurs] rf
//   where f.id = rf.FournisseurId
//   AND rf.validation = 'Confirmer' AND f.nom not in (SELECT
//  distinct [NOM]
//   FROM [dbo].[DAF_LOG_FACTURE] WHERE etat!='Annulé'  and ModePaiementID =@ovId)`,
  getOne: `select * from DAF_FOURNISSEURS where id=@id`,
  update: `update DAF_FOURNISSEURS 
  set 
    catFournisseur=@catFournisseur,
     ICE=@ICE,
     Identifiantfiscal=@IF,
     mail=@mail,
     addresse=@addresse,
     exonorer=@exonorer
      where id=@id
  `
};

exports.ribTemporaire = {
  getRibs: `SELECT rt.*, f.nom as fournisseur FROM DAF_RIB_TEMPORAIRE rt, DAF_FOURNISSEURS f WHERE rt.fournisseurid = f.id AND  1=1`,
  getRibCount: `SELECT COUNT(*) as count FROM DAF_RIB_TEMPORAIRE`,
  createRibs: `INSERT INTO DAF_RIB_TEMPORAIRE(FournisseurId,rib,swift,banque,Redacteur , datesaisie)
     VALUES( @FournisseurId,@rib,@swift,@banque,@Redacteur,getdate())`,
};

exports.ribFournisseur = {
  create: `INSERT INTO [dbo].[DAF_RIB_Fournisseurs]
           ([FournisseurId]
           ,[rib]
           ,[swift]
           ,[banque]
           ,[Redacteur] 
           ,[datesaisie]
           )
     VALUES
           (@FournisseurId,
           @rib
           ,@swift
           ,@banque
           ,@Redacteur
           ,getdate()
           )`,
  getAll: `SELECT rf.*, f.nom as fournisseur FROM [dbo].[DAF_RIB_Fournisseurs] rf, DAF_FOURNISSEURS f   WHERE rf.fournisseurid = f.id AND  1=1`,
  getCount: `SELECT COUNT(*) as count FROM [dbo].[DAF_RIB_Fournisseurs]`,
  edit: `UPDATE [dbo].[DAF_RIB_Fournisseurs]
      SET 
      Validateur = @validateur
      ,validation=@validation
      ,DateModification=getdate()
    WHERE id = @id `,
  getOne: `SELECT rf.*, f.nom as fournisseur FROM [dbo].[DAF_RIB_Fournisseurs] rf, DAF_FOURNISSEURS f   WHERE rf.fournisseurid = f.id AND  rf.id = @id`,
  RibsValid: `select * from [dbo].[DAF_RIB_Fournisseurs] where validation = 'Validé'`,
  ribfournisseursvalid: `distinct SELECT * FROM [dbo].[DAF_RIB_Fournisseurs]
  where validation = 'validé'`,
};

exports.ribAtner = {
  getAll: `SELECT * FROM [dbo].[DAF_RIB_ATNER]`,
  getCount: `SELECT COUNT(*) as count FROM [dbo].[DAF_RIB_ATNER]`,
  create: `INSERT INTO [dbo].[DAF_RIB_ATNER]
           ([nom]
           ,[rib]
           ,[Redacteur]
           ,[dateCreation])
     VALUES
           (@nom
           ,@rib
           ,@Redacteur
           ,getdate())`,
  update: `UPDATE [dbo].[DAF_RIB_ATNER]
        SET [nom] = @nom
      ,[rib] = @rib
      ,[dateModification] = GETDATE()
      ,[ModifierPar] = @ModifierPar
  WHERE id = @id`,
  getOne: `SELECT * FROM [dbo].[DAF_RIB_ATNER] WHERE id = @id`,
  getRibAtnerValid: `select *  from DAF_RIB_ATNER 
  where id  not in (select ribAtner from  DAF_Order_virements_Fond  where
  id =@id)
  and id not in (select RibAtnerDestId from DAF_VIREMENTS_Fond where orderVirementFondId =@id)`,
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
  getfacturebyordervirement: `SELECT * FROM DAF_SuivieFacture
  WHERE ordervirementId LIKE '%'+@id+'%';`,
  getCountByYear: `SELECT  COUNT(*) +1 as count
  FROM [dbo].[DAF_Order_virements]
  where datecreation like '%${new Date().getFullYear()}%'`,
  getCount: `SELECT COUNT(*) as count FROM [dbo].[DAF_Order_virements]`,
  create: `INSERT INTO [dbo].[DAF_Order_virements]
           ([id],
            [directeursigne]
           ,[ribAtner]
            ,[Redacteur]
           )
     VALUES
           (@id,
            @directeursigne
           ,@ribAtner
           ,@Redacteur
      
           )`,
  getAll: `SELECT ov.id,
  ov.ribAtner,
  ov.datecreation,
  ov.etat,
  FORMAT(TotalOV.TotalMontant, '0.00') as total ,
  ov.dateExecution,
  ov.directeursigne,
  ov.Redacteur, 
  ra.nom, 
  ra.rib
  FROM [dbo].[DAF_Order_virements] ov, [dbo].[DAF_RIB_ATNER] ra, (
      SELECT orderVirementId as id, SUM(montantvirement) AS TotalMontant
      FROM DAF_VIREMENTS
      WHERE Etat <> 'Annuler'
      GROUP BY orderVirementId
  ) TotalOV
  WHERE ov.ribAtner = ra.id
  and ov.id = TotalOV.id`,
  getOne: `SELECT  ov.*, ra.nom, ra.rib
  FROM [dbo].[DAF_Order_virements] ov,[dbo].[DAF_RIB_ATNER] ra
  where ov.ribAtner = ra.id and ov.id = @id`,
  update: `UPDATE [dbo].[DAF_Order_virements]
   SET [ribAtner] = @ribAtner,
   [directeursigne]=@directeursigne
      ,[etat] = @etat
  WHERE id = @id`,
  orderVirementsEnCours: `SELECT * FROM [dbo].[DAF_Order_virements]
  WHERE etat = 'En cours' and dateExecution is null `,
  orderVirementsEtat: `SELECT * FROM [dbo].[DAF_Order_virements]
  WHERE etat in('En cours')
  and total <> 0`,
  AddToTotal:
    "update [DAF_Order_virements] set total = total+@montantVirement where id =@id",
  MiunsFromTotal:
    "update [DAF_Order_virements] set total = total-@montantVirement where id =@id",
  getHeaderPrint: `SELECT   ov.* ,FORMAT(ov.total, '0.00') AS totalformater
  , ra.nom, ra.rib
  FROM [dbo].[DAF_Order_virements] ov
  JOIN [dbo].[DAF_RIB_ATNER] ra ON ov.ribAtner = ra.id and ov.id = @ovId
  
  `,

  getSumVirmentPrint: `select  FORMAT(SUM(montantvirement), '0.00') as SumVirement from DAF_VIREMENTS
  where orderVirementId=@ovId
  and Etat<>'Annuler'`,

  getBodyPrint: `SELECT distinct  v.[id]
  ,[orderVirementId]
  ,f.nom
  ,rf.rib
  ,	FORMAT(montantVirement, '0.00') AS montantVirementModifier,
  v.Etat
FROM  [dbo].[DAF_VIREMENTS] v ,
  [dbo].[DAF_RIB_Fournisseurs] rf,
  [dbo].[DAF_FOURNISSEURS] f
where v.fournisseurId = f.id
and v.ribFournisseurId = rf.id
and v.Etat = 'En cours'
and [orderVirementId] = @ovId`,
  updateVirements: `update [dbo].[DAF_Order_virements] set Etat = 'Reglee'
                      where id = @id`,

  updateLogFacture: `update [dbo].[DAF_LOG_FACTURE] set Etat = 'Reglee'
                        where ModePaiementID = @id and Etat<>'Annulé'`,

  updateDateExecution: `update [dbo].[DAF_Order_virements] set dateExecution =@dateExecution
                            where id = @id`,


  updatvirementRegler: `update [dbo].[DAF_VIREMENTS] set Etat = 'Reglee'
                            where orderVirementId = @id
                            and   etat<>'Annuler'
                            `,




  updateVirementsAnnuler: `update [dbo].[DAF_VIREMENTS] set Etat = 'Annuler'
                      where orderVirementId = @id`,

  updateLogFactureAnnuler: `update [dbo].[DAF_LOG_FACTURE] set Etat = 'Annulé'
                        where ModePaiementID = @id`,
 updateRasAnnuler: `update [dbo].[DAF_RAS_Tva] set Etat = 'Annulé'
                        where modePaiement = @id`,


  updateordervirementAnnuler: `update [dbo].[DAF_Order_virements] set Etat = 'Annule' ,
                        total = 0 
                        where id = @id`,
};

exports.factures = {
  getCount: `SELECT COUNT(*) as count FROM [dbo].[DAF_FA_VC]`,
  getAll: `SELECT * FROM [dbo].[DAF_FA_VC] where 1=1 `,
  getOne: `SELECT * FROM [dbo].[DAF_FA_VC] where id=@id`,
  getAllFactures: `SELECT * FROM [dbo].[DAF_FA_VC]
  order by nom , datedouc `,
  getfacturebyfournisseurid: `SELECT fa.* 
  FROM [dbo].[DAF_FOURNISSEURS] f
  INNER JOIN [dbo].[DAF_CalculRasNetApaye] fa ON f.nom = fa.nom
  WHERE f.id = @id 
  AND NOT EXISTS (
      SELECT 1 
      FROM [dbo].[DAF_LOG_FACTURE] lf
      WHERE fa.CODEDOCUTIL = lf.CODEDOCUTIL
      AND lf.etat <> 'Annulé'
      AND fa.nom = lf.NOM
      AND (
          (fa.DateFacture IS NULL AND lf.DateDouc IS NULL) OR
          (fa.DateFacture = lf.DateDouc)
      )
  )
  ORDER BY fa.DateFacture
  `

  ,
  getficheNavetebyfournisseur: `SELECT fa.*
  FROM [dbo].[DAF_FOURNISSEURS] f
  INNER JOIN [dbo].[DAF_factureNavette] fa ON f.id = @id
  WHERE fa.idfacturenavette NOT IN (SELECT idAvance FROM [dbo].[DAF_LOG_FACTURE])`

}
  

exports.virements = {
  create: `
  INSERT INTO [dbo].[DAF_VIREMENTS]
      (
       [fournisseurId]
      ,[ribFournisseurId]
      ,[orderVirementId]
      ,[montantVirement]
      ,[Redacteur]
      ,[dateCreation]
      )
  VALUES
      (
       @fournisseurId
      ,@ribFournisseurId
      ,@orderVirementId
      ,@montantVirement
      ,@Redacteur
      ,getdate()
      )`,

  // CheckedFournisseurDejaExiste :`
  // select f.nom, rf.* from [dbo].[DAF_FOURNISSEURS] f, [dbo].[DAF_RIB_Fournisseurs] rf
  // where f.id = rf.FournisseurId and rf.validation = 'Validé'
  //   and  f.id not in (select id from DAF_FOURNISSEURS )
  //         and f.id=@fournisseurId
  // `,
  CheckedFournisseurDejaExiste: `  select count(*) from DAF_VIREMENTS
      where ribFournisseurId=@ribFournisseurId`,

  getCount: "SELECT COUNT(*) as count FROM [dbo].[DAF_VIREMENTS]",
  getAll: `
  SELECT v.[id]
      ,[orderVirementId]
      ,f.nom
      ,rf.rib
      ,[montantVirement],
      v.Etat,
      v.dateoperation
  FROM  [dbo].[DAF_VIREMENTS] v ,
      [dbo].[DAF_RIB_Fournisseurs] rf,
      [dbo].[DAF_FOURNISSEURS] f
  where v.fournisseurId = f.id
    and v.ribFournisseurId = rf.id
    and 1=1
  `,
  getDataFromLogFacture: `SELECT * FROM [dbo].[DAF_CalculRasNetApaye] where 1=1 `,
  createLogFacture: `
 INSERT INTO [dbo].[DAF_LOG_FACTURE]
           ([CODEDOCUTIL]
           ,[CODECHT]
            ,[NOM]
           ,[LIBREGLEMENT]
           ,[datedouc]
           ,[TOTALTTC]
           ,[TOTHTNET]
           ,[TOTTVANET]
           ,[NETAPAYER]
           ,[ModePaiementID]
           ,[modepaiement],
           [idAvance],
           [Ras])
     VALUES`,
     
     CreateRasFactue :`INSERT INTO [dbo].[DAF_RAS_Tva]
     ([idFournisseur]
     ,[RefernceDOC]
     ,[CategorieFn]
     ,[dateFactue]
     ,[HT]
     ,[TauxTva]
     ,[Pourcentage_TVA]
     ,[RaS]
     ,[PourcentageRas]
     ,[modePaiement]
     ,[Nom]
     )
VALUES`,

  update: `Update [dbo].[DAF_VIREMENTS]
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
  FROM  [dbo].[DAF_VIREMENTS] v ,
      [dbo].[DAF_RIB_Fournisseurs] rf,
      [dbo].[DAF_FOURNISSEURS] f
  where v.fournisseurId = f.id
    and v.ribFournisseurId = rf.id
    and v.[id] = @id
 `,

  updateLogFactureWhenAnnuleV:
    "update [dbo].[DAF_LOG_FACTURE] set Etat = 'Annulé' where [ModePaiementID] =@orderVirementId and nom=@nom",
};

exports.logFactures = {
  getLogFactureCount: `SELECT COUNT(*) as count
FROM [dbo].[DAF_LOG_FACTURE] lf 
INNER JOIN [dbo].[DAF_factureNavette] fn ON 
  CASE 
    WHEN lf.idAvance LIKE 'av%' THEN TRY_CAST(SUBSTRING(lf.idAvance, 3, LEN(lf.idAvance)) AS INT)
    ELSE lf.idAvance
  END = fn.idfacturenavette
INNER JOIN [dbo].[DAF_FOURNISSEURS] fou ON fou.id = fn.idfournisseur 
INNER JOIN chantier ch ON ch.id = fn.codechantier

    `,
  getLogFactures: `SELECT DISTINCT
  fn.Bcommande,
  fn.montantAvance,
  fn.idfacturenavette as id,
  fou.CodeFournisseur,
  fou.nom,
  ch.LIBELLE,
  ch.id as codechantier,
  lf.etat,
  lf.modepaiement,
  fn.ficheNavette
FROM [dbo].[DAF_LOG_FACTURE] lf 
INNER JOIN [dbo].[DAF_factureNavette] fn ON 
  CASE 
    WHEN lf.idAvance LIKE 'av%' THEN TRY_CAST(SUBSTRING(lf.idAvance, 3, LEN(lf.idAvance)) AS INT)
    ELSE lf.idAvance
  END = fn.idfacturenavette
INNER JOIN [dbo].[DAF_FOURNISSEURS] fou ON fou.id = fn.idfournisseur 
INNER JOIN chantier ch ON ch.id = fn.codechantier

  
  `,
};
exports.chantiers = {
  getChantiers: "select * from chantier",
  getcountChantier:
    "select count(*) from chantier",
  getChantiersbyfactureid: `SELECT * from chantier
  where  id in(
  select codechantier from DAF_FactureSaisie
  where id=@id
  ) `,
  getChantierbyBc: `select ch.LIBELLE as libelleChantier ,REDACTEUR  from DAf_BonCommande_facture bc inner join chantier ch
  on ch.CODEAFFAIRE=bc.CODEAFFAIRE
  where bc.CODEDOCUTIL=@Boncommande
  `
};

exports.factureSaisie = {
  getTTc: `SELECT TTC FROM DAF_FactureSaisie WHERE id = @idFacture`,


  getfactureSaisie: `SELECT
  f.id,
  f.fullName,
  f.numeroFacture,
  f.BonCommande,
  f.TTC AS TTC,
  f.createdDate,
  f.DateFacture,
  f.HT,
  f.MontantTVA,
  d.designation as "designation",
  fou.nom as "nom",
  fou.CodeFournisseur,
  f.verifiyMidelt,
  f.updatedBy,
  ch.LIBELLE as LIBELLE,
  f.dateecheance,
  f.CatFn
FROM [dbo].[DAF_FactureSaisie] f
INNER JOIN [dbo].[FactureDesignation] d on d.id=f.iddesignation
INNER JOIN [dbo].[DAF_FOURNISSEURS] fou on fou.id=f.idfournisseur
LEFT JOIN [dbo].[chantier] ch on ch.id=f.codechantier
WHERE deletedAt is null
`,
  getfactureSaisiecount: `
SELECT COUNT(*) as count
FROM [dbo].[DAF_FactureSaisie] f
inner join [dbo].[FactureDesignation] d on d.id=f.iddesignation
inner join   [dbo].[DAF_FOURNISSEURS] fou on fou.id=f.idfournisseur
where deletedAt is null`,
  createfacture: `INSERT INTO [dbo].[DAF_FactureSaisie](
  [numeroFacture]
,[BonCommande]
,[TTC]
,[idfournisseur]
,[DateFacture]
,[iddesignation]
,[fullName],
[codechantier],
[dateecheance],
[CatFn]
)
  values  (
     @numeroFacture
    ,@BonCommande
    ,@TTC
    ,@idfournisseur
    ,@DateFacture
    ,@iddesignation
    ,@fullName
    ,@codechantier
    ,@dateEcheance
    ,@CatFn
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
f.verifiyMidelt,
f.CatFn
FROM [dbo].[DAF_FactureSaisie] f
inner join [dbo].[FactureDesignation] d on d.id=f.iddesignation
inner join   [dbo].[DAF_FOURNISSEURS] fou on fou.id=f.idfournisseur
where deletedAt is null and f.id=@id`,
  alreadyexist:
    "select count(*) from  [dbo].[DAF_FactureSaisie] where numeroFacture =@numeroFacture and BonCommande =@BonCommande",
  delete: `UPDATE [dbo].[DAF_FactureSaisie]
  SET  deletedAt=getDate(),
  numeroFacture='----'+CAST(id as varchar(20))  +'----'

   WHERE id = @id `,

  edit: `UPDATE [dbo].[DAF_FactureSaisie]
SET  deletedAt=getDate(),
numeroFacture='----'+CAST(id as varchar(20))  +'----'
WHERE id = @id `,
  getfacturebyfournisseurnom: `select * from [dbo].[DAF_FactureSaisie] 
  where deletedAt is null and idfournisseur 
   in(select id from [dbo].[DAF_FOURNISSEURS] where id=@nom)
   and id not in (select idfacture from DAF_factureNavette)
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
FROM [dbo].[DAF_FactureSaisie] f ,  [dbo].[FactureDesignation] d,
[dbo].[DAF_FOURNISSEURS] fou
where d.id=f.iddesignation  and fou.id=f.idfournisseur  and deletedAt is  not null `,

  gethistoriquefacturecount: `SELECT COUNT(*) as count
FROM [dbo].[DAF_FactureSaisie] f ,  [dbo].[FactureDesignation] d,
[dbo].[DAF_FOURNISSEURS] fou
where d.id=f.iddesignation  and fou.id=f.idfournisseur  and deletedAt is  not null `,
  getfacturebyfournisseur: `select f.* from [dbo].[DAF_FactureSaisie] f,
[dbo].[DAF_factureNavette] fn
   where
   fn.idFacture=f.id   and
   f.id not in (select facture from DAF_LOG_FACTURE)
   and
  and idfournisseur in(select id from [dbo].[DAF_FOURNISSEURS] where id=@id)`,
  getfacturevalider: `	SELECT DISTINCT
  ch.LIBELLE,
  f.id,
  f.fullName,
  f.numeroFacture,
  f.BonCommande,
  f.TTC,
  f.DateFacture,
  f.HT,
  f.MontantTVA,
  d.designation AS "designation",
  fou.nom AS "nom",
  fou.CodeFournisseur,
  f.verifiyMidelt,
  f.createdDate
FROM 
  [dbo].[DAF_FactureSaisie] f
  INNER JOIN [dbo].[FactureDesignation] d ON d.id = f.iddesignation
  INNER JOIN [dbo].[DAF_FOURNISSEURS] fou ON fou.id = f.idfournisseur
  LEFT JOIN [dbo].[chantier] ch ON ch.id = f.codechantier
WHERE 
  f.deletedAt IS NULL 
  AND (f.verifiyMidelt IS NULL OR f.BonCommande IS NULL OR f.BonCommande = ''
  or f.CatFn is null
  )
`,
  getcountvalider: `SELECT COUNT(*) as count FROM [dbo].[DAF_FactureSaisie] WHERE deletedAt IS NULL 
  AND (verifiyMidelt IS NULL OR BonCommande IS NULL OR BonCommande = '')`,

  validerfacture: `UPDATE [dbo].[DAF_FactureSaisie]
  SET  verifiyMidelt=@verifiyMidelt,
  updatedBy=@updatedBy,
  BonCommande=@BonCommande,
  CatFn=@CatFn
WHERE id = @id `,
  getsumfacturebyfournisseurwithoutfn: `Select SUM(fa.ttc) as sum from [dbo].[DAF_FOURNISSEURS] f,[dbo].[DAF_Facture_Avance_Fusion] fa
where fa.ficheNavette is null  and fa.DateFacture is not null  and 
f.id=@id and not
EXISTS (SELECT  CODEDOCUTIL,nom
FROM [dbo].[DAF_LOG_FACTURE] lf
where fa.CODEDOCUTIL=lf.CODEDOCUTIL
and lf.etat <>'Annulé'
and fa.nom=lf.NOM
)
 and  fa.nom=f.nom
`,
  getsumfacturebyfournisseurwithfn: `SELECT SUM(fa.ttc) as sum 
  FROM [dbo].[DAF_FOURNISSEURS] f
  INNER JOIN [dbo].[DAF_Facture_Avance_Fusion] fa ON f.nom = fa.nom
  WHERE fa.ficheNavette IS NOT NULL 
  AND fa.DateFacture IS NOT NULL 
  AND f.id = @id 
  AND NOT EXISTS (
      SELECT 1 
      FROM [dbo].[DAF_LOG_FACTURE] lf
      WHERE fa.CODEDOCUTIL = lf.CODEDOCUTIL
      AND lf.etat <> 'Annulé'
      AND fa.nom = lf.NOM
      AND fa.DateFacture = lf.DateDouc
  );
  

`,


};
exports.factureFicheNavette = {
  
  updateQuery : `
        UPDATE DAF_FactureSaisie
        SET NetAPayer = @netAPayer
        WHERE id = @idFacture
      `,
  getTtcQuery : `
        SELECT TTC
        FROM DAF_FactureSaisie
        WHERE id = @idFacture
      `,

  
  updateFactureQuery : `
  UPDATE DAF_factureNavette
  SET ficheNavette = @ficheNavette,
      idFacture = @idFacture,
      codechantier = @codechantier,
      idfournisseur = @idfournisseur,
      montantAvance = @montantAvance,
      dateSaisie=getdate(),
      Validateur=@Validateur
  WHERE idfacturenavette = @id
`,
getMontantAvanceQuery : `
        SELECT montantAvance
        FROM DAF_factureNavette
        WHERE idFacture = @idFacture
      `,
  createBonlivraison: `INSERT INTO [dbo].[BonlivraisonTable]
  ([Bonlivraison])
VALUES
  (@BonLivraison)`,
  create: `INSERT INTO [dbo].[DAF_factureNavette]
  ([codechantier],[montantAvance],[idfournisseur],[idFacture],[ficheNavette],[Bcommande]
    ,[fullname]
    ,[dateSaisie]
    ,[CatFn] 
    ,[TTC]
    ,[HT]
    ,[MontantTVA])
    VALUES 
    (@codechantier,
    @montantAvance,
    @idfournisseur,
    @idFacture,
    @modifiedFicheNavette,
    @Bcommande,
    @fullName,
    getdate(),
    @CatFn,
    @TTC,
    @HT,
    @MontantTVA)
  `,

  get: `
  SELECT DISTINCT
  fich.id,
  fich.BonCommande,
  fich.CodeFournisseur,
  fich.montantAvance,
  fich.nom,
  fich.MontantTVA,
  fich.DateFacture,
  fich.TTC,
  fich.HT,
  fich.designation,
  fich.numeroFacture,
  fich.ficheNavette,
  fich.fullname,
  fich.deletedAt,
  fich.annulation,
  CASE
      WHEN fich.numeroFacture IS NULL THEN 'avance'
      WHEN fich.deletedAt IS NOT NULL THEN 'facture annulée'
      ELSE 'normal'
  END AS etat,
  CASE
      WHEN ch.LIBELLE IS NULL THEN fich.LIBELLE
      ELSE ch.LIBELLE
  END AS libelle,
  fich.CatFn
FROM [dbo].[DAF_ficheNavette] fich
LEFT JOIN (SELECT * FROM chantier) ch ON fich.LIBELLE = ch.LIBELLE
WHERE fich.deletedAt IS NULL
AND fich.ficheNavette <> 'Annuler'
`,
  getCount: `SELECT COUNT(*) as count
    FROM  [dbo].[DAF_ficheNavette]
    WHERE  ficheNavette<>'Annuler' `,
  getOne: `select * from DAF_ficheNavette where id=@id`,
  update: `update [dbo].[DAF_factureNavette] 
        set   ficheNavette=@ficheNavette,
              idfacture=@idFacture,
              codechantier=@codechantier,
              montantAvance=@montantAvance,
              Bcommande=@BonCommande,
              Validateur=@Validateur,
              CatFn=@CatFn
        where idfacturenavette=@id `,
  getavancebyfournisseur: `select * from DAF_factureNavette
where Bcommande is not null
and idFacture=0 and idfournisseur=@idfournisseur`,

  getsumavancebyforurnisseur: `Select SUM(fa.ttc) as sum from [dbo].[DAF_FOURNISSEURS] f,[dbo].[DAF_Facture_Avance_Fusion] fa
where fa.ficheNavette is not null and fa.DateFacture is  null and 
f.id=@id and not
EXISTS (SELECT  CODEDOCUTIL,nom
FROM [dbo].[DAF_LOG_FACTURE] lf
where fa.CODEDOCUTIL=lf.CODEDOCUTIL
and lf.etat <>'Annulé'
and fa.nom=lf.NOM
)
 and  fa.nom=f.nom

`,
  annulationFn: `update DAF_factureNavette  set  idfacture=0 ,  ficheNavette='Annuler' where idfacturenavette=@id`,
  updateficheNavette:`  UPDATE DAF_factureNavette
  SET ficheNavette = @ficheNavette,
      idFacture = @idFacture,
      codechantier = @codechantier,
      idfournisseur = @idfournisseur,
      montantAvance = @montantAvance
  WHERE idfacturenavette = @id`,
getMontantAvance:`SELECT montantAvance FROM DAF_factureNavette WHERE idFacture = @idFacture`,
updateNetApayer:` UPDATE DAF_FactureSaisie
SET NetAPayer = @netAPayer
WHERE id = @idFacture`,
existingCompositionAvance : ` SELECT COUNT(*)
FROM daf_factureNavette AS dfn1
WHERE 
   dfn1.ficheNavette = @ficheNavette
  AND dfn1.Bcommande = @Bcommande
  AND dfn1.idfournisseur = @idfournisseur
  And idfacture=0
group by  dfn1.ficheNavette,
     dfn1.ficheNavette,
     dfn1.Bcommande
     `
};



//where id>30
exports.designation = {
  getdesignationCount:
    "SELECT COUNT(*) as cogetficheNavettebyfournisseurunt FROM [dbo].[FactureDesignation]",
  getDesignation: "SELECT * FROM [dbo].[FactureDesignation]  ",
  getdesignationbynom: `SELECT *
     FROM [dbo].[FactureDesignation]
     where id=@id `,
};
exports.SuivieFacture = {
  getSuivieFacture: `select distinct 
        [id]
      ,[BonCommande]
      ,[chantier]
      ,[DateFacture]
      ,[TTC]
      ,[HT]
      ,[numeroFacture]
      ,[MontantTVA]
      ,[CodeFournisseur]
      ,[nom]
      ,[datecheque]
      ,[dateecheance]
      ,[ficheNavette]
      ,[dateOperation]
      ,[modepaiement]
      ,[banque]
      ,[designation]
      ,[numerocheque]
      ,[montantAvance]
      ,[etat],
      ModePaiementID
	  , CASE WHEN etat = 'pas encore' THEN  DATEDIFF(DAY, DateFacture, GETDATE()) 	  
	  ELSE NULL  
	  END AS nbrJour
    
    from  DAF_SuivieFacture  where numeroFacture  not  like '%-'
`,

  getSuivieFacturecount: `
    select count(*) as count
    from DAF_SuivieFacture  
      where numeroFacture  not  like '%-'
    `,

  getSuivieFactureEchu: `select * from DAF_SuivieFactureEchu
  where 1=1
  `,
  getSuivieFactureEchucount: `
select count(*) as count
from DAF_SuivieFactureEchu 
where 1=1
`,
  getSuivieFactureNonPayé: `SELECT DISTINCT 
[id],
[BonCommande],
[chantier],
[DateFacture],
[TTC],
[HT],
[numeroFacture],
[MontantTVA],
[CodeFournisseur],
[nom],
[datecheque],
[dateecheance],
[ficheNavette],
[dateOperation],
[modepaiement],
[banque],
[designation],
[numerocheque],
[montantAvance],
[etat],
ModePaiementID
FROM DAF_SuivieFacture 
WHERE  
1=1
`,

  getSuivieFactureNonPayéCount: `
select count(*) as count
from DAF_SuivieFacture  
WHERE  ( Etat = 'pas encore' OR  Etat = 'En cours')
  `,

  getAnneSuivieFacture: `
 select distinct year(datefacture) as year
from DAF_SuivieFacture
order by year(datefacture)
 ` ,
  getSuivieFactureNonPayéByFournisseur: `
 SELECT 
    nom,
    SUM(CASE WHEN YEAR(datefacture) = @annee THEN ttc ELSE 0 END) AS sumFacture,
    SUM(CASE WHEN YEAR(dateoperation) = @annee THEN ttc ELSE 0 END) AS sumReglement,
    SUM(CASE WHEN YEAR(datefacture) >= @annee AND etat <>'reglee' THEN ttc ELSE 0 END) AS Reste
FROM 
    daf_suiviefacture 
WHERE  
    UPPER(nom) LIKE UPPER('%'+@nom+'%')
GROUP BY 
    nom
    `,
};

exports.cheque = {
  create: `
  INSERT INTO [dbo].[DAF_cheque]
      (
       [fournisseurId]
       ,[numerocheque]
       ,[datecheque]
       ,[dateecheance]
      ,[RibAtnerId]
      ,[montantVirement]
      ,[Redacteur]
      ,[DateCreation])
  VALUES
      (
       @fournisseurId
       ,@numerocheque
       ,@datecheque
       ,@dateecheance
      ,@RibAtner
      ,@montantVirement
      ,@Redacteur
      ,getdate()
      )`,
  getCount: "SELECT COUNT(*) as count FROM [dbo].[DAF_cheque]",
  getAll: `
  SELECT v.[id]
      ,[ribatnerid],
      dateOperation
      ,[montantVirement],
      [Etat],
	  rf.nom ,v.numerocheque,v.datecheque,v.dateecheance
    ,f.nom as "fournisseur"
   ,CodeFournisseur
  FROM  [dbo].[DAF_cheque] v ,
      [dbo].[DAF_RIB_ATNER] rf,
      [dbo].[DAF_FOURNISSEURS] f
  where v.fournisseurId = f.id
    and v.ribatnerid = rf.id
    and 1=1
  `,
  getDataFromLogFacture: `SELECT * FROM [dbo].[DAF_CalculRasNetApaye] where 1=1 `,
  createLogFacture: `
 INSERT INTO [dbo].[DAF_LOG_FACTURE]
           ([CODEDOCUTIL]
           ,[CODECHT]
            ,[NOM]
           ,[LIBREGLEMENT]
           ,[datedouc]
           ,[TOTALTTC]
           ,[TOTHTNET]
           ,[TOTTVANET]
           ,[NETAPAYER]
           ,[ModePaiementID],
            [modepaiement],
            [idAvance],
            [numerocheque],
            [Ras]
           )
     VALUES`,
     CreateRasFactue :`INSERT INTO [dbo].[DAF_RAS_Tva]
           ([idFournisseur]
           ,[RefernceDOC]
           ,[CategorieFn]
           ,[dateFactue]
           ,[HT]
           ,[TauxTva]
           ,[Pourcentage_TVA]
           ,[RaS]
           ,[PourcentageRas]
           ,[modePaiement]
           ,[Nom]
           )
     VALUES`,
  update: `Update [dbo].[DAF_cheque]
            set 
            dateOperation=@dateOperation,
            Etat=@Etat
            where id=@id`,
  getOne: `
  SELECT v.[id]
  ,[ribatnerid],
            v.[Etat]
  ,[montantVirement],
rf.nom ,v.numerocheque,v.datecheque,v.dateecheance
,f.nom as "fournisseur"
,CodeFournisseur
FROM  [dbo].[DAF_cheque] v ,
  [dbo].[DAF_RIB_ATNER] rf,
  [dbo].[DAF_FOURNISSEURS] f
where v.fournisseurId = f.id
and v.ribatnerid = rf.id
    and v.[id] = @id
 `,
  updateLogFactureWhenAnnuleV:
    "update [dbo].[DAF_LOG_FACTURE] set Etat = 'Annulé' where [numerocheque] =@numerocheque",

    updateRestitWhenAnnuleCheque:
    "update [dbo].[DAF_RestitAvance] set Etat = 'AnnulerPaiement' where [numerocheque] =@numerocheque",

    updateRasWhenAnnule:
    "update [dbo].[DAF_RAS_Tva] set Etat = 'Annulé' where [modePaiement] =@numerocheque",

  updateLogFactureWhenRegleeCheque:
    `update [dbo].[DAF_LOG_FACTURE] set Etat = 'Reglee' where [numerocheque] =@numerocheque
                and etat<>'Annulé'
    `,
    updateRasWhenRegleeCheque:
    `update [dbo].[DAF_RAS_Tva] set Etat = 'Reglee' where [numerocheque] =@numerocheque , dateOperation=@dateOperation
                and etat<>'Annulé'
    `,
    updateRasWhenAnnuleV:
    "update [dbo].[DAF_RAS_Tva] set Etat = 'Annulé' where [modePaiement] =@numerocheque",

  updateLogFactureWhenRegleeV:
    `update [dbo].[DAF_RAS_Tva] set Etat = 'Regler' where [modePaiement] =@numerocheque
                and etat<>'Annulé'
    `,
    updateRestitWhenRegleecheque:
    `update [dbo].[DAF_RestitAvance] set Etat = 'Regler' where [modePaiement] =@numerocheque
                and etat not in('AnnulerPaiement','AnnulerSasie')
    `,
    CreateRasFactue :`INSERT INTO [dbo].[DAF_RAS_Tva]
    ([idFournisseur]
    ,[RefernceDOC]
    ,[CategorieFn]
    ,[dateFactue]
    ,[HT]
    ,[TauxTva]
    ,[Pourcentage_TVA]
    ,[RaS]
    ,[PourcentageRas]
    ,[modePaiement]
    ,[Nom]
    )
VALUES`,


createRestit: `
INSERT INTO [dbo].[DAF_RestitAvance]
          ([idAvance]
          ,[Montant]
           ,[Redacteur]
           ,[etat]
           ,[nom]
           ,[ModePaiement]
          )
    VALUES`,

};




exports.espece = {
  create: `
  INSERT INTO [dbo].[DAF_espece]
      (
       [fournisseurId]
      ,[montantVirement]
      ,[redacteur])
  VALUES
      (
       @fournisseurId 
      ,@montantVirement
      ,@redacteur
      )`,
  getCount: "SELECT COUNT(*) as count FROM [dbo].[DAF_espece]",
  getAll: `
  SELECT v.[id],
      v.[Datepaiement]
      ,[montantVirement]
    ,f.nom as "fournisseur"
   ,CodeFournisseur
  FROM  [dbo].[DAF_espece] v ,
      [dbo].[DAF_FOURNISSEURS] f
  where v.fournisseurId = f.id
    and 1=1
  `,
  getDataFromLogFacture: `SELECT * FROM [dbo].[DAF_CalculRasNetApaye] where 1=1 `,
  createLogFacture: `
 INSERT INTO [dbo].[DAF_LOG_FACTURE]
           ([CODEDOCUTIL]
           ,[CODECHT]
            ,[NOM]
           ,[LIBREGLEMENT]
           ,[datedouc]
           ,[TOTALTTC]
           ,[TOTHTNET]
           ,[TOTTVANET]
           ,[NETAPAYER]
           ,[ModePaiementID],
           [etat],
           [modepaiement],
           [idAvance],
           [Ras]
         
           )
     VALUES`,

     createRestit: `
     INSERT INTO [dbo].[DAF_RestitAvance]
               ([idAvance]
               ,[Montant]
                ,[Redacteur]
                ,[etat]
                ,[nom]
                ,[ModePaiement]
               )
         VALUES`,





     CreateRasFactue :`INSERT INTO [dbo].[DAF_RAS_Tva]
           ([idFournisseur]
           ,[RefernceDOC]
           ,[CategorieFn]
           ,[dateFactue],
            [dateOperation],
            [etat]
           ,[HT]
           ,[TauxTva]
           ,[Pourcentage_TVA]
           ,[RaS]
           ,[PourcentageRas]
           ,[modePaiement]
           ,[Nom]
           )
     VALUES`,

 

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
};


exports.avancevirement = {
  create: `
INSERT INTO [dbo].[DAF_virementAvance]
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
  getCount: "SELECT COUNT(*) as count FROM [dbo].[DAF_virementAvance]",
  getAll: `
  SELECT v.[id]
  ,[orderVirementId]
  ,f.nom
  ,rf.rib
  ,[montantVirement],
  v.Etat,
  v.dateoperation
FROM  [dbo].[DAF_virementAvance] v ,
  [dbo].[DAF_RIB_Fournisseurs] rf,
  [dbo].[DAF_FOURNISSEURS] f
  where v.fournisseurId=f.CodeFournisseur
  and v.ribFournisseurId = rf.id
`,
  getDataFromLogFacture: `SELECT * FROM [dbo].[ficheNavette] where 1=1 `,
  createLogFacture: `
INSERT INTO [dbo].[DAF_LOG_FACTURE]
       ([CODEDOCUTIL]
       ,[CODECHT]
        ,[NOM]
       ,[LIBREGLEMENT]
       ,[datedouc]
       ,[TOTALTTC]
       ,[TOTHTNET]
       ,[TOTTVANET]
       ,[NETAPAYER]
       ,[orderVirementId],
       [idAvance],
        [modepaiement]
       )
 VALUES`,
  update: `Update [dbo].[DAF_virementAvance]
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
FROM  [dbo].[DAF_virementAvance] v ,
  [dbo].[DAF_RIB_Fournisseurs] rf,
  [dbo].[DAF_FOURNISSEURS] f
where v.fournisseurId = f.id
and v.ribFournisseurId = rf.id
and v.[id] = @id
`,

  updateLogFactureWhenAnnuleV: "update [dbo].[DAF_virementAvance] set Etat = 'Annulé' where [orderVirementId] =@orderVirementId and nom=@nom",
};

// exports.BonLivraison = {
//   getAllBl: `
//   SELECT *
//   FROM BonlivraisonTable
// where 1=1

//   `,
//   getAllBlCount: `
//   SELECT   count(*)
//   FROM BonlivraisonTable
//   where 1=1

//     `,
// };
exports.EcheanceReel = {
  getAllecheanceReel: `
  SELECT  erf.id as id ,nom,fou.id as idfournisseur,
      [modalitePaiement]
      ,[dateecheance]
  FROM [DAF_echeanceReelFournisseur] erf
  inner join DAF_FOURNISSEURS fou
  on  erf.idfournisseur=fou.id
  where 1=1
  `,
  getAllecheanceReelCount: `
  SELECT   COUNT(*) as count
  FROM [dbo].[DAF_echeanceReelFournisseur]
    `,
  create: `INSERT INTO [dbo].[DAF_echeanceReelFournisseur]
  ([idfournisseur]
  ,[modalitePaiement]
  ,[dateecheance]
  ,[Redacteur]
  ,[dateSaisie]) values (@idfournisseur
    ,@modalitePaiement
    ,@dateecheance
    ,@Redacteur
    ,getdate())`,
  getEcheanceReelbyfournisseur: `select modalitePaiement from DAF_echeanceReelFournisseur
  where idfournisseur=@idfournisseur
  and id =(select max(id) from DAF_echeanceReelFournisseur
        where idfournisseur=@idfournisseur
        group by idfournisseur)
`
};

exports.EcheanceLoi = {
  getAllecheanceLoi: `
  SELECT  erf.id as id ,nom,fou.id as idfournisseur,
      [modalitePaiement]
      ,[dateecheance]
  FROM [DAF_echeanceloiFournisseur] erf
  inner join DAF_FOURNISSEURS fou
  on  erf.idfournisseur=fou.id
  where 1=1
  `,
  getAllecheanceLoiCount: `
  SELECT   COUNT(*) as count
  FROM [dbo].[DAF_echeanceloiFournisseur]
    `,
  create: `INSERT INTO [dbo].[DAF_echeanceloiFournisseur]
  ([idfournisseur]
  ,[modalitePaiement]
  ,[dateecheance]
  ,[Redacteur]
  ,[datesaisie]) values 
  (@idfournisseur,@modalitePaiement,@dateecheance,@Redacteur,
    getdate())`,
  getEcheanceLoibyfournisseur: `select modalitePaiement from DAF_echeanceloiFournisseur
  where idfournisseur=@idfournisseur
  and id =(select max(id) from DAF_echeanceloiFournisseur
        where idfournisseur=@idfournisseur
        group by idfournisseur)
`
};

/////////////////////


exports.ordervirementsFond = {

  getCountByYear: `SELECT  COUNT(*) +1 as count
  FROM [dbo].[DAF_Order_virements_Fond]
  where datecreation like '%${new Date().getFullYear()}%'`,
  getCount: `SELECT COUNT(*) as count FROM [dbo].[DAF_Order_virements_Fond]`,
  create: `INSERT INTO [dbo].[DAF_Order_virements_Fond]
           ([id],
            [directeursigne]
           ,[ribAtner]
            ,[Redacteur]
           )
     VALUES
           (@id,
            @directeursigne
           ,@ribAtner
           ,@Redacteur
      
           )`,
  getAll: `SELECT  ov.*, ra.nom, ra.rib
  FROM [dbo].[DAF_Order_virements_Fond] ov,[dbo].[DAF_RIB_ATNER] ra
  where ov.ribAtner = ra.id `,
  getOne: `SELECT  ov.*, ra.nom, ra.rib
  FROM [dbo].[DAF_Order_virements_Fond] ov,[dbo].[DAF_RIB_ATNER] ra
  where ov.ribAtner = ra.id and ov.id = @id`,
  update: `UPDATE [dbo].[DAF_Order_virements_Fond]
   SET [ribAtner] = @ribAtner,
   [directeursigne]=@directeursigne
      ,[etat] = @etat
  WHERE id = @id`,
  orderVirementsEnCours: `SELECT * FROM [dbo].[DAF_Order_virements_Fond]
  WHERE etat = 'En cours' and tailleOvPrint<11`,
  orderVirementsEtat: `SELECT * FROM [dbo].[DAF_Order_virements_Fond]
  WHERE etat in('En cours')
  and total <> 0`,
  AddToTotal:
    "update [DAF_Order_virements_Fond] set total = total+@montantVirement where id =@id",
  MiunsFromTotal:
    "update [DAF_Order_virements_Fond] set total = total-@montantVirement where id =@id",
  getHeaderPrint: `SELECT ov.* ,FORMAT(ov.total, '0.00') AS totalformater, ra.nom, ra.rib
  FROM [dbo].[DAF_Order_virements_Fond] ov
  JOIN [dbo].[DAF_RIB_ATNER] ra ON ov.ribAtner = ra.id and ov.id = @ovId
  `,


  getBodyPrint: `SELECT v.[id]
  ,  orderVirementFondId as orderVirementId
  ,'ATNER'AS nom
  ,RAT.rib
  ,	FORMAT(montantVirement, '0.00') AS montantVirementModifier,
  v.Etat
FROM  [dbo].[DAF_VIREMENTS_Fond] v ,
  [dbo].[DAF_RIB_ATNER] RAT

where v.RibAtnerDestId=RAT.id
and Etat = 'En cours'
and [orderVirementFondId] = @ovId`,
  updateVirements: `update [dbo].[DAF_Order_virements_Fond] set Etat = 'Reglee'
                      where id = @id`,



  updateDateExecution: `update [dbo].[DAF_Order_virements_Fond] set dateExecution = GETDATE()
                            where id = @id`,


  updatvirementRegler: `update [dbo].[DAF_VIREMENTS_Fond] set Etat = 'Reglee'
                            where orderVirementFondId = @id
                            and   etat<>'Annuler'
                            `,




  updateVirementsAnnuler: `update [dbo].[DAF_VIREMENTS_Fond] set Etat = 'Annuler'
                      where orderVirementFondId = @id`,

  updateordervirementAnnuler: `update [dbo].[DAF_Order_virements_Fond] set Etat = 'Annule' ,
                        total = 0
                        where id = @id`,
};


exports.virementsFond = {
  create: `
  INSERT INTO [dbo].[DAF_VIREMENTS_Fond]
      (
       [RibAtnerDestId]
      ,[orderVirementFondId]
      ,[montantVirement]
      ,[Redacteur]
      ,[dateCreation]
      )
  VALUES
      (
       @RibAtnerDestId
      ,@orderVirementFondId
      ,@montantVirement
      ,@Redacteur
      ,getdate()
      )`,



  getCount: "SELECT COUNT(*) as count FROM [dbo].[DAF_VIREMENTS_Fond]",
  getAll: `
  SELECT v.[id]
  ,v.[orderVirementFondId]
  ,ra.nom
  ,ra.rib
  ,[montantVirement],
  v.Etat,
  v.dateoperation
FROM  [dbo].[DAF_VIREMENTS_Fond] v ,
  [dbo].[DAF_RIB_ATNER] ra
where v.RibAtnerDestId = ra.id
and 1=1
  `,
  update: `Update [dbo].[DAF_VIREMENTS_Fond]
            set Etat=@Etat,
            dateOperation=@dateOperation
            where id=@id`,
  getOne: `
  SELECT v.[id]
  ,v.[orderVirementFondId]
  ,ra.nom
  ,ra.rib
  ,[montantVirement],
  v.Etat,
  v.dateoperation
FROM  [dbo].[DAF_VIREMENTS_Fond] v ,
  [dbo].[DAF_RIB_ATNER] ra
where v.RibAtnerDestId = ra.id
    and v.[id] = @id
 `,
};
///////////////////////////////*/*//**/* Attestation  de  Fiscalité */


exports.AttestationFiscalite = {
  getAllAttestation: `
  SELECT  att.id as id ,nom,fou.id as idfournisseur,
      [dateDebut]
      ,[dateExpiration]
  FROM [DAF_AttestationFiscal] Att
  inner join DAF_FOURNISSEURS fou
  on  Att.idfournisseur=fou.id
  where 1=1
  `,
  getAllAttestationCount: `
  SELECT   COUNT(*) as count
  FROM [dbo].[DAF_AttestationFiscal]
    `,
  create: `INSERT INTO [dbo].[DAF_AttestationFiscal]  (
    [idfournisseur]
   ,[numAttestation]
   ,[dateDebut]
   ,[dateExpiration]
   ,[redacteur]
            )
                  VALUES
        (@idfournisseur
        ,@numAttestation
        ,@dateDebut
        ,DATEADD(MONTH, 6, @dateDebut)
        ,@redacteur
);
 `,
//   getEcheanceLoibyfournisseur:``
};

exports. FicheNavette = {
  create: `
    INSERT INTO [dbo].[DAF_factureNavette]
    ([codechantier]
    ,[montantAvance]
    ,[idfournisseur]
    ,[idFacture]
    ,[ficheNavette]
    ,[Bcommande]
    ,[fullname]
    ,[dateSaisie]
    ,[CatFn] 
    ,[TTC]
    ,[HT]
    ,[MontantTVA])
    VALUES 
    (@codechantier,
    @montantAvance,
    @idfournisseur,
    @idFacture,
    @modifiedFicheNavette,
    @Bcommande,
    @fullName,
    getdate(),
    @CatFn,
    @TTC,
    @HT,
    @MontantTVA)
  `,

  get: `
    SELECT DISTINCT
      fich.id,
      fich.BonCommande AS BonCommande,
      fich.CodeFournisseur AS CodeFournisseur,
      fich.montantAvance,
      fich.nom,
      fich.MontantTVA,
      fich.DateFacture,
      fich.TTC,
      fich.HT,
      fich.designation,
      fich.numeroFacture,
      fich.ficheNavette,
      fich.fullname,
      fich.deletedAt,
      fich.annulation,
      CASE
        WHEN fich.numeroFacture IS NULL THEN 'avance'
        WHEN fich.deletedAt IS NOT NULL THEN 'facture annulée'
        ELSE 'normal'
      END AS etat,
      COALESCE(ch.LIBELLE, fich.LIBELLE) AS libelle,
      fich.CatFn
    FROM [dbo].[DAF_ficheNavette] fich
    LEFT JOIN chantier ch ON fich.LIBELLE = ch.LIBELLE
    WHERE fich.deletedAt IS NULL
      AND fich.ficheNavette <> 'Annuler'
      AND fich.numeroFacture IS NOT NULL
  `,

  getAvance: `
    SELECT av.*, ch.LIBELLE AS chantier, fou.nom, fou.CodeFournisseur, fou.catFournisseur
    FROM DAF_Avance av
    INNER JOIN chantier ch ON ch.CODEAFFAIRE = av.CodeAffaire
    INNER JOIN DAF_FOURNISSEURS fou ON fou.id = av.idFournisseur
    WHERE av.EtatRestit = 'Non'
      AND av.etat IN ('En Cours', 'Regler')
  `,

  getCount: `
    SELECT COUNT(*) AS count
    FROM [dbo].[DAF_ficheNavette]
    WHERE ficheNavette <> 'Annuler'
  `,

  getAvanceRestitById: `
    SELECT av.*, restit.etat AS etatRestitRestit, 
           restit.Montant, four.nom AS nom, 
           four.CodeFournisseur AS CodeFournisseur, 
           four.id AS idfournisseur,
           restit.ModePaiement
    FROM DAF_RestitAvance restit 
    INNER JOIN DAF_Avance av ON av.id = restit.idAvance
    INNER JOIN DAF_FOURNISSEURS four ON four.id = av.idFournisseur
    INNER JOIN chantier ch ON ch.CODEAFFAIRE = av.CodeAffaire
    WHERE av.id = @id AND idfacture IS NULL
  `,

  update: `
    UPDATE [dbo].[DAF_factureNavette] 
    SET ficheNavette = @ficheNavette,
        idfacture = @idFacture,
        codechantier = @codechantier,
        montantAvance = @montantAvance,
        Bcommande = @BonCommande,
        Validateur = @Validateur,
        CatFn = @CatFn
    WHERE idfacturenavette = @id 
  `,


  annulationFn: `
    UPDATE DAF_factureNavette
    SET idfacture = 0, ficheNavette = 'Annuler'
    WHERE idfacturenavette = @id
  `,

  updateficheNavette: `
    UPDATE DAF_factureNavette
    SET ficheNavette = @ficheNavette,
        idFacture = @idFacture,
        codechantier = @codechantier,
        idfournisseur = @idfournisseur,
        montantAvance = @montantAvance
    WHERE idfacturenavette = @id
  `,

  getMontantAvance: `
    SELECT montantAvance
    FROM DAF_factureNavette
    WHERE idFacture = @idFacture
  `,

  updateNetApayer: `
    UPDATE DAF_FactureSaisie
    SET NetAPayer = @netAPayer
    WHERE id = @idFacture
  `,

  existingCompositionAvance: `
    SELECT COUNT(*)
    FROM daf_factureNavette AS dfn1
    WHERE dfn1.ficheNavette = @ficheNavette
      AND dfn1.Bcommande = @Bcommande
      AND dfn1.idfournisseur = @idfournisseur
      AND idfacture = 0
    GROUP BY dfn1.ficheNavette, dfn1.Bcommande
  `,
};