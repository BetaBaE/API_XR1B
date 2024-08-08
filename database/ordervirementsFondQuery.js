exports.ordervirementsFond = {
  // Compte les virements de l'année en cours
  getCountByYear: `
    SELECT COUNT(*) + 1 AS count
    FROM [dbo].[DAF_Order_virements_Fond]
    WHERE datecreation LIKE '%${new Date().getFullYear()}%'
  `,

  // Compte total des virements
  getCount: `
    SELECT COUNT(*) AS count 
    FROM [dbo].[DAF_Order_virements_Fond]
  `,

  // Crée un nouveau virement
  create: `
    INSERT INTO [dbo].[DAF_Order_virements_Fond]
    ([id], [directeursigne], [ribAtner], [Redacteur])
    VALUES (@id, @directeursigne, @ribAtner, @Redacteur)
  `,

  // Récupère tous les virements avec détails
  getAll: `
    SELECT ov.*, ra.nom, ra.rib
    FROM [dbo].[DAF_Order_virements_Fond] ov
    JOIN [dbo].[DAF_RIB_ATNER] ra ON ov.ribAtner = ra.id
  `,

  // Récupère un virement spécifique par ID
  getOne: `
    SELECT ov.*, ra.nom, ra.rib
    FROM [dbo].[DAF_Order_virements_Fond] ov
    JOIN [dbo].[DAF_RIB_ATNER] ra ON ov.ribAtner = ra.id
    WHERE ov.id = @id
  `,

  // Met à jour un virement
  update: `
    UPDATE [dbo].[DAF_Order_virements_Fond]
    SET [ribAtner] = @ribAtner,
        [directeursigne] = @directeursigne,
        [etat] = @etat
    WHERE id = @id
  `,

  // Récupère les virements en cours
  orderVirementsEnCours: `
    SELECT * FROM [dbo].[DAF_Order_virements_Fond]
    WHERE etat = 'En cours' AND tailleOvPrint < 11
  `,

  // Récupère les virements d'état spécifique
  orderVirementsEtat: `
    SELECT * FROM [dbo].[DAF_Order_virements_Fond]
    WHERE etat IN ('En cours') AND total <> 0
  `,

  // Ajoute un montant au total
  AddToTotal: `
    UPDATE [DAF_Order_virements_Fond]
    SET total = total + @montantVirement
    WHERE id = @id
  `,

  // Soustrait un montant du total
  MiunsFromTotal: `
    UPDATE [DAF_Order_virements_Fond]
    SET total = total - @montantVirement
    WHERE id = @id
  `,

  // Récupère les en-têtes pour l'impression
  getHeaderPrint: `
    SELECT ov.*, FORMAT(ov.total, '0.00') AS totalformater, ra.nom, ra.rib
    FROM [dbo].[DAF_Order_virements_Fond] ov
    JOIN [dbo].[DAF_RIB_ATNER] ra ON ov.ribAtner = ra.id
    WHERE ov.id = @ovId
  `,

  // Récupère les corps pour l'impression
  getBodyPrint: `
    SELECT v.[id], orderVirementFondId AS orderVirementId,
           'ATNER' AS nom, RAT.rib,
           FORMAT(montantVirement, '0.00') AS montantVirementModifier,
           v.Etat
    FROM [dbo].[DAF_VIREMENTS_Fond] v
    JOIN [dbo].[DAF_RIB_ATNER] RAT ON v.RibAtnerDestId = RAT.id
    WHERE v.Etat = 'En cours' AND [orderVirementFondId] = @ovId
  `,

  // Met à jour un virement à l'état "Réglé"
  updateVirements: `
    UPDATE [dbo].[DAF_Order_virements_Fond]
    SET Etat = 'Reglee'
    WHERE id = @id
  `,

  // Met à jour la date d'exécution
  updateDateExecution: `
    UPDATE [dbo].[DAF_Order_virements_Fond]
    SET dateExecution = GETDATE()
    WHERE id = @id
  `,

  // Met à jour les virements à l'état "Réglé"
  updatvirementRegler: `
    UPDATE [dbo].[DAF_VIREMENTS_Fond]
    SET Etat = 'Reglee'
    WHERE orderVirementFondId = @id AND etat <> 'Annuler'
  `,

  // Met à jour les virements à l'état "Annulé"
  updateVirementsAnnuler: `
    UPDATE [dbo].[DAF_VIREMENTS_Fond]
    SET Etat = 'Annuler'
    WHERE orderVirementFondId = @id
  `,

  // Met à jour un virement à l'état "Annulé"
  updateordervirementAnnuler: `
    UPDATE [dbo].[DAF_Order_virements_Fond]
    SET Etat = 'Annule', total = 0
    WHERE id = @id
  `,
};
