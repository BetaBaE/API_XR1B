exports.StFournisseur = {
  chefferDAffaire: `
select FORMAT(DateFacture, 'yyyy-MM') as id , FORMAT(DateFacture, 'yyyy-MM') as mois , sum(TTC) as TTC
from DAF_FactureSaisie fa inner join DAF_FOURNISSEURS f on fa.idfournisseur = f.id
where nom = @nom and fa.Etat <> 'Annuler' and fa.deletedAt is null
group by FORMAT(DateFacture, 'yyyy-MM')
order by mois
    `,
};
