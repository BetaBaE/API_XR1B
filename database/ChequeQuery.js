const { getCheque } = require("../controllers/Cheque");

exports.cheque = {
  // Crée un nouvel enregistrement de chèque
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

  // Récupère le nombre total de chèques
  getCount: "SELECT COUNT(*) as count FROM [dbo].[DAF_cheque]",

  // Récupère tous les enregistrements de chèques avec leurs détails
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

  // Récupère les données depuis la table des logs de factures
  getDataFromLogFacture: `SELECT * FROM [dbo].[DAF_CalculRasNetApaye] where 1=1 `,

  // Crée un log de facture
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
            [Ras],
            [idDocPaye],
            [RASIR]

          )
      VALUES`,

  // Crée une entrée RAS pour une facture
  CreateRasFactue: `INSERT INTO [dbo].[DAF_RAS_Tva]
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
            ,[idDocPaye]
            )
      VALUES`,

  CreateRasIRFacture: `
      INSERT INTO [dbo].[DAF_RAS_IR]
               ([idFournisseur]
               ,[RefernceDOC]
               ,[CategorieFn]
               ,[dateFactue]
               ,[HT]
               ,[RaS]
               ,[modePaiement]
               ,[Nom]
               ,[idDocPaye])
                VALUES
      `,
  // Met à jour un enregistrement de chèque existant
  update: `Update [dbo].[DAF_cheque]
              set 
              dateOperation=@dateOperation,
              Etat=@Etat
              where id=@id`,

  // Récupère un enregistrement de chèque spécifique par ID
  getOne: `
    SELECT v.[id]
    ,[ribatnerid],
              v.[Etat]
    ,[montantVirement],
  rf.nom ,v.numerocheque,v.datecheque,v.dateecheance
  ,f.nom as "fournisseur"
  ,CodeFournisseur
  ,v.DateOperation
  FROM  [dbo].[DAF_cheque] v ,
    [dbo].[DAF_RIB_ATNER] rf,
    [dbo].[DAF_FOURNISSEURS] f
  where v.fournisseurId = f.id
  and v.ribatnerid = rf.id
      and v.[id] = @id
  `,

  // Met à jour l'état d'une facture dans les logs lorsque le chèque est annulé
  updateLogFactureWhenAnnuleV:
    "update [dbo].[DAF_LOG_FACTURE] set Etat = 'Annuler' where [numerocheque] =@numerocheque",

  // Met à jour l'état d'une restitution d'avance lorsque le chèque est annulé
  updateRestitWhenAnnuleCheque:
    "update [dbo].[DAF_RestitAvance] set Etat = 'Annuler' where [ModePaiement] =@numerocheque",

  // Met à jour l'état d'une RAS lorsque le chèque est Annuler
  updateRasWhenAnnule:
    "update [dbo].[DAF_RAS_Tva] set Etat = 'Annuler' where [modePaiement] =@numerocheque",

  // Met à jour l'état d'une facture dans les logs lorsque le chèque est réglé
  updateLogFactureWhenRegleeCheque: `update [dbo].[DAF_LOG_FACTURE] 
                  set Etat = 'Reglee' ,dateOperation=@dateOperation
                where [numerocheque] =@numerocheque
                  and etat<>'Annuler'
      `,

  // Met à jour l'état d'une RAS lorsque le chèque est réglé
  updateRasWhenRegleeCheque: `update [dbo].[DAF_RAS_Tva] set Etat = 'Reglee', dateOperation=@dateOperation
                where [modePaiement] =@numerocheque 
                  and etat<>'Annuler'
      `,

  // Met à jour l'état d'une RAS lorsque le chèque est annulé (duplication de la fonction)
  updateRasWhenAnnuleV:
    "update [dbo].[DAF_RAS_Tva] set Etat = 'Annuler' where [modePaiement] =@numerocheque",

  // Met à jour l'état d'une facture dans les logs lorsque le chèque est réglé (duplication de la fonction)
  updateLogFactureWhenRegleeV: `update [dbo].[DAF_RAS_Tva] set Etat = 'Reglee' where [modePaiement] =@numerocheque
                  and etat<>'Annuler'
      `,

  // Met à jour l'état d'une restitution d'avance lorsque le chèque est réglé
  updateRestitWhenRegleecheque: `update [dbo].[DAF_RestitAvance] set Etat = 'Reglee' where [modePaiement] =@numerocheque
                  and etat not in('Annuler')
      `,

  // Crée une entrée RAS pour une facture (duplication de la fonction)
  CreateRasFactue: `INSERT INTO [dbo].[DAF_RAS_Tva]
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
      ,[idDocPaye]
      )
  VALUES`,

  // Crée une restitution d'avance
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

  getHeaderPrintCheque: `
  	SELECT ov.*, FORMAT(ov.montantVirement, '0.00') AS totalformater,
           ra.nom, ra.rib
    FROM [dbo].DAF_cheque ov
    JOIN [dbo].[DAF_RIB_ATNER] ra ON ov.RibAtnerId = ra.id
    WHERE ov.numerocheque = 'CH730285'
	  and nom = 'AWB'
  `,

  getChequeEncours: `
    with sumCHQlog as (
select numerocheque ,sum(NETAPAYER) total from DAF_LOG_FACTURE
where etat IN ('En cours') and modepaiement = 'paiement cheque'
group by numerocheque
 )

 SELECT 
      c.id,
      CONCAT (iif(dateecheance is not null,'Effet : ','Cheque : '),c.numerocheque,' - ',ra.nom) value
    FROM [dbo].DAF_cheque c
	inner join sumCHQlog sc on sc.numerocheque = c.numerocheque and sc.total = c.montantVirement
    JOIN [dbo].[DAF_RIB_ATNER] ra ON c.RibAtnerId = ra.id
    where etat = 'En cours'
    order by c.id desc
  `,

  getChequeHeaderById: `
    SELECT 
      iif(ov.dateecheance is not null,'Effet','Chèque') as type,
      FORMAT(ov.montantVirement, '0.00') AS totalformater,
      Format(ov.datecheque,'dd/MM/yyyy') as datecheque,
      ov.numerocheque,
      f.nom as fournisseur,
      ra.nom as bank,
      coalesce(Format(ov.dateecheance,'dd/MM/yyyy'),'----------') as dateecheance
      FROM [dbo].DAF_cheque ov
      JOIN [dbo].[DAF_RIB_ATNER] ra ON ov.RibAtnerId = ra.id
    Left join DAF_FOURNISSEURS f On f.id = ov.fournisseurId
    where etat = 'En cours'
    and ov.id = @id
  `,

  getChequePrintLinesById: `
  select l.CODEDOCUTIL,
  FORMAT(l.DateDouc,'dd/MM/yyyy') AS DateDouc,
  l.NOM,l.NETAPAYER from 
	DAF_cheque c inner join DAF_LOG_FACTURE l
			on c.numerocheque = l.numerocheque and c.RibAtnerId = l.ModePaiementID
	where c.id =  @id
	and c.ETAT <> 'Annuler'
	and c.ETAT = l.etat
  `,

  getSumCheque: ` 
  SELECT 
    FORMAT(SUM(NETAPAYER), '0.00') AS SumCheque
  from DAF_cheque c 
    inner join DAF_LOG_FACTURE l
		on c.numerocheque = l.numerocheque and c.RibAtnerId = l.ModePaiementID
	where 
    c.id =  @id
    and c.ETAT = l.etat
    and c.ETAT <> 'Annuler'
  `,
};
