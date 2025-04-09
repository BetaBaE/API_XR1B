exports.faNotPayed = {
  chart: `
    select 1 as id ,'FA sans FN' as name ,sum(ttc- Acompte) as value  from DAF_FactureSaisie
    where etat = 'Saisie'
    and deletedAt is null
    and id not in (select idFacture from DAF_factureNavette)
    and DateFacture <getdate()-20
    union
    select 2 as id , 'FA avec FN' as name , sum(ttc- Acompte) as value from DAF_FactureSaisie
    where etat = 'Saisie'
    and deletedAt is null
    and id in (select idFacture from DAF_factureNavette)
    and DateFacture <getdate()-20
    `,

  tableSum: `
    select fs.codechantier as id ,fs.codechantier , sum(fs.ttc- fs.Acompte) as TotTTC ,min(fs.datefacture) as MinDate, max(fs.datefacture) as MaxDate, count(*) as NombreFacture from DAF_FactureSaisie fs inner join DAF_FOURNISSEURS fr on fr.id=fs.idfournisseur
    where not exists( select 1 from DAF_factureNavette where fs.id= idFacture)
    and fs.Etat ='Saisie' and fs.deletedAt is null and fs.DateFacture <getdate()-20
    group by fs.codechantier 
    having  abs(sum(fs.ttc- fs.Acompte))  >2
    order by sum(fs.ttc)desc , count(*) desc
    `,

  situationFournisseur: `
select fr.id,fr.nom , sum(fs.ttc- fs.Acompte) as TotTTC ,min(fs.datefacture) as MinDate, max(fs.datefacture) as MaxDate, count(*) as NombreFacture from DAF_FactureSaisie fs inner join DAF_FOURNISSEURS fr on fr.id=fs.idfournisseur
where not exists( select 1 from DAF_factureNavette where fs.id= idFacture)
and fs.Etat ='Saisie' and fs.deletedAt is null and fs.DateFacture <getdate()-20
group by fr.id,fr.nom
having  abs(sum(fs.ttc- fs.Acompte))  >2
order by sum(fs.ttc)desc , count(*) desc
    `,

  factureSaisieByFour: `
    select fs.id,
      fs.codechantier,
      numeroFacture,
      DateFacture,
      HT ,
      MontantTVA,
      TTC
      from DAF_FactureSaisie fs inner join DAF_FOURNISSEURS fr on fr.id=fs.idfournisseur
      where not exists( select 1 from DAF_factureNavette where fs.id= idFacture)
      and fs.Etat ='Saisie' and fs.deletedAt is null and fs.DateFacture <getdate()-20
    and fr.id = @id
    `,
};
