exports.overdueInvoicesQuery = {
  query: `
  /*
WITH antecedent AS (
    SELECT 
        SUM(CASE WHEN Etat = 'Saisie' THEN TTC - AcompteVal ELSE 0 END) AS montantSaisie,
        SUM(CASE WHEN Etat = 'En cours' THEN TTC - AcompteVal ELSE 0 END) AS montantEnCours
    FROM DAF_FactureSaisie
    WHERE 
        DATEADD(day, 60, DateFacture) <= GETDATE()  -- 60 days overdue
),
unMois AS (
    SELECT 
        SUM(CASE WHEN Etat = 'Saisie' THEN TTC - AcompteVal ELSE 0 END) AS montantSaisie,
        SUM(CASE WHEN Etat = 'En cours' THEN TTC - AcompteVal ELSE 0 END) AS montantEnCours
    FROM DAF_FactureSaisie
    WHERE 
        DATEADD(day, 60, DateFacture) > GETDATE() AND  -- 60 days due date > today
        DATEADD(day, 60, DateFacture) <= DATEADD(day, 30, GETDATE())  -- 60 days due date <= today + 30 days
),
deuxMois AS (
    SELECT 
        SUM(CASE WHEN Etat = 'Saisie' THEN TTC - AcompteVal ELSE 0 END) AS montantSaisie,
        SUM(CASE WHEN Etat = 'En cours' THEN TTC - AcompteVal ELSE 0 END) AS montantEnCours
    FROM DAF_FactureSaisie
    WHERE 
        DATEADD(day, 60, DateFacture) > DATEADD(day, 30, GETDATE()) AND
        DATEADD(day, 60, DateFacture) <= DATEADD(day, 60, GETDATE())
)

SELECT * FROM (
    SELECT 
        'Antecedent' AS id,
        'Echu' AS name,
        a.montantSaisie,
        a.montantEnCours
    FROM antecedent a
    UNION ALL
    SELECT 
        'UnMois' AS id,
        'Un mois' AS name,
        u.montantSaisie,
        u.montantEnCours
    FROM unMois u
    UNION ALL  
    SELECT 
        'DeuxMois' AS id,
        'Deux mois' AS name,
        d.montantSaisie,
        d.montantEnCours
    FROM deuxMois d
    UNION ALL  
    SELECT 
        'Total' AS id,
        'Total' AS name,
        a.montantSaisie + u.montantSaisie + d.montantSaisie AS montantSaisie,
        a.montantEnCours + u.montantEnCours + d.montantEnCours AS montantEnCours
    FROM antecedent a, unMois u, deuxMois d
) t
ORDER BY montantSaisie DESC, montantEnCours DESC;
--==========================================================================
--==========================================================================
--==========================================================================
*/

with FaExtand as (
	
	select idFacture , sum(Montant) as rsMontant from DAF_RestitAvance rs
	where idFacture is not null and etat <> 'Annuler'
	group by idFacture
 
),
    echue as 
(
select 
format(getdate(),'yyyy-MM') Mech,
format(getdate(),'yyyy-MM') name,
SUM(CASE WHEN Etat = 'Saisie' THEN TTC - COALESCE (fe.rsMontant,0) ELSE 0 END) AS montantSaisie,
SUM(CASE WHEN Etat = 'En Cours' THEN TTC - COALESCE (fe.rsMontant,0) ELSE 0 END) AS montantEnCours
--sum((fs.ttc - COALESCE (fe.rsMontant,0) )) netapayer/*,sum((fs.ttc - fs.AcompteVal )) netapayer1*/  
from DAF_FactureSaisie fs
left join DAF_FOURNISSEURS fr on fs.idfournisseur=fr.id
left join DAF_EcheanceFournisseur e on fs.idfournisseur=e.idFournisseur
left join  FaExtand fe on fs.id = fe.idFacture
where 
fs.etat in ('Saisie','En Cours') and 
format(DATEADD(day,iif(e.EcheanceJR is null,60,e.EcheanceJR),fs.DateFacture),'yyyy-MM')<=format(getdate(),'yyyy-MM')
)
,
echeavenir as (
select format(DATEADD(day,iif(e.EcheanceJR is null,60,e.EcheanceJR),fs.DateFacture),'yyyy-MM') mech,
format(DATEADD(day,iif(e.EcheanceJR is null,60,e.EcheanceJR),fs.DateFacture),'yyyy-MM') name,
SUM(CASE WHEN Etat = 'Saisie' THEN TTC - COALESCE (fe.rsMontant,0) ELSE 0 END) AS montantSaisie,
SUM(CASE WHEN Etat = 'En Cours' THEN TTC - COALESCE (fe.rsMontant,0) ELSE 0 END) AS montantEnCours
--sum((fs.ttc - COALESCE (fe.rsMontant,0) )) netapayer/*,sum((fs.ttc - fs.AcompteVal )) netapayer1*/  
from DAF_FactureSaisie fs
left join DAF_FOURNISSEURS fr on fs.idfournisseur=fr.id
left join DAF_EcheanceFournisseur e on fs.idfournisseur=e.idFournisseur
left join  FaExtand fe on fs.id = fe.idFacture
where fs.etat in ('Saisie','En Cours') and format(DATEADD(day,iif(e.EcheanceJR is null,60,e.EcheanceJR),fs.DateFacture),'yyyy-MM')>format(getdate(),'yyyy-MM')

group by format(DATEADD(day,iif(e.EcheanceJR is null,60,e.EcheanceJR),fs.DateFacture),'yyyy-MM')
)

select 'Total' as id,
 'Total' as name,
 sum(montantSaisie) as montantSaisie
, sum (montantEnCours) as  montantEnCours
from (
select * from echue
union all 
select * from echeavenir
) t
union all 
select * from echue
union all 
select * from echeavenir
`,
};
