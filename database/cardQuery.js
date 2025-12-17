exports.cardQuery = {
  // Récupérer les données des factures depuis la vue (comme Cheque)
  getDataFromLogFacture: `
    SELECT 
      id,
      CODEDOCUTIL,
      CODECHT as chantier,
      NOM as nom,
      LIBREGLEMENT,
      datedouc as DateFacture,
      TOTALTTC as TTC,
      TOTHTNET as HT,
      TOTTVANET as MontantTVA,
      NETAPAYER as MontantAPaye,
      RAS,
      MontantRasIR
    FROM [dbo].[DAF_CalculRasNetApaye]
    WHERE 1=1
  `,

  // Crée un nouveau paiement par carte
  create: `
    INSERT INTO [dbo].[DAF_Card]
        (
         [fournisseurId]
        ,[RibAtnerId]
        ,[montantVirement]
        ,[dateOperation]
        ,[Redacteur]
        ,[DateCreation]
        ,[Observation])
    VALUES
        (
         @fournisseurId
        ,@RibAtner
        ,@montantVirement
        ,@dateOperation
        ,@Redacteur
        ,getdate()
        ,@Observation
        )`,

  // Récupère le nombre total de paiements par carte
  getCount: "SELECT COUNT(*) as count FROM [dbo].[DAF_Card]",

  // Récupère tous les enregistrements de paiements par carte avec leurs détails
  getAll: `
    SELECT v.[id]
        ,[ribatnerid],
        dateOperation
        ,[montantVirement],
        [Etat],
        rf.nom,
        v.[Observation],
        v.[DateCreation]
      ,f.nom as "fournisseur"
     ,CodeFournisseur
    FROM  [dbo].[DAF_Card] v ,
        [dbo].[DAF_RIB_ATNER] rf,
        [dbo].[DAF_FOURNISSEURS] f
    where v.fournisseurId = f.id
      and v.ribatnerid = rf.id
      and 1=1
    `,

  // Récupère les données depuis la table des logs de factures
  getDataFromLogFacture: `SELECT * FROM [dbo].[DAF_CalculRasNetApaye] where 1=1 `,

  // Crée un log de facture avec mode de paiement "paiement card"
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
            [RASIR],
            [etat],
            [dateOperation]
          )
      VALUES`,

  // Met à jour un enregistrement de paiement par carte existant
  update: `Update [dbo].[DAF_Card]
              set 
              dateOperation=@dateOperation,
              Etat=@Etat,
              Observation=@Observation
              where id=@id`,

  // Récupère un enregistrement de paiement par carte spécifique par ID
  getOne: `
    SELECT v.[id]
    ,[ribatnerid],
              v.[Etat]
    ,[montantVirement],
  rf.nom,
  v.[Observation]
  ,f.nom as "fournisseur"
  ,CodeFournisseur
  ,v.DateOperation
  FROM  [dbo].[DAF_Card] v ,
    [dbo].[DAF_RIB_ATNER] rf,
    [dbo].[DAF_FOURNISSEURS] f
  where v.fournisseurId = f.id
  and v.ribatnerid = rf.id
      and v.[id] = @id
  `,

  // Met à jour l'état d'une facture dans les logs lorsque le paiement par carte est annulé
  updateLogFactureWhenAnnuleCard:
    "update [dbo].[DAF_LOG_FACTURE] set Etat = 'Annuler' where [numerocheque] = 'paiement card' and ModePaiementID = @ribatnerid",

  // Met à jour l'état d'une restitution d'avance lorsque le paiement par carte est annulé
  updateRestitWhenAnnuleCard:
    "update [dbo].[DAF_RestitAvance] set Etat = 'Annuler' where [ModePaiement] = 'paiement card'",

  // Met à jour l'état d'une facture dans les logs lorsque le paiement par carte est réglé
  updateLogFactureWhenRegleeCard: `update [dbo].[DAF_LOG_FACTURE] 
                  set Etat = 'Reglee' ,dateOperation=@dateOperation
                where [numerocheque] = 'paiement card'
                and ModePaiementID = @ribatnerid
                  and etat<>'Annuler'
      `,

  // Met à jour l'état d'une restitution d'avance lorsque le paiement par carte est réglé
  updateRestitWhenRegleeCard: `update [dbo].[DAF_RestitAvance] set Etat = 'Reglee' where [modePaiement] = 'paiement card'
                  and etat not in('Annuler')
      `,

  // Crée une restitution d'avance avec mode de paiement "paiement card"
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

  // Récupère les paiements par carte en cours
  getCardEncours: `
    with sumCARDlog as (
select ModePaiementID ,sum(NETAPAYER) total from DAF_LOG_FACTURE
where etat IN ('En cours') and modepaiement = 'paiement card'
group by ModePaiementID
 )

 SELECT 
      c.id,
      CONCAT ('Card : ', ra.nom) value
    FROM [dbo].DAF_Card c
	inner join sumCARDlog sc on sc.ModePaiementID = c.RibAtnerId and sc.total = c.montantVirement
    JOIN [dbo].[DAF_RIB_ATNER] ra ON c.RibAtnerId = ra.id
    where etat = 'En cours'
    order by c.id desc
  `,

  // Récupère l'en-tête d'un paiement par carte pour impression
  getCardHeaderById: `
    SELECT 
      'Carte' as type,
      FORMAT(ov.montantVirement, '0.00') AS totalformater,
      Format(ov.DateCreation,'dd/MM/yyyy') as datecard,
      f.nom as fournisseur,
      ra.nom as bank
      FROM [dbo].DAF_Card ov
      JOIN [dbo].[DAF_RIB_ATNER] ra ON ov.RibAtnerId = ra.id
    Left join DAF_FOURNISSEURS f On f.id = ov.fournisseurId
    where etat = 'En cours'
    and ov.id = @id
  `,

  // Récupère les lignes de factures liées à un paiement par carte pour impression
  getCardPrintLinesById: `
  select l.CODEDOCUTIL,
  FORMAT(l.DateDouc,'dd/MM/yyyy') AS DateDouc,
  l.NOM,l.NETAPAYER from 
	DAF_Card c inner join DAF_LOG_FACTURE l
			on c.RibAtnerId = l.ModePaiementID
	where c.id =  @id
	and l.numerocheque = 'paiement card'
	and c.ETAT <> 'Annuler'
	and c.ETAT = l.etat
  `,

  // Récupère la somme totale des factures liées à un paiement par carte
  getSumCard: ` 
  SELECT 
    FORMAT(SUM(NETAPAYER), '0.00') AS SumCard
  from DAF_Card c 
    inner join DAF_LOG_FACTURE l
		on c.RibAtnerId = l.ModePaiementID
	where 
    c.id =  @id
    and l.numerocheque = 'paiement card'
    and c.ETAT = l.etat
    and c.ETAT <> 'Annuler'
  `,
};