exports.Alerts = {
  expirationAttestationFisc: `
	select f.id,
        f.nom,
        af.dateDebut,
        af.dateExpiration,
        Datediff(dd,GETDATE(),af.dateExpiration) as Expiré,
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
};
