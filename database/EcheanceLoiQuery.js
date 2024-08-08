exports.EcheanceLoi = {
  // Récupère toutes les échéances de loi avec les détails des fournisseurs
  getAllecheanceLoi: `
    SELECT  erf.id as id ,nom,fou.id as idfournisseur,
        [modalitePaiement]
        ,[dateecheance]
    FROM [DAF_echeanceloiFournisseur] erf
    inner join DAF_FOURNISSEURS fou
    on  erf.idfournisseur=fou.id
    where 1=1
    `,

  // Récupère le nombre total d'échéances de loi
  getAllecheanceLoiCount: `
    SELECT   COUNT(*) as count
    FROM [dbo].[DAF_echeanceloiFournisseur]
      `,

  // Crée une nouvelle échéance de loi pour un fournisseur
  create: `INSERT INTO [dbo].[DAF_echeanceloiFournisseur]
    ([idfournisseur]
    ,[modalitePaiement]
    ,[dateecheance]
    ,[Redacteur]
    ,[datesaisie]) values 
    (@idfournisseur,@modalitePaiement,@dateecheance,@Redacteur,
      getdate())`,

  // Récupère la modalité de paiement de la dernière échéance pour un fournisseur donné
  getEcheanceLoibyfournisseur: `select modalitePaiement from DAF_echeanceloiFournisseur
    where idfournisseur=@idfournisseur
    and id =(select max(id) from DAF_echeanceloiFournisseur
          where idfournisseur=@idfournisseur
          group by idfournisseur)
  `,
};
