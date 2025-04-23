exports.Fournisseurs = {
  // Récupère les fournisseurs avec des informations complètes
  getFournisseurClean: `
    SELECT * FROM DAF_FOURNISSEURS
    WHERE ICE IS NOT NULL 
      AND catFournisseur IS NOT NULL
      AND Identifiantfiscal IS NOT NULL
  `,

  // Recherche des fournisseurs par nom
  getNomfournisseur: `
    SELECT nom FROM DAF_FOURNISSEURS 
    WHERE nom LIKE '%' + @nom + '%'
  `,

  // Récupère tous les fournisseurs avec échéance loi
  getallfournisseurwithecheanceLoi: `
    SELECT * FROM DAF_FOURNISSEURS
    WHERE id IN (
      SELECT [idfournisseur]
      FROM [dbo].[DAF_echeanceloiFournisseur]
    )
  `,

  // Récupère tous les fournisseurs avec leurs échéances
  getAllFournisseurs: `
    SELECT fou.datecreation, fou.id, fou.Redacteur, fou.addresse, 
           fou.CodeFournisseur, fou.Identifiantfiscal, fou.ICE, 
           fou.nom, fou.exonorer, 
           echr.modalitePaiement AS echeancereel, 
           echl.modalitePaiement AS echeanceloi,
           fou.mail, fou.catFournisseur
    FROM DAF_FOURNISSEURS fou
    LEFT JOIN (
      SELECT idfournisseur, MAX(id) AS id
      FROM DAF_echeanceloiFournisseur 
      GROUP BY idfournisseur
    ) AS echl_max ON fou.id = echl_max.idfournisseur
    LEFT JOIN DAF_echeanceloiFournisseur echl ON echl.id = echl_max.id
    LEFT JOIN (
      SELECT idfournisseur, MAX(id) AS id
      FROM DAF_echeanceReelFournisseur 
      GROUP BY idfournisseur
    ) AS echr_max ON fou.id = echr_max.idfournisseur
    LEFT JOIN DAF_echeanceReelFournisseur echr ON echr.id = echr_max.id
    WHERE 1 = 1
  `,

  // Compte le nombre de fournisseurs
  getFournisseursCount: `
    SELECT COUNT(*) AS count FROM DAF_FOURNISSEURS
  `,

  // Crée un nouveau fournisseur
  createFournisseur: `
    INSERT INTO DAF_FOURNISSEURS(CodeFournisseur, nom, ICE, Identifiantfiscal, mail, addresse, Redacteur, catFournisseur, RasIr)
    VALUES(@CodeFournisseur, @nom, @ICE, @IF, @mail, @addresse, @Redacteur, @catFournisseur,@RasIr)
  `,

  // Récupère les RIBs des fournisseurs validés
  RibsFournisseurValid: `
    SELECT f.nom, f.catFournisseur, f.CodeFournisseur, rf.*, f.exonorer
    FROM [dbo].[DAF_FOURNISSEURS] f
    JOIN [dbo].[DAF_RIB_Fournisseurs] rf ON f.id = rf.FournisseurId
    WHERE rf.validation = 'Confirmer'
      AND f.id NOT IN (
        SELECT FournisseurId 
        FROM daf_virements 
        WHERE ordervirementId = @ovId 
          AND etat <> 'Annuler'
      )
      AND f.catFournisseur IS NOT NULL
  `,

  // Récupère un fournisseur par ID
  getOne: `
    SELECT * FROM DAF_FOURNISSEURS WHERE id = @id
  `,

  // Met à jour un fournisseur existant
  update: `
    UPDATE DAF_FOURNISSEURS 
    SET catFournisseur = @catFournisseur,
        ICE = @ICE,
        Identifiantfiscal = @Identifiantfiscal,
        mail = @mail,
        addresse = @addresse,
        exonorer = @exonorer,
        RasIr = @RasIr
    WHERE id = @id
  `,

  fournisseurMatchsByName: `
  SELECT * FROM dbo.GetFormattedSupplierInfo(@name)
  `,
};
