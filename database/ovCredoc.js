// OVCREDOCQuery.js
exports.ovCredoc = {
  // Get all Credoc payment orders
  getAll: `
    SELECT [id]
          ,[TypePaiement]
          ,[ribAtner]
          ,[dateEcheance]
          ,[joursEcheance]
          ,[dateCreation]
          ,[etat]
          ,[totalDevise]
          ,[Devise]
          ,[dateExecution]
          ,[directeurSigne]
          ,[Redacteur]
    FROM [dbo].[DAF_OV_Credoc]
  `,

  // Count all Credoc payment orders
  getCount: `
    SELECT COUNT(*) AS count 
    FROM [dbo].[DAF_OV_Credoc]
  `,

  // Create a new Credoc payment order (ID must be provided)
  create: `
    INSERT INTO [dbo].[DAF_OV_Credoc]
    ([id]
    ,[TypePaiement]
    ,[ribAtner]
    ,[dateEcheance]
    ,[joursEcheance]
    ,[etat]
    ,[totalDevise]
    ,[Devise]
    ,[Redacteur])
    VALUES 
    (@id, @TypePaiement, @ribAtner, @dateEcheance, @joursEcheance, 
     @etat, @totalDevise, @Devise, @Redacteur)
  `,

  // Update a Credoc payment order
  update: `
    UPDATE [dbo].[DAF_OV_Credoc]
    SET [TypePaiement] = @TypePaiement,
        [ribAtner] = @ribAtner,
        [dateEcheance] = @dateEcheance,
        [joursEcheance] = @joursEcheance,
        [etat] = @etat,
        [totalDevise] = @totalDevise,
        [Devise] = @Devise,
        [dateExecution] = @dateExecution,
        [directeurSigne] = @directeurSigne
    WHERE id = @id
  `,

  // Get one Credoc payment order by ID
  getOne: `
    SELECT * FROM [dbo].[DAF_OV_Credoc]
    WHERE id = @id
  `,

  // Get valid Credoc payment orders
  getValid: `
    SELECT * FROM [dbo].[DAF_OV_Credoc]
    WHERE etat = 'En cours'
  `,

  // Generate a new ID based on the last ID
  getNextId: `
  SELECT COUNT(*) + 1 AS nextId 
  FROM [dbo].[DAF_OV_Credoc] 
  WHERE YEAR(datecreation) = YEAR(GETDATE())
`,
};
