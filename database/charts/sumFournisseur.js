exports.sumFournisseur = {
  query: `
    select f.id,
    UPPER(f.nom) as nom, 
    sum(fs.ttc - fs.AcompteVal) as NetApayer
    from DAF_FactureSaisie fs inner join DAF_FOURNISSEURS f
    on fs.idfournisseur = f.id
    where fs.Etat = 'Saisie'
    group by f.id,f.nom
`,
};
exports.sumChantier = {
  query: `
    select c.id,
    UPPER(c.LIBELLE) as nomChantier, 
    sum(fs.ttc - fs.AcompteVal) as NetApayer
    from DAF_FactureSaisie fs inner join chantier c
    on fs.codechantier = c.id
    where fs.Etat = 'Saisie'
    group by c.id,c.LIBELLE
`,
};
//Résumé Mensuel des Factures

exports.sumMensuel = {
  query: `
with SumFAAyantFN as(select 
cast(format(fa.DateFacture,'yyyy-MM-01') as date) id,
sum(fa.TTC - fa.AcompteVal) TTCMois
from DAF_factureNavette fn inner join DAF_FactureSaisie fa on (fn.idFacture = fa.id)
where fa.etat='Saisie'
group by  cast(format(fa.DateFacture,'yyyy-MM-01') as date)
)

select 
cast(format(fs.DateFacture,'yyyy-MM-01') as date) id,
sum(fs.TTC - fs.AcompteVal) TTCMois,
datediff(month,cast(format(fs.DateFacture,'yyyy-MM-01') as date),getdate()) as anc,
COALESCE ( sf.TTCMois,0.00) 'SumFN',
round(100*(sum(fs.TTC - fs.AcompteVal)/sum(sum(fs.TTC - fs.AcompteVal)) over ()),2) as prcnt
from DAF_FactureSaisie fs  left join SumFAAyantFN sf on (cast(format(fs.DateFacture,'yyyy-MM-01') as date) = sf.id)
where fs.etat='Saisie'
group by  cast(format(fs.DateFacture,'yyyy-MM-01') as date),sf.TTCMois
order by id desc
`,
};

exports.SumForMonth = {
  query: `
  with SumFAAyantFNGroupeByFour as (
select 
fr.id as id, 
sum(fs.TTC - fs.AcompteVal) SumFaByFour
from DAF_factureNavette fn 
	inner join DAF_FactureSaisie fs on (fn.idFacture = fs.id) 
	left join DAF_FOURNISSEURS fr on fs.idfournisseur = fr.id
where cast(format(fs.DateFacture,'yyyy-MM-01') as date) =@date  --'2019-10-01T00:00:00.000'
and fs.Etat  = 'Saisie' 
group by fr.id
)


select fr.nom as id, 
sum(fs.TTC - fs.AcompteVal) TotalFournisseur,
COALESCE (sff.SumFaByFour,0) SumFaByFour 
from DAF_FactureSaisie fs
left join DAF_FOURNISSEURS fr on fs.idfournisseur = fr.id
left join SumFAAyantFNGroupeByFour sff on sff.id = fr.id
where cast(format(fs.DateFacture,'yyyy-MM-01') as date) =@date --'2019-10-01T00:00:00.000'  
and fs.Etat = 'Saisie'
group by fr.nom,sff.SumFaByFour
order by sum(fs.TTC - fs.AcompteVal) desc
  `,

  effetEcheance: `
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
      DATEDIFF(DAY, CAST(GETDATE() AS DATE), COALESCE(c.dateecheance, DATEADD(DAY, -120, GETDATE()))) AS jrRestant,
      c.dateecheance,
      l.numerocheque as 'effet',
      r.nom as BANK,
      c.montantVirement as Montant,
      l.NOM
      /* ,l.TotalTTC 
      ,c.montantVirement,
      l.TotalTTC-
      c.montantVirement*/
    FROM 
      DAF_cheque c
    LEFT JOIN  
      CTE_LogFacture l ON l.numerocheque = c.numerocheque AND l.ModePaiementID = c.RibAtnerId
    LEFT JOIN 
      DAF_RIB_ATNER r ON r.id = l.ModePaiementID
    WHERE 
      l.etat = 'En cours' 
    and c.dateecheance is not null
    ORDER BY 
      jrRestant;
  `,
};
