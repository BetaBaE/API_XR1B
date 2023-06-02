exports.Fournisseurs = {
  getAllFournisseurs: `SELECT * FROM DAF_FOURNISSEURS WHERE 1=1`,
  getFournisseursCount: `SELECT COUNT(*) as count FROM DAF_FOURNISSEURS`,
  createFournisseur: `INSERT INTO DAF_FOURNISSEURS( CodeFournisseur, nom )
     VALUES( @CodeFournisseur, @nom )`,
  RibsFournisseurValid: `select f.nom, rf.* from [dbo].[DAF_FOURNISSEURS] f, [dbo].[DAF_RIB_Fournisseurs] rf
  where f.id = rf.FournisseurId and rf.validation = 'Validé'`,
  FournisseursRibValid: `SELECT f.CodeFournisseur, f.nom, rf.* FROM  [dbo].[DAF_FOURNISSEURS] f, [dbo].[DAF_RIB_Fournisseurs] rf
  where f.id = rf.FournisseurId
  AND rf.validation = 'validé' AND f.nom not in (SELECT
 distinct [NOM]
  FROM [dbo].[DAF_LOG_FACTURE] WHERE etat!='Annulé'  and orderVirementId =@ovId)`,
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
  RibsValid: `select * from [dbo].[DAF_RIB_Fournisseurs] where validation = 'Validé'`,
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
  FROM [dbo].[DAF_Order_virements] ov,[dbo].[DAF_RIB_ATNER] ra
  where ov.ribAtner = ra.id `,
  getOne: `SELECT  ov.*, ra.nom, ra.rib
  FROM [dbo].[DAF_Order_virements] ov,[dbo].[DAF_RIB_ATNER] ra
  where ov.ribAtner = ra.id and ov.id = @id`,
  update: `UPDATE [dbo].[DAF_Order_virements]
   SET [ribAtner] = @ribAtner,
   [directeursigne]=@directeursigne
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

  updateVirementsAnnuler: `update [dbo].[DAF_LOG_FACTURE] set Etat = 'Annuler'
                      where orderVirementId = @id`,

  updateLogFactureAnnuler: `update [dbo].[DAF_LOG_FACTURE] set Etat = 'Annulé'
                        where orderVirementId = @id`,
  updateordervirementAnnuler: `update [dbo].[DAF_Order_virements] set Etat = 'Annule' ,
                        total = 0
                        where id = @id`,
};

exports.factures = {
  getCount: `SELECT COUNT(*) as count FROM [dbo].[DAF_FA_VC]`,
  getAll: `SELECT * FROM [dbo].[DAF_FA_VC] where 1=1 `,
  getOne: `SELECT * FROM [dbo].[DAF_FA_VC] where id=@id`,
  getAllFactures: `SELECT * FROM [dbo].[DAF_FA_VC]
  order by nom , datedoc `,
  getfacturebyfournisseurid: `Select fa.* from [dbo].[DAF_FOURNISSEURS] f,[dbo].[Daf_facture_fusion] fa
  where
  f.id=@id and not
  EXISTS (SELECT  CODEDOCUTIL,nom
  FROM [dbo].[DAF_LOG_FACTURE] lf
  where fa.CODEDOCUTIL=lf.CODEDOCUTIL

  and fa.nom=lf.NOM
 )
   and  fa.nom=f.nom
  order by fa.DateFacture
  `,
  getficheNavetebyfournisseur: `select fa.* from [dbo].[DAF_FOURNISSEURS] f,[dbo].[ficheNavette] fa
  where
   f.id=@id and
 fa.id not in (SELECT  idfactureNavette
 FROM [dbo].[DAF_LOG_FACTURE]
WHERE [etat] in ('En cours','Reglee' ))
and fa.nom= f.nom 
and   fa.numeroFacture  is null
`

};

