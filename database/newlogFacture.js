exports.logfacture = {
  GetFactureDetails: `
    select
 fs.id,
 fs.codechantier,
 fo.nom,
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
where etat <> 'Annuler' and ([dateoperation] > @dateExercices or [dateoperation] is null )
`,
  GetFactureDetailsCount: `
    SELECT count(*) as count from DAF_FactureSaisie fs
    inner join 
      DAF_FOURNISSEURS fo on (fo.id = fs.idfournisseur)
    left join 
      DAF_RIB_ATNER ra on (ra.id = fs.bankName)
    where etat <> 'Annuler' and ([dateoperation] > @dateExercices or [dateoperation] is null )
`,
};
