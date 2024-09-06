exports.overdueInvoicesQuery = {
  query: `
with antecedant as (
	select sum(TTC - AcompteVal) as montant from DAF_FactureSaisie
	where TTC - AcompteVal > 0
	and Etat in ('Saisie')
	and DATEADD(day,60, DateFacture) <= getdate()  -- 60 jrs echance 
),
-- 84 458 257.740

unMois as (
	select sum(TTC - AcompteVal) as montant  from DAF_FactureSaisie
	where TTC - AcompteVal > 0
	and Etat in ('Saisie')
	and DATEADD(day,60, DateFacture) >  getdate()                   -- 60 jrs echance facture > today date
	and DATEADD(day,60, DateFacture) <=  dateadd(day,30,getdate())  -- 60 jrs echance facture <=  today date + 30 jrs
),
-- 22 923 145.190
deuxMois as (
	select sum(TTC - AcompteVal) as montant from DAF_FactureSaisie
	where TTC - AcompteVal > 0
	and Etat in ('Saisie')
	and DATEADD(day,60, DateFacture) >  dateadd(day,30,getdate())
	and DATEADD(day,60, DateFacture) <=  dateadd(day,60,getdate())
)

-- 2 177 815.610
select* from (
select 'Antecedant' as id,'Echu' as name,   a.montant from antecedant a
union
select 'Un mois' as id,'Un mois' as name,  u.montant from unMois u
union  
select 'Deux mois' as id,'Deux mois' as name,  d.montant from deuxMois d
union  
select 'Total' as id,'Total' as name,  a.montant+ u.montant + d.montant from antecedant a, unMois u,deuxMois d)t
order by montant desc
`,
};
