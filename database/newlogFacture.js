exports.logfacture = {
  GetFactureDetails: `
select
		fs.id,
		fs.codechantier,
		fo.nom,
		fn.ficheNavette As Fn,
		fs.numeroFacture,
		fs.DateFacture,
		fs.HT,
		fs.MontantTVA,
		fs.TTC,
		fs.Acompte,
		(fs.TTC - (fs.Acompte+isNull(fs.montantPaiement,0)+isNull(fs.Ras,0)+isNull(fs.RasIR,0))) as Restant,
--		fs.AcompteReg,
--		fs.AcompteVal,
		fs.idAvance,
		fs.Etat,
		fs.modepaiement,
		fs.modepaiementID as RefPay,
		fs.DateOperation ,
		fs.Ras,
		fs.RasIR,
		ra.nom as Bank,
		montantPaiement
	from DAF_FactureSaisie fs
	inner join 
		DAF_FOURNISSEURS fo on (fo.id = fs.idfournisseur)
	left join 
		DAF_RIB_ATNER ra on (ra.id = fs.bankName)
	left join 
		DAF_factureNavette fn on ( fn.idFacture = fs.id)
	where etat <> 'Annuler' and ([dateoperation] > @dateExercices or [dateoperation] is null )
	and YEAR(fs.DateFacture) <= YEAR(@dateExercices)

`,
  GetFactureDetailsCount: `
    SELECT count(*) as count from DAF_FactureSaisie fs
    inner join 
      DAF_FOURNISSEURS fo on (fo.id = fs.idfournisseur)
    left join 
      DAF_RIB_ATNER ra on (ra.id = fs.bankName)
    left join 
	    DAF_factureNavette fn on ( fn.idFacture = fs.id)
    where etat <> 'Annuler' and ([dateoperation] > @dateExercices or [dateoperation] is null )
    and YEAR(fs.DateFacture) <= YEAR(@dateExercices)
`,

  GetAvanceDetails: `
 with resumeRestint as (
select idAvance, sum(Montant) as Sum from DAF_RestitAvance
where idFacture is not null
and Etat <> 'Annuler'
group by idAvance
)
 

 select
 av.id,
 av.CodeAffaire as codechantier,
 fo.nom,
 fn.ficheNavette As Fn,
 av.BonCommande,
 av.MontantAvanceHT as Ht,
 av.MontantAvanceTVA as Tva,
 av.MontantAvanceTTC as Ttc,
 rs.Sum as montantRestit,
 av.Etat,
 av.modepaiement,
 av.modepaiementID as RefPay,
 av.DateOperation ,
 av.Ras,
 ra.nom as Bank,
 montantPaiement
 from DAF_Avance av
 inner join 
	DAF_FOURNISSEURS fo on (fo.id = av.idfournisseur)
 left join 
	DAF_RIB_ATNER ra on (ra.id = av.bankName)
 left join 
	DAF_factureNavette fn on ( fn.idfacturenavette = av.id)
 left join 
	resumeRestint rs on (rs.idAvance = av.id)
where etat not in ( 'Annuler','TMP') and ([dateoperation] > @dateExercices or [dateoperation] is null )
`,

  GetOneAvanceDetails: `
 with resumeRestint as (
select idAvance, sum(Montant) as Sum from DAF_RestitAvance
where idFacture is not null
and Etat <> 'Annuler'
group by idAvance
)
 

 select
 av.id,
 av.CodeAffaire as codechantier,
 fo.nom,
 fn.ficheNavette As Fn,
 av.BonCommande,
-- av.DateFacture,
 av.MontantAvanceHT as Ht,
 av.MontantAvanceTVA as Tva,
 av.MontantAvanceTTC as Ttc,
 rs.Sum as montantRestit,
 av.Etat,
 av.modepaiement,
 av.modepaiementID as RefPay,
 av.DateOperation ,
 av.Ras,
 ra.nom as Bank,
 montantPaiement
 from DAF_Avance av
 inner join 
	DAF_FOURNISSEURS fo on (fo.id = av.idfournisseur)
 left join 
	DAF_RIB_ATNER ra on (ra.id = av.bankName)
 left join 
	DAF_factureNavette fn on ( fn.idfacturenavette = av.id)
 left join 
	resumeRestint rs on (rs.idAvance = av.id)
where etat not in ( 'Annuler','TMP') and ([dateoperation] > '2024-01-01' or [dateoperation] is null ) and av.id = @id
`,

  GetAvanceDetailsCount: ` 
	with resumeRestint as (
	select 
		idAvance, 
		sum(Montant) as Sum 
	from DAF_RestitAvance
	where idFacture is not null
		and Etat <> 'Annuler'
	group by idAvance
	)

	SELECT count(*) as count from DAF_Avance av
	inner join 
		DAF_FOURNISSEURS fo on (fo.id = av.idfournisseur)
	left join 
		DAF_RIB_ATNER ra on (ra.id = av.bankName)
	left join 
		DAF_factureNavette fn on ( fn.idfacturenavette = av.id)
	left join 
		resumeRestint rs on (rs.idAvance = av.id)
	where etat not in ( 'Annuler','TMP') and ([dateoperation] > '2024-01-01' or [dateoperation] is null )
	`,

  logTva: `
select
 fs.id,
 fs.CODECHT,
 fs.nom,
 fs.CODEDOCUTIL,
 fs.DateDouc,
 fs.TOTHTNET,
 fs.TOTTVANET,
 fs.TOTALTTC,
 fs.Etat,
 fs.modepaiement, 
 case 
	when  fs.modepaiement = 'paiement virement'
		then fs.modepaiementID 
	when fs.modepaiement = 'paiement cheque'
		then fs.numerocheque
	else 'paiement espece'
 end as RefPay,
 fs.DateOperation ,
 fs.Ras,
 fs.NETAPAYER,
 case 
	when  fs.idDocPaye like 'fr%'
		then 'Facture'
	when fs.idDocPaye like 'Av%'
		then 'Avance'
 end as typeDoc
 from DAF_LOG_FACTURE fs
where etat='Reglee'  
and DateOperation is not null
and DateOperation >= '2024-09-01'
`,

  LogTvaCount: `
 select
count(*) as count 
 from DAF_LOG_FACTURE fs
where etat='Reglee' and DateOperation is not null
and DateOperation >= '2024-09-01'

`,
  LogTvaFilter: `
 select 
 distinct	FORMAT(DateOperation, 'yyyy-MMMM' ) as date
 from DAF_LOG_FACTURE fs
where etat='Reglee'  and DateOperation is not null 
and DateOperation >= '2024-09-01'
  ORDER BY date DESC
`,
};
