exports.AtnerPaiement = {
  paiementByMonth: `
 /*    
 WITH FANotAnnuler AS (
    SELECT TOP 24
        FORMAT(DateFacture, 'yyyy-MM') AS id,
        SUM(TTC) AS TTC,
		avg(sum(TTC ) ) 
 over (ORDER BY format(DateFacture,'yyyy-MM')  ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) as TTCAvg3 
    FROM DAF_FactureSaisie
    WHERE deletedAt IS NULL
      AND Etat <> 'Annuler'
    GROUP BY FORMAT(DateFacture, 'yyyy-MM')
    ORDER BY id DESC
),
P1 as (
SELECT TOP 24
    COALESCE(FORMAT(t.DateOperation, 'yyyy-MM'), f.id) AS id,
    COALESCE(FORMAT(t.DateOperation, 'yyyy-MM'), f.id) AS name,
    COALESCE(SUM(t.montantPaiement),0) AS TTCPay,
    COALESCE(f.TTC,0) AS TTCfa,
	f.TTCAvg3

FROM FANotAnnuler f
LEFT JOIN (
    SELECT DateOperation, montantPaiement, Etat
    FROM DAF_FactureSaisie
    WHERE etat = 'Reglee'
      AND deletedAt IS NULL
      AND DateOperation >= '2024-08-01'
    UNION ALL
    SELECT DateOperation, montantPaiement, Etat
    FROM DAF_Avance
    WHERE etat = 'Reglee'
      AND DateOperation >= '2024-08-01'
) t
    ON f.id = FORMAT(t.DateOperation, 'yyyy-MM')
GROUP BY 
    COALESCE(FORMAT(t.DateOperation, 'yyyy-MM'), f.id),
    f.TTC,
	f.TTCAvg3
UNION ALL
SELECT 
    FORMAT(DATEADD(MONTH, 1, GETDATE()), 'yyyy-MM') AS id,
    FORMAT(DATEADD(MONTH, 1, GETDATE()), 'yyyy-MM') AS name,
    0 AS TTCPay,
    0 AS TTCfa,
    (SELECT AVG(TTC) FROM FANotAnnuler) AS TTCAvg3  -- Calculate average from the CTE
UNION ALL
SELECT 
    FORMAT(DATEADD(MONTH, 2, GETDATE()), 'yyyy-MM') AS id,
    FORMAT(DATEADD(MONTH, 2, GETDATE()), 'yyyy-MM') AS name,
    0 AS TTCPay,
    0 AS TTCfa,
    (SELECT AVG(TTC) FROM FANotAnnuler) AS TTCAvg3
	)

	select P1.id,
	P1.name,
	P1.TTCPay,
	P1.TTCfa ,
	Coalesce(p2.TTCAvg3,0) TTCAvg3
	from P1 left join P1 p2 on P1.id = Format(DATEADD(MONTH,2,Cast(CONCAT(p2.id,'-01') as date)),'yyyy-MM')
	order by P1.id 

  --===============================================================================
  --===============================================================================
  --===============================================================================
*/

With FaExtand as (
	
	select idFacture , sum(Montant) as rsMontant from DAF_RestitAvance rs
	where idFacture is not null and etat <> 'Annuler'
	group by idFacture
 
),

FaEachu as (
select

format(DATEADD(day,iif(e.EcheanceJR is null,60,e.EcheanceJR),fs.DateFacture),'yyyy-MM') mech,
format(DATEADD(day,iif(e.EcheanceJR is null,60,e.EcheanceJR),fs.DateFacture),'yyyy-MM') name,
SUM(CASE WHEN Etat = 'Saisie' THEN TTC - COALESCE (fe.rsMontant,0) ELSE 0 END) AS montantSaisie,
SUM(CASE WHEN Etat = 'En Cours' THEN TTC - COALESCE (fe.rsMontant,0) ELSE 0 END) AS montantEnCours,
SUM(CASE WHEN Etat = 'Reglee' THEN TTC - COALESCE (fe.rsMontant,0) ELSE 0 END) AS montantReglee
from DAF_FactureSaisie fs
left join DAF_FOURNISSEURS fr on fs.idfournisseur=fr.id
left join DAF_EcheanceFournisseur e on fs.idfournisseur=e.idFournisseur
left join  FaExtand fe on fs.id = fe.idFacture
where fs.etat not in ('Annuler') 
and  format(DATEADD(day,iif(e.EcheanceJR is null,60,e.EcheanceJR),fs.DateFacture),'yyyy-MM') >= '2023-06'
--and format(DATEADD(day,iif(e.EcheanceJR is null,60,e.EcheanceJR),fs.DateFacture),'yyyy-MM')>format(getdate(),'yyyy-MM')

group by format(DATEADD(day,iif(e.EcheanceJR is null,60,e.EcheanceJR),fs.DateFacture),'yyyy-MM')
--order by  mech desc
),

FaPay as (

select id , sum(montantPaiement) as TotalPay from (
 SELECT Format(DateOperation,'yyyy-MM') id, montantPaiement, Etat
    FROM DAF_FactureSaisie
    WHERE etat = 'Reglee'
      AND deletedAt IS NULL
      AND DateOperation >= '2023-06-01'
    UNION ALL
    SELECT Format(DateOperation,'yyyy-MM') id, montantPaiement, Etat
    FROM DAF_Avance
    WHERE etat = 'Reglee'
      AND DateOperation >= '2023-06-01' 
	  ) t
	 group by id

),
FANotAnnuler AS (

    SELECT 
        FORMAT(DateFacture, 'yyyy-MM') AS id,
        SUM(TTC) AS TTC
    FROM DAF_FactureSaisie
    WHERE deletedAt IS NULL
      AND Etat <> 'Annuler'
    GROUP BY FORMAT(DateFacture, 'yyyy-MM')
	
)

, res  as (
select TOP 12
COALESCE(fe.mech,fp.id) id,
COALESCE(fe.mech,fp.id) name, 
COALESCE(fp.TotalPay , 0) TTCPay,
COALESCE(fn.TTC,0) TTCfa,
	COALESCE(fe.montantReglee,0) montantReglee,
	COALESCE(fe.montantEnCours,0) montantEnCours,
	COALESCE(iif(fe.montantSaisie<0,0,fe.montantSaisie),0) montantSaisie
--* 
from FaEachu fe 
left join FaPay fp on fe.mech = fp.id
left join FANotAnnuler fn on fn.id = fe.mech

order by id desc
)

select * from res 
order by id  


  `,

  paiementByMonthDetailFournisseur: `
  select f.nom id,f.nom , sum(t.montantPaiement) TTC
	from (
        select dateoperation,montantPaiement,Etat,idfournisseur
		from DAF_FactureSaisie 
        where etat = 'Reglee'
        and deletedAt is null
        union all
        select dateoperation,montantPaiement,Etat ,idFournisseur
		from DAF_Avance
        where etat = 'Reglee'
    ) t left join DAF_FOURNISSEURS f on t.idfournisseur = f.id
	where FORMAT(t.DateOperation, 'yyyy-MM') = @mois
	group by  f.nom
	order by TTC desc
  `,

  paiementByMonthDetailBank: `
  select coalesce(f.nom,'**ESPECE**') id,coalesce(f.nom,'**ESPECE**') name , sum(t.montantPaiement) TTC
	from (
        select dateoperation,montantPaiement,Etat,bankName
		from DAF_FactureSaisie 
        where etat = 'Reglee'
        and deletedAt is null
        union all
        select dateoperation,montantPaiement,Etat ,bankName
		from DAF_Avance
        where etat = 'Reglee'
    ) t left join DAF_RIB_ATNER f on t.bankName = f.id
	where FORMAT(t.DateOperation, 'yyyy-MM') = @mois
	group by  f.nom
	order by TTC desc
  `,

  chequeDetail: `
   WITH CTE_LogFacture AS (
    SELECT 
		ModePaiementID, 
		numerocheque ,
		NOM,
		etat,
		SUM(TOTALTTC) AS TotalTTC
    FROM 
      DAF_LOG_FACTURE
    WHERE 
      etat = 'En cours' 
      AND ModePaiement = 'paiement cheque'
      GROUP BY 
		ModePaiementID, 
		numerocheque,
		NOM,
		etat
    )

    SELECT 
		abs(DATEDIFF(DAY, CAST(GETDATE() AS DATE), datecheque)) AS jrpasse,
		c.datecheque,
		l.numerocheque as 'cheque',
		r.nom as BANK,
		c.montantVirement as Montant,
		l.NOM
    --,c.montantVirement-l.TotalTTC
    FROM 
		DAF_cheque c
    LEFT JOIN  
		CTE_LogFacture l ON l.numerocheque = c.numerocheque AND l.ModePaiementID = c.RibAtnerId
    LEFT JOIN 
		DAF_RIB_ATNER r ON r.id = l.ModePaiementID
    WHERE 
		l.etat = 'En cours' 
		and c.dateecheance is null
    ORDER BY 
      jrpasse desc;
  `,
};
