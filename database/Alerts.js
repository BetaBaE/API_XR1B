exports.Alerts = {
  expirationAttestationFisc: `
/*		with maxDate as (
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
	and f.exonorer = 'non'*/
	with expire30 as (
select at.idFournisseur,fr.nom, max(dateExpiration) DateExpiration, DATEDIFF(day,getdate(),max(dateExpiration)) Restant
from DAF_AttestationFiscal at 
join DAF_FOURNISSEURS fr on at.idFournisseur=fr.id

group by at.idFournisseur,fr.nom
Having max(dateExpiration)< DATEADD(day,30,getdate())
--order by restant
),

frWfa as (
select idfournisseur, min(DateFacture) minfa
from DAF_FactureSaisie fs 
--left join DAF_FOURNISSEURS fr on fs.idfournisseur=fr.id
where Etat='Saisie'
group by idfournisseur
having min(DateFacture) >'2024-01-01'
)
select idfournisseur as id,* from expire30 e
where exists(select 1 from frWfa where idfournisseur=e.idFournisseur)

    `,

  expirationAttestationFiscCount: `		
    /*select count(*) as count
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
	and f.exonorer = 'non'*/
	with expire30 as (
select at.idFournisseur,fr.nom, max(dateExpiration) DateExpiration, DATEDIFF(day,getdate(),max(dateExpiration)) Restant
from DAF_AttestationFiscal at 
join DAF_FOURNISSEURS fr on at.idFournisseur=fr.id

group by at.idFournisseur,fr.nom
Having max(dateExpiration)< DATEADD(day,30,getdate())
--order by restant
),

frWfa as (
select idfournisseur, min(DateFacture) minfa
from DAF_FactureSaisie fs 
--left join DAF_FOURNISSEURS fr on fs.idfournisseur=fr.id
where Etat='Saisie'
group by idfournisseur
having min(DateFacture) >'2024-01-01'
)
select count(*) as count
 from expire30 e
where exists(select 1 from frWfa where idfournisseur=e.idFournisseur)
	
	`,

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
		and abs(rt.RaS) > 3
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
	format(lf.DateOperation,'yyyy-MM') as 'id',
	format(lf.DateOperation,'yyyy-MM') as 'DateFilter'
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
	and Etat = 'Saisie' and deletedAt is null
)
select 
	ef.CODEDOCUTIL as id,
	fa.numeroFacture,
	ef.nom , 
	DateFacture, 
	CODEAFFAIRE, 
	ef.TOTALTTC as 'TTCSage', 
	fa.TTC as 'TTCApp',
	Sum(fa.TTC) Over () as sum,
	RTCFIELD2 as FN  
from 
	ENTETEFACTUREFOURNISSEUR ef 
inner join  FANANFN fa 
on (
replace(replace(ef.RTCFIELD1,'-','_'),'/','_') = replace(replace(fa.numeroFacture,'-','_'),'/','_')  
and ef.nom = fa.nom 
and Format(CAST(ef.DATEDOC as date),'yyyy-MM-dd') = Format(fa.DateFacture,'yyyy-MM-dd'))
where 
DATEDOC >= '2022-01-01'
and ef.CLEETATDOC <> 52
`,

  FactureAyantFNCount: `
  with FANANFN as (
	select fs.* , f.nom from DAF_FactureSaisie fs inner join DAF_FOURNISSEURS f on (fs.idfournisseur = f.id)
	where fs.id not in (select idFacture from DAF_factureNavette)
	and Etat = 'Saisie'  and deletedAt is null
)
select 
	count(*) as   count 
from 
	ENTETEFACTUREFOURNISSEUR ef 
inner join  FANANFN fa 
on (
replace(replace(ef.RTCFIELD1,'-','_'),'/','_') = replace(replace(fa.numeroFacture,'-','_'),'/','_')  
and ef.nom = fa.nom 
and Format(CAST(ef.DATEDOC as date),'yyyy-MM-dd') = Format(fa.DateFacture,'yyyy-MM-dd'))
where 
DATEDOC >= '2022-01-01'
and ef.CLEETATDOC <> 52
`,

  getFourisseurFA_AV: `
