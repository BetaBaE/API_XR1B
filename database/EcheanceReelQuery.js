exports.EcheanceReel = {
  // Récupère toutes les échéances réelles avec les détails des fournisseurs
  getAllecheanceReel: `
    SELECT  erf.id as id, nom, fou.id as idfournisseur,
        [modalitePaiement],
        [dateecheance]
    FROM [DAF_echeanceReelFournisseur] erf
    INNER JOIN DAF_FOURNISSEURS fou
    ON erf.idfournisseur = fou.id
    WHERE 1 = 1
    `,

  // Récupère le nombre total d'échéances réelles
  getAllecheanceReelCount: `
    SELECT COUNT(*) as count
    FROM [dbo].[DAF_echeanceReelFournisseur]
    `,

  // Crée une nouvelle échéance réelle pour un fournisseur
  create: `INSERT INTO [dbo].[DAF_echeanceReelFournisseur]
    ([idfournisseur],
    [modalitePaiement],
    [dateecheance],
    [Redacteur],
    [dateSaisie]) VALUES (@idfournisseur,
      @modalitePaiement,
      @dateecheance,
      @Redacteur,
      getdate())`,

  // Récupère la modalité de paiement de la dernière échéance réelle pour un fournisseur donné
  getEcheanceReelbyfournisseur: `SELECT modalitePaiement FROM DAF_echeanceReelFournisseur
    WHERE idfournisseur = @idfournisseur
    AND id = (SELECT MAX(id) FROM DAF_echeanceReelFournisseur
          WHERE idfournisseur = @idfournisseur
          GROUP BY idfournisseur)
  `,
};
