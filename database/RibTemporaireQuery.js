exports.ribTemporaire = {
  // Récupère tous les RIB temporaires avec le nom du fournisseur
  getRibs: `
    SELECT rt.*, f.nom AS fournisseur 
    FROM DAF_RIB_TEMPORAIRE rt
    JOIN DAF_FOURNISSEURS f ON rt.fournisseurid = f.id
  `,

  // Compte le nombre total de RIB temporaires
  getRibCount: `
    SELECT COUNT(*) AS count 
    FROM DAF_RIB_TEMPORAIRE
  `,

  // Crée un nouveau RIB temporaire
  createRibs: `
    INSERT INTO DAF_RIB_TEMPORAIRE (FournisseurId, rib, swift, banque, Redacteur, datesaisie)
    VALUES (@FournisseurId, @rib, @swift, @banque, @Redacteur, GETDATE())
  `,
};