SELECT id, 
       REPLACE(nom, '''', '''''') AS nom
FROM DAF_FOURNISSEURS
WHERE (id IN (SELECT DISTINCT idfournisseur FROM DAF_FactureSaisie where etat <> 'Annuler' or deletedAt is null)
   OR id IN (SELECT DISTINCT idfournisseur FROM DAF_Avance where Etat <> 'Annuler'))
ORDER BY nom
`,

  GetPreparationPaiement: `
	select ROW_NUMBER() OVER (ORDER BY fs.id) AS id,fr.nom,isnull(ec.EcheanceJR,60) as modaliteJrs,
	fs.numeroFacture, fs.DateFacture , fs.ttc,fs.Acompte, (fs.ttc-fs.Acompte) netApayer,fn.ficheNavette as fn,
	dateadd(day,isnull(ec.EcheanceJR,60),fs.DateFacture) as dateEcheance,
	format(dateadd(day,isnull(ec.EcheanceJR,60),fs.DateFacture),'yyyy-MM') as moisEcheance,
	sum(fs.ttc-fs.Acompte) over(partition by fr.nom) CumulFournisseur,
	sum(fs.ttc-fs.Acompte) over() CumulTotal,
	datediff(day,getdate(),dateadd(day,isnull(ec.EcheanceJR,60),fs.DateFacture))*-1 as echuDepuisJrs,
	(datediff(day,getdate(),dateadd(day,isnull(ec.EcheanceJR,60),fs.DateFacture))/30)*-1 as echuDepuisMnt,
	iif(datediff(day,getdate(),dateadd(day,isnull(ec.EcheanceJR,60),fs.DateFacture))/30 <-12,-13,datediff(day,getdate(),dateadd(day,isnull(ec.EcheanceJR,60),fs.DateFacture))/30) as ANC,
	fs.codechantier
	from DAF_FactureSaisie fs
	left join DAF_FOURNISSEURS fr on fr.id=fs.idfournisseur 
	left join DAF_factureNavette fn on fn.idFacture=fs.id
	left join DAF_EcheanceFournisseur ec on ec.idFournisseur=fs.idfournisseur
	where 
	1=1
	and fs.etat='Saisie'
	and dateadd(day,isnull(ec.EcheanceJR,60),fs.DateFacture) <= getdate()
	--and fr.nom not in ('Mev grue','MIDELCO','STE SOFIA SERVICE EXPRESS','Mati trans')
`,

  GetPreparationPaiementCount: `
	select count(*) as count
	from DAF_FactureSaisie fs
	left join DAF_FOURNISSEURS fr on fr.id=fs.idfournisseur 
	left join DAF_factureNavette fn on fn.idFacture=fs.id
	left join DAF_EcheanceFournisseur ec on ec.idFournisseur=fs.idfournisseur
	where 
	1=1
	and fs.etat='Saisie'
	and dateadd(day,isnull(ec.EcheanceJR,60),fs.DateFacture) <= getdate()
`,
  FA_BCsameBC: `
		with FA_BCsameBC as (
select 
fs.id,
fs.BonCommande 'BC', 
fs.numeroFacture,
fs.DateFacture,
f.nom 'FournisseurApp',
e.NOM 'FournisseurSage',
fs.codechantier 'chtApp',
e.CODECHT 'chtSage', 
fs.TTC 'TTCApp',
e.TOTALTTC 'TTCSage',
IIF(fs.codechantier <> e.CODECHT,'Oui','Non') 'EcartChantier',
IIF(f.nom<> e.NOM,'Oui','Non') 'EcartNom',
IIF(fs.TTC > e.TOTALTTC,'Oui','Non') 'RiskEcartTTC'
FROM dbo.DAF_FactureSaisie fs
inner join ENTETECDEFOURNISSEUR e on fs.BonCommande = e.CODEDOCUTIL --and e.CODECHT <> fs.codechantier
left join DAF_FOURNISSEURS f on fs.idfournisseur = f.id
where fs.etat not in ( 'Annuler','Reglee')

)

select * from FA_BCsameBC where 1=1
`,

  FA_BCsameBCCount: `
	with FA_BCsameBC as (
		select 
		fs.id,
		fs.BonCommande 'BC', 
		fs.numeroFacture,
		fs.DateFacture,
		f.nom 'FournisseurApp',
		e.NOM 'FournisseurSage',
		fs.codechantier 'chtApp',
		e.CODECHT 'chtSage', 
		fs.TTC 'TTCApp',
		e.TOTALTTC 'TTCSage',
		IIF(fs.codechantier <> e.CODECHT,'Oui','Non') 'EcartChantier',
		IIF(f.nom<> e.NOM,'Oui','Non') 'EcartNom',
		IIF(fs.TTC > e.TOTALTTC,'Oui','Non') 'RiskEcartTTC'
		from DAF_FactureSaisie fs
		inner join ENTETECDEFOURNISSEUR e on fs.BonCommande = e.CODEDOCUTIL --and e.CODECHT <> fs.codechantier
		left join DAF_FOURNISSEURS f on fs.idfournisseur = f.id
		where fs.etat not in ( 'Annuler','Reglee')

	)



	select count(*) as count from FA_BCsameBC where 1=1
`,

  locationSituation: `
SELECT l.[id]
      ,[nom]
      ,[designation]
      ,[quantite]
      ,[prixUnitaire]
      ,[totalLigneHT]
      ,[totFourniHT]
      ,concat(c.id,' | ',c.LIBELLE) codeAffaire
      ,[totAffaireHT]
      ,[mois]
      ,[totMoisHT]
      ,[ann]
      ,[totAnHT]
      ,[categorie]
	FROM [APP_COMPTA].[dbo].[DAF_location] l
	inner join chantier c on l.codeAffaire = c.id
	where 1=1 
 
  `,
  locationSituationCount: `
  SELECT COUNT(*) as count
  FROM [APP_COMPTA].[dbo].[DAF_location] l
  inner join chantier c on l.codeAffaire = c.id
  `,

  rasIr: `
				select 
			rt.id as id,
                f.catFournisseur ,
                concat(' ',f.Identifiantfiscal) as 'Identifiant fiscal',
                concat(' ',f.ICE) as ICE,
                rt.nom,
                rt.CODEDOCUTIL 'NumDoc',
                --rt.CatFN,
                rt.DateDouc 'dateFacture',
                lf.DateOperation,
                rt.TOTHTNET,
                --concat(rt.Pourcentage_TVA,'%') as 'Pourcentage TVA',
               -- rt.TauxTva,
                --concat(rt.PourcentageRas,'%') as 'Pourcentage Ras',
                rt.RASIR,
				format(lf.DateOperation,'yyyy-MM') DateOperation2
        from DAF_LOG_FACTURE rt
        inner join  DAF_LOG_FACTURE lf on(
			rt.idDocPaye = lf.idDocPaye
			and lf.etat = rt.etat
			)
        inner join DAF_FOURNISSEURS f on (rt.nom = f.nom)
        where rt.etat= 'Reglee' 
		and abs(rt.RASIR) > 0.1
`,
  countRasIR: `
	select 
	count(*) as count
	from DAF_LOG_FACTURE rt
	inner join  DAF_LOG_FACTURE lf on(
	rt.idDocPaye = lf.idDocPaye
	and lf.etat = rt.etat
	)
	inner join DAF_FOURNISSEURS f on (rt.nom = f.nom)
	where rt.etat= 'Reglee' 
	and abs(rt.RASIR) > 0.1 
`,
  FilterRASIR: `
	select distinct
	format(lf.DateOperation,'yyyy-MM') as 'id',
	format(lf.DateOperation,'yyyy-MM') as 'DateFilter'
	from DAF_LOG_FACTURE rt
	inner join  DAF_LOG_FACTURE lf on(
	rt.idDocPaye = lf.idDocPaye
	and lf.etat = rt.etat
	)
	inner join DAF_FOURNISSEURS f on (rt.nom = f.nom)
	where rt.etat= 'Reglee' 
	and abs(rt.RASIR) > 0.1 
`,
};
