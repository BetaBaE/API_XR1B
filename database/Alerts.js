exports.Alerts = {
  expirationAttestationFisc: `
		with maxDate as (
	select idFournisseur, max(dateExpiration) as maxDateExpiration from DAF_AttestationFiscal
	group by idFournisseur
)

select  f.id,
        f.nom,
        md.maxDateExpiration as dateExpiration,
        Datediff(dd,GETDATE(),md.maxDateExpiration) as ExpiréDans,
        f.exonorer,
        f.catFournisseur
	from maxDate md 
	    right join DAF_FOURNISSEURS f on md.idFournisseur = f.id
		--left join maxDate md on (md.idFournisseur = f.id)
	where f.id in (
		select idfournisseur from DAF_FactureSaisie
		where etat = 'Saisie'
		union
		select idFournisseur  from DAF_Avance
		where etat = 'Saisie'
	)
--and md.idFournisseur = 616
	and (md.maxDateExpiration < GETDATE() +30 or md.maxDateExpiration is null  )
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

  FactureAyantFN: `
with FANANFN as (
	select fs.* , f.nom from DAF_FactureSaisie fs inner join DAF_FOURNISSEURS f on (fs.idfournisseur = f.id)
	where fs.id not in (select idFacture from DAF_factureNavette)
	and Etat <> 'Annuler' and deletedAt is null
)
select 
	ef.CODEDOCUTIL as id,
	fa.numeroFacture,
	ef.nom , 
	DateFacture, 
	CODEAFFAIRE, 
	ef.TOTALTTC as 'TTC Sage', 
	fa.TTC as 'TTC App', 
	RTCFIELD2 as FN  
from 
	ENTETEFACTUREFOURNISSEUR ef 
inner join  FANANFN fa 
on (ef.RTCFIELD1 = fa.numeroFacture  and ef.nom = fa.nom and ef.DATEDOC = fa.DateFacture)
where 
DATEDOC >= '2022-01-01'
and ef.CLEETATDOC <> 52
`,

  FactureAyantFNCount: `
with FANANFN as (
	select fs.* , f.nom from DAF_FactureSaisie fs inner join DAF_FOURNISSEURS f on (fs.idfournisseur = f.id)
	where fs.id not in (select idFacture from DAF_factureNavette)
	and Etat <> 'Annuler' and deletedAt is null
)
select 
	count(*) as   count 
from	ENTETEFACTUREFOURNISSEUR ef 
inner join  FANANFN fa 
on (ef.RTCFIELD1 = fa.numeroFacture  
and ef.nom = fa.nom 
and ef.DATEDOC = fa.DateFacture)
where 
DATEDOC >= '2022-01-01'
and ef.CLEETATDOC <> 52
`,
};