exports.virements = {
  // sumFacture: `
  // SELECT  SUM(netapayer) as netapayer
  // FROM(
  //   select sum(NETAPAYER) as netapayer from [].[dbo].[DAF_FA_VC]
  //   where MontantFacture is null
  //   and id in (@facturelistString)
  //       UNION ALL
  //   select sum(MontantFacture) as netapayer from [].[dbo].[DAF_FA_VC]
  //   where MontantFacture is not null
  //   and id in (@facturelistString)
  //   ) sum `,
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
  getDataFromLogFacture: `SELECT * FROM [dbo].[Daf_facture_fusion] where 1=1 `,
  createLogFacture: `
 INSERT INTO [dbo].[DAF_LOG_FACTURE]
           ([CODEDOCUTIL]
           ,[CODECHT]
            ,[NOM]
           ,[LIBREGLEMENT]
           ,[DATEDOC]
           ,[TOTALTTC]
           ,[TOTHTNET]
           ,[TOTTVANET]
           ,[NETAPAYER]
           ,[orderVirementId]
           ,[modepaiement])
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
    "update [dbo].[DAF_LOG_FACTURE] set Etat = 'Annulé' where [orderVirementId] =@orderVirementId and nom=@nom",
};

exports.logFactures = {
  getLogFactureCount: `SELECT COUNT(*) as count FROM [dbo].[DAF_LOG_FACTURE]
       where
      NETAPAYER<>0
    `,
  getLogFactures: `SELECT * FROM [dbo].[DAF_LOG_FACTURE] where 1=1 and

      NETAPAYER<>0`,
};
exports.chantiers = {
  getChantiers: "select * from chantier where  CODEAFFAIRE is  not null",
  getcountChantier:
    "select count(*) from chantier where  CODEAFFAIRE is  not null",
  getChantiersbyfactureid :`SELECT * from chantier
  where  id in(
  select codechantier from factureresptionne
  where id=@id
  )  `

  };

exports.factureres = {
  getfactureres: `select
f.id,
f.fullName
,f.numeroFacture
,f.BonCommande
,f.TTC,
f.createdDate
,f.DateFacture,
FORMAT(f.HT,'#,###.00') AS HT,
FORMAT(f.MontantTVA,'#,###.00') AS MontantTVA,
d.designation as "designation" ,
fou.nom as "nom",
fou.CodeFournisseur,
f.verifiyMidelt,
f.updatedBy,
ch.LIBELLE

FROM [dbo].[factureresptionne] f
inner join [dbo].[FactureDesignation] d on d.id=f.iddesignation
inner join   [dbo].[DAF_FOURNISSEURS] fou on fou.id=f.idfournisseur
left join [dbo].[chantier] ch on ch.id=f.codechantier
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
,[fullName],
[codechantier]
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
   f.id not in (select facture from DAF_LOG_FACTURE)
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
getsumfacturebyfournisseurwithoutfn:`Select SUM(fa.ttc) as sum from [dbo].[DAF_FOURNISSEURS] f,[dbo].[Daf_facture_fusion] fa
where fa.ficheNavette is null and
f.id=@id and not
EXISTS (SELECT  CODEDOCUTIL,nom
FROM [dbo].[DAF_LOG_FACTURE] lf
where fa.CODEDOCUTIL=lf.CODEDOCUTIL

and fa.nom=lf.NOM
)
 and  fa.nom=f.nom
`,
getsumfacturebyfournisseurwithfn:`Select SUM(fa.ttc) as sum from [dbo].[DAF_FOURNISSEURS] f,[dbo].[Daf_facture_fusion] fa
where fa.ficheNavette is not null and
f.id=@id and not
EXISTS (SELECT  CODEDOCUTIL,nom
FROM [dbo].[DAF_LOG_FACTURE] lf
where fa.CODEDOCUTIL=lf.CODEDOCUTIL

and fa.nom=lf.NOM
)
 and  fa.nom=f.nom

`

};
exports.factureFicheNavette = {
  create: `INSERT INTO [dbo].[DAF_factureNavette]
    ([codechantier]
      ,[montantAvance],
      [idfournisseur],
      [idFacture],
      [ficheNavette],
      [Bcommande]
      )
    VALUES (@codechantier,@montantAvance,@idfournisseur,
      
      @idFacture,@ficheNavette,@Bcommande) `,

    get: `select fich.id,  fich.BonCommande, fich.CodeFournisseur,fich.montantAvance,fich.nom,fich.MontantTVA,
    fich.DateFacture,fich.TTC,fich.HT,fich.designation, fich.numeroFacture,fich.ficheNavette
    
    , case  

    when ch.LIBELLE  is null then  fich.LIBELLE
    else  ch.LIBELLE		
        end as libelle from [dbo].[ficheNavette] fich 
		left join 
   (select * from chantier) ch on fich.LIBELLE=ch.LIBELLE

	where   1=1 
    `,


    getCount: `seLECT COUNT(*) as count
    FROM  [dbo].[ficheNavette] `,
    getOne: `select * from ficheNavette where id=@id`,
   update: `update [dbo].[DAF_factureNavette] 
        set ficheNavette=@ficheNavette,
              idfacture=@idFacture,
              idfournisseur=@idfournisseur,
              codechantier=@codechantier
        where idfacturenavette=@id `,
getavancebyfournisseur:`select * from DAF_factureNavette
where Bcommande is not null
and idFacture=0 and idfournisseur=@idfournisseur`


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
  getAll: `
  select distinct * from  voir  where numeroFacture  not  like '%-'`,

  getAllcount: `
    select count(*) as count
    from voir  
      where numeroFacture  not  like '%-'
    
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
      ,[orderVirementId]
      ,[montantVirement])
  VALUES
      (
       @fournisseurId
       ,@numerocheque
       ,@datecheque
       ,@dateecheance
      ,@orderVirementId
      ,@montantVirement
      )`,
  getCount: "SELECT COUNT(*) as count FROM [dbo].[DAF_cheque]",
  getAll: `
  SELECT v.[id]
      ,[orderVirementId],
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
    and v.orderVirementId = rf.id
    and 1=1
  `,
  getDataFromLogFacture: `SELECT * FROM [dbo].[Daf_facture_fusion] where 1=1 `,
  createLogFacture: `
 INSERT INTO [dbo].[DAF_LOG_FACTURE]
           ([CODEDOCUTIL]
           ,[CODECHT]
            ,[NOM]
           ,[LIBREGLEMENT]
           ,[DATEDOC]
           ,[TOTALTTC]
           ,[TOTHTNET]
           ,[TOTTVANET]
           ,[NETAPAYER]
           ,[orderVirementId],
            [etat],
            [modepaiement]
     
           )
     VALUES`,
  update: `Update [dbo].[DAF_cheque]
            set 
            dateOperation=@dateOperation,
            Etat=@Etat
            where id=@id`,
  getOne: `
  SELECT v.[id]
  ,[orderVirementId]

  ,[montantVirement],
rf.nom ,v.numerocheque,v.datecheque,v.dateecheance
,f.nom as "fournisseur"
,CodeFournisseur
FROM  [dbo].[DAF_cheque] v ,
  [dbo].[DAF_RIB_ATNER] rf,
  [dbo].[DAF_FOURNISSEURS] f
where v.fournisseurId = f.id
and v.orderVirementId = rf.id

    and v.[id] = @id
 `,

  updateLogFactureWhenAnnuleV:
    "update [dbo].[DAF_LOG_FACTURE] set Etat = 'Annulé' where [orderVirementId] =@orderVirementId and nom=@nom",
};




