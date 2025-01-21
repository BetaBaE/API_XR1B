exports.AtnerPaiement = {
  paiementByMonth: `
    
    select TOP 24 FORMAT(t.DateOperation, 'yyyy-MM') id,FORMAT(t.DateOperation, 'yyyy-MM') name, sum(montantPaiement) TTC
    from (
        select dateoperation,montantPaiement,Etat from DAF_FactureSaisie
        where etat = 'Reglee'
        and deletedAt is null
        union all
        select dateoperation,montantPaiement,Etat from DAF_Avance
        where etat = 'Reglee'
    ) t
    where t.DateOperation >= '2024-08-01'
    group by FORMAT(DateOperation, 'yyyy-MM')
    order by FORMAT(DateOperation, 'yyyy-MM')
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
