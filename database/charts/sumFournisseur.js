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
exports.sumChantier= {
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
