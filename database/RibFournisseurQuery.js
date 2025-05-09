exports.ribFournisseur = {
  // Crée un nouveau RIB Fournisseur
  create: `
    INSERT INTO [dbo].[DAF_RIB_Fournisseurs]
    ([FournisseurId], [rib], [swift], [banque], [Redacteur], [datesaisie],iban)
    VALUES (@FournisseurId, @rib, @swift, @banque, @Redacteur, GETDATE(),@iban)
  `,

  // Récupère tous les RIB Fournisseurs avec le nom du fournisseur
  getAll: `
    SELECT rf.*, f.nom AS fournisseur 
    FROM [dbo].[DAF_RIB_Fournisseurs] rf
    JOIN DAF_FOURNISSEURS f ON rf.fournisseurid = f.id
  `,

  // Compte le nombre total de RIB Fournisseurs
  getCount: `
    SELECT COUNT(*) AS count 
    FROM [dbo].[DAF_RIB_Fournisseurs]
  `,

  // Met à jour un RIB Fournisseur
  edit: `
    UPDATE [dbo].[DAF_RIB_Fournisseurs]
    SET Validateur = @validateur,
        validation = @validation,
        DateModification = GETDATE()
    WHERE id = @id
  `,

  // Récupère un RIB Fournisseur par ID
  getOne: `
    SELECT rf.*, f.nom AS fournisseur 
    FROM [dbo].[DAF_RIB_Fournisseurs] rf
    JOIN DAF_FOURNISSEURS f ON rf.fournisseurid = f.id
    WHERE rf.id = @id
  `,

  // Récupère les RIB Fournisseurs validés
  RibsValid: `
    SELECT * 
    FROM [dbo].[DAF_RIB_Fournisseurs] 
    WHERE validation = 'Validé'
  `,

  // Récupère les RIB Fournisseurs distincts validés
  ribfournisseursvalid: `
    SELECT DISTINCT * 
    FROM [dbo].[DAF_RIB_Fournisseurs]
    WHERE validation = 'validé'
  `,
};
