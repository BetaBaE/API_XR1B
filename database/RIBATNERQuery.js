exports.ribAtner = {
  // Récupère tous les RIB ATNER
  getAll: `
    SELECT * FROM [dbo].[DAF_RIB_ATNER]
  `,

  // Compte le nombre total de RIB ATNER
  getCount: `
    SELECT COUNT(*) AS count 
    FROM [dbo].[DAF_RIB_ATNER]
  `,

  // Crée un nouveau RIB ATNER
  create: `
    INSERT INTO [dbo].[DAF_RIB_ATNER]
    ([nom], [rib], [Redacteur], [dateCreation])
    VALUES (@nom, @rib, @Redacteur, GETDATE())
  `,

  // Met à jour un RIB ATNER
  update: `
    UPDATE [dbo].[DAF_RIB_ATNER]
    SET [nom] = @nom,
        [rib] = @rib,
        [dateModification] = GETDATE(),
        [ModifierPar] = @ModifierPar
    WHERE id = @id
  `,

  // Récupère un RIB ATNER par ID
  getOne: `
    SELECT * FROM [dbo].[DAF_RIB_ATNER]
    WHERE id = @id
  `,

  // Récupère les RIB ATNER valides pour un ordre de virement
  getRibAtnerValid: `
    SELECT * FROM DAF_RIB_ATNER 
    WHERE id NOT IN (
      SELECT ribAtner FROM DAF_Order_virements_Fond WHERE id = @id
    ) AND id NOT IN (
      SELECT RibAtnerDestId FROM DAF_VIREMENTS_Fond WHERE orderVirementFondId = @id
    )
  `,
};
