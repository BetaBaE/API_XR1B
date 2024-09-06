exports.Alerts = {
  expirationAttestationFisc: `
	select f.id,
        f.nom,
        af.dateDebut,
        af.dateExpiration,
        Datediff(dd,GETDATE(),af.dateExpiration) as ExpiréDans,
        f.exonorer,
        f.catFournisseur
	from DAF_AttestationFiscal af
	    right join DAF_FOURNISSEURS f on af.idFournisseur = f.id
	where f.id in (
		select idfournisseur from DAF_FactureSaisie
		where etat = 'Saisie'
		union
		select idFournisseur  from DAF_Avance
		where etat = 'Saisie'
	)
	and (af.dateExpiration < GETDATE() +30 or af.dateExpiration is null  )
	and f.exonorer = 'non'
    `,

  expirationAttestationFiscCount: `		
    select count(*) as count
	from DAF_AttestationFiscal af
	    right join DAF_FOURNISSEURS f on af.idFournisseur = f.id
	where f.id in (
		select idfournisseur from DAF_FactureSaisie
		where etat = 'Saisie'
		union
		select idFournisseur  from DAF_Avance
		where etat = 'Saisie'
	)
	and (af.dateExpiration < GETDATE() +30 or af.dateExpiration is null  )
	and f.exonorer = 'non'`,

  rasTva: `
	                       select distinct
                                rt.RefernceDOC as id,
                f.catFournisseur ,
                concat(' ',f.Identifiantfiscal) as 'Identifiant fiscal',
                concat(' ',f.ICE) as ICE,
                rt.nom,
                rt.RefernceDOC,
                rt.CategorieFn,
                rt.dateFactue,
                lf.DateOperation,
                rt.HT,
                concat(rt.Pourcentage_TVA,'%') as 'Pourcentage TVA',
                rt.TauxTva,
                concat(rt.PourcentageRas,'%') as 'Pourcentage Ras',
                rt.RaS,
                                format(lf.DateOperation,'yyyy-MMMM') DateOperation2
        from DAF_RAS_Tva rt
        inner join  DAF_LOG_FACTURE lf on(
                                                                                rt.idDocPaye = lf.idDocPaye
                                                                                and lf.etat = rt.etat
                                                                                )
        inner join DAF_FOURNISSEURS f on (rt.nom = f.nom)
        where rt.etat= 'Reglee' 
`,
  countRasTVA: `
	select distinct
	count(*) as count
	from DAF_RAS_Tva rt 
	inner join  DAF_LOG_FACTURE lf on(
									rt.idDocPaye = lf.idDocPaye 
									and lf.etat = rt.etat
									)
	inner join DAF_FOURNISSEURS f on (rt.nom = f.nom)
	where rt.etat= 'Reglee'  
`,
  FilterRASTva: `
	select distinct
	format(lf.DateOperation,'yyyy-MMMM') as 'id',
	format(lf.DateOperation,'yyyy-MMMM') as 'DateFilter'
	from DAF_RAS_Tva rt 
	inner join  DAF_LOG_FACTURE lf on(
									rt.idDocPaye = lf.idDocPaye 
									and lf.etat = rt.etat
									)
	inner join DAF_FOURNISSEURS f on (rt.nom = f.nom)
	where rt.etat= 'Reglee'  
`,
};