exports.espece = {
  
  create: `
  INSERT INTO [dbo].[DAF_espece]
      (
       [fournisseurId]
 
      ,[montantVirement])
  VALUES
      (
       @fournisseurId 

      ,@montantVirement
      )`,
  getCount: "SELECT COUNT(*) as count FROM [dbo].[DAF_espece]",
  getAll: `
  SELECT v.[id]
      ,
      v.[Datepaiement]

      ,[montantVirement]
	 
    ,f.nom as "fournisseur"
   ,CodeFournisseur
  FROM  [dbo].[DAF_espece] v ,

      [dbo].[DAF_FOURNISSEURS] f
  where v.fournisseurId = f.id
   
    and 1=1
  `,
  getDataFromLogFacture: `SELECT * FROM [dbo].[Daf_facture_fusion] where 1=1 `,
  createLogFacture: `
 INSERT INTO [dbo].[DAF_LOG_FACTURE]
           ([CODEDOCUTIL]
           ,[CODECHT]
            ,[NOM]
           ,[LIBREGLEMENT]
           ,[DATEDOC]
           ,[TOTALTTC]
           ,[TOTHTNET]
           ,[TOTTVANET]
           ,[NETAPAYER]
           ,[orderVirementId],
           [etat],
           [modepaiement]
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
    "update [dbo].[DAF_LOG_FACTURE] set Etat = 'Annulé' where [orderVirementId] =@orderVirementId and nom=@nom",
};


exports.avancevirement = {
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
       ,[DATEDOC]
       ,[TOTALTTC]
       ,[TOTHTNET]
       ,[TOTTVANET]
       ,[NETAPAYER]
       ,[orderVirementId],
       [idfactureNavette],
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





exports.avancecheque = {
  
  create: `
  INSERT INTO [dbo].[DAF_chequeavance]
      (
       [fournisseurId]
       ,[numerocheque]
       ,[datecheque]
       ,[dateecheance]
      ,[orderVirementId]
      ,[montantVirement])
  VALUES
      (
       @fournisseurId
       ,@numerocheque
       ,@datecheque
       ,@dateecheance
      ,@orderVirementId
      ,@montantVirement
      )`,
  getCount: "SELECT COUNT(*) as count FROM [dbo].[DAF_chequeavance]",
  getAll: `
  SELECT v.[id]
      ,[orderVirementId],
      dateOperation
      ,[montantVirement],
      [Etat],
	  rf.nom ,v.numerocheque,v.datecheque,v.dateecheance
    ,f.nom as "fournisseur"
   ,CodeFournisseur
  FROM  [dbo].[DAF_chequeavance] v ,
      [dbo].[DAF_RIB_ATNER] rf,
      [dbo].[DAF_FOURNISSEURS] f
  where v.fournisseurId = f.id
    and v.orderVirementId = rf.id
    and 1=1
  `,
  getDataFromLogFacture: `SELECT * FROM [dbo].[ficheNavette] where 1=1 `,
  createLogFacture: `
  INSERT INTO [dbo].[DAF_LOG_FACTURE]
         ([CODEDOCUTIL]
         ,[CODECHT]
          ,[NOM]
         ,[LIBREGLEMENT]
         ,[DATEDOC]
         ,[TOTALTTC]
         ,[TOTHTNET]
         ,[TOTTVANET]
         ,[NETAPAYER]
         ,[orderVirementId],
         [idfactureNavette],
          [modepaiement]
         )
   VALUES`,
  update: `Update [dbo].[DAF_chequeavance]
            set 
            dateOperation=@dateOperation
            where id=@id`,
  getOne: `
  SELECT v.[id]
  ,[orderVirementId]

  ,[montantVirement],
rf.nom ,v.numerocheque,v.datecheque,v.dateecheance
,f.nom as "fournisseur"
,CodeFournisseur
FROM  [dbo].[DAF_chequeavance] v ,
  [dbo].[DAF_RIB_ATNER] rf,
  [dbo].[DAF_FOURNISSEURS] f
where v.fournisseurId = f.id
and v.orderVirementId = rf.id

    and v.[id] = @id
 `,

  updateLogFactureWhenAnnuleV:
    "update [dbo].[DAF_LOG_FACTURE] set Etat = 'Annulé' where [orderVirementId] =@orderVirementId and nom=@nom",
};



exports.avanceespece = {
  
  create: `
  INSERT INTO [dbo].[DAF_especeAvance]
      (
       [fournisseurId]
 
      ,[montantVirement])
  VALUES
      (
       @fournisseurId 

      ,@montantVirement
      )`,
  getCount: "SELECT COUNT(*) as count FROM [dbo].[DAF_especeAvance]",
  getAll: `
  SELECT v.[id]
      ,
      v.[Datepaiement]

      ,[montantVirement]
	 
    ,f.nom as "fournisseur"
   ,CodeFournisseur
  FROM  [dbo].[DAF_especeAvance] v ,

      [dbo].[DAF_FOURNISSEURS] f
  where v.fournisseurId = f.id
   
    and 1=1
  `,
  getDataFromLogFacture: `SELECT * FROM [dbo].[ficheNavette] where 1=1 `,
  createLogFacture: `
 INSERT INTO [dbo].[DAF_LOG_FACTURE]
           ([CODEDOCUTIL]
           ,[CODECHT]
            ,[NOM]
           ,[LIBREGLEMENT]
           ,[DATEDOC]
           ,[TOTALTTC]
           ,[TOTHTNET]
           ,[TOTTVANET]
           ,[NETAPAYER]
           ,[orderVirementId],
           [etat],
           [modepaiement]
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
    "update [dbo].[DAF_LOG_FACTURE] set Etat = 'Annulé' where [orderVirementId] =@orderVirementId and nom=@nom",
};
