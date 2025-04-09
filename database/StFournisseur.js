exports.StFournisseur = {
  chefferDAffaire: `
select FORMAT(DateFacture, 'yyyy-MM') as id , FORMAT(DateFacture, 'yyyy-MM') as mois , sum(TTC) as TTC
from DAF_FactureSaisie fa inner join DAF_FOURNISSEURS f on fa.idfournisseur = f.id
where nom = @nom and fa.Etat <> 'Annuler' and fa.deletedAt is null
group by FORMAT(DateFacture, 'yyyy-MM')
order by mois
    `,

  FAStateForByFournisseur: `
  
with sumFASaisie as(
select 'sumFASaisie' as id ,'FA Saisie' as name, sum(TTC - Acompte) as  NetApaye 
from DAF_FactureSaisie fa 
inner join DAF_FOURNISSEURS f on fa.idfournisseur = f.id
where  f.nom = @nom 
and etat = 'Saisie'
),
--1 143 250.03
FADispoAvecFN as(
select 
'FADispoAvecFN' as id ,
'FADispoAvecFN' as name,
sum(TTC - Acompte) FADispoAvecFN 
from DAF_FactureSaisie fa 
inner join DAF_FOURNISSEURS f on fa.idfournisseur = f.id
where  f.nom = @nom 
and fa.id in (select idFacture from DAF_factureNavette) 
and etat in ('Saisie') and ([dateoperation] > FORMAT(GETDATE(), 'yyyy-01-01') or [dateoperation] is null )
and YEAR(fa.DateFacture) <= YEAR(GETDATE())
),

FAProgPourPaie as (
select 
'FAProgPourPaie' as id ,
'FAProgPourPaie' as name,
COALESCE((sum(TTC - Acompte)),0) as  FAProgPourPaie 
from DAF_FactureSaisie fa 
inner join DAF_FOURNISSEURS f on fa.idfournisseur = f.id
where  f.nom = @nom 
and fa.id in (select idFacture from DAF_factureNavette) 
and etat in ('En cours') and ([dateoperation] > FORMAT(GETDATE(), 'yyyy-01-01') or [dateoperation] is null )
and YEAR(fa.DateFacture) <= YEAR(GETDATE())
)


select * from sumFASaisie
union all 
select * from FADispoAvecFN
union all 
select * from FAProgPourPaie
  
  `,
};
