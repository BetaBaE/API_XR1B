// Exportations pour Chantiers
exports.chantiers = {
  // Récupère tous les chantiers
  getChantiers: `
    SELECT * 
    FROM chantier
  `,

  // Récupère le nombre total de chantiers
  getcountChantier: `
    SELECT COUNT(*) 
    FROM chantier
  `,

  // Récupère les chantiers associés à une facture spécifique
  getChantiersbyfactureid: `
    SELECT * 
    FROM chantier
    WHERE id IN (
      SELECT codechantier 
      FROM DAF_FactureSaisie
      WHERE id = @id  -- Filtre par identifiant de la facture
    )
  `,

  // Récupère les informations de chantier et le rédacteur associé à un bon de commande spécifique
  getChantierbyBc: `
    SELECT ch.LIBELLE AS libelleChantier, REDACTEUR 
    FROM DAf_BonCommande_facture bc
    INNER JOIN chantier ch ON ch.CODEAFFAIRE = bc.CODEAFFAIRE -- Jointure pour obtenir le nom du chantier
    WHERE bc.CODEDOCUTIL = @Boncommande --  Filtre par identifiant du bon de commande
  `,
};
