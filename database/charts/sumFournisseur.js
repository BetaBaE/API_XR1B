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
select 
cast(format(fs.DateFacture,'yyyy-MM-01') as date) id,
sum(fs.TTC - fs.AcompteVal) TTCMois,
datediff(month,cast(format(fs.DateFacture,'yyyy-MM-01') as date),getdate()) as anc,
sum(sum(fs.TTC - fs.AcompteVal)) over () TOTAL,
round(100*(sum(fs.TTC - fs.AcompteVal)/sum(sum(fs.TTC - fs.AcompteVal)) over ()),2) as prcnt
from DAF_FactureSaisie fs 
where fs.etat='Saisie'
--and year(fs.datefacture)>2022
group by  cast(format(fs.DateFacture,'yyyy-MM-01') as date)
order by id desc
`,
};

exports.SumForMonth = {
  query: `
  select fr.nom as id, 
sum(fs.TTC - fs.AcompteVal) TotalFournisseur,
sum(sum(fs.TTC - fs.AcompteVal)) over() as TotalMois
from DAF_FactureSaisie fs
left join DAF_FOURNISSEURS fr on fs.idfournisseur = fr.id
where cast(format(fs.DateFacture,'yyyy-MM-01') as date) = @date --2019-10-01T00:00:00.000
and fs.Etat = 'Saisie'
group by fr.nom
order by sum(fs.TTC - fs.AcompteVal) desc
  `,
};
