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
 fs.AcompteReg,
 fs.AcompteVal,
 fs.idAvance,
 fs.Etat,
 fs.modepaiement,
 fs.modepaiementID as RefPay,
 fs.DateOperation ,
 fs.Ras,
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
-- av.DateFacture,
 av.MontantAvanceHT as Ht,
 av.MontantAvanceTVA as Tva,
 av.MontantAvanceTTC as Ttc,
 rs.Sum as montantRestit,
 --av.AcompteReg,
 --av.AcompteVal,
 --av.idAvance,
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
where etat not in ( 'Annuler','TMP') and ([dateoperation] > '2024-01-01' or [dateoperation] is null )
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
 --av.AcompteReg,
 --av.AcompteVal,
 --av.idAvance,
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
select idAvance, sum(Montant) as Sum from DAF_RestitAvance
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
where etat not in ( 'Annuler','TMP') and ([dateoperation] > '2024-01-01' or [dateoperation] is null )`,
};
