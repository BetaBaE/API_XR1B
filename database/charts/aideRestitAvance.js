exports.AideRestitAvance = {
  restitFactureMontantExcte: `
    select 
        fr.nom, 
        fs.numeroFacture,
        fs.DateFacture,
        fs.ttc, 
        rst.Montant as MontantAvance,
        rst.Etat as EtatAvance 
    from DAF_FactureSaisie fs 
        inner join DAF_FOURNISSEURS fr on fs.idfournisseur=fr.id
        left join DAF_RestitAvance rst on rst.nom =fr.nom
    where fs.Etat='Saisie'
		--and fs.AcompteVal=0
        --and fs.AcompteReg=0 
        and abs((fs.TTC-fs.Acompte)-rst.Montant)<5
        and rst.idFacture is null
        and rst.Etat !='Annuler'
    `,

  montantAvanceAndFactureByFournisseur: `
    with FA as (
        select  
        fr.nom,
        sum(fs.TTC) as TotalTTCFactureDisponible 
        from DAF_FactureSaisie fs 
            inner join DAF_FOURNISSEURS fr on fs.idfournisseur=fr.id 
        where fs.Etat='Saisie'
            and fs.AcompteReg=0 and fs.AcompteVal=0
        group by fr.nom
    ),
    RS as (
        select  rst.nom,
            sum(rst.Montant) as MontantTotalNonRestitue
        from DAF_RestitAvance rst 
        where rst.Montant>1
            and rst.idFacture is null
            and rst.Etat !='Annuler'
        group by rst.nom
    )
    select  r.nom,
        f.TotalTTCFactureDisponible, 
        r.MontantTotalNonRestitue
    from FA f 
        inner join RS r on (f.nom =r.nom )
    order by MontantTotalNonRestitue desc
    `,

  montantAvanceNonRestitueByFournisseur: `
    select  rst.nom, 
        sum(rst.Montant) as MontantTotalNonRestitue 
        from DAF_RestitAvance rst 
    where rst.idFacture is null
        and rst.Etat !='Annuler'
    group by rst.nom
    order by sum(rst.Montant) desc
    
  `,
};
