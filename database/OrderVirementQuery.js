exports.ordervirements = {
  // Récupère les factures par ID de virement
  getfacturebyordervirement: `
    SELECT * FROM DAF_SuivieFacture
    WHERE ordervirementId LIKE '%' + @id + '%';
  `,

  // Compte les virements de l'année en cours
  getCountByYear: `
    SELECT COUNT(*) + 1 AS count
    FROM [dbo].[DAF_Order_virements]
    WHERE datecreation LIKE '%${new Date().getFullYear()}%'
  `,

  // Compte total des virements
  getCount: `
    SELECT COUNT(*) AS count 
    FROM [dbo].[DAF_Order_virements]
  `,

  // Crée un nouveau virement
  create: `
    INSERT INTO [dbo].[DAF_Order_virements]
    ([id], [directeursigne], [ribAtner], [Redacteur])
    VALUES (@id, @directeursigne, @ribAtner, @Redacteur)
  `,

  // Récupère tous les virements avec détails
  getAll: `
    SELECT ov.id, ov.ribAtner, ov.datecreation, ov.etat,
           FORMAT(TotalOV.TotalMontant, '0.00') AS total,
           ov.dateExecution, ov.directeursigne, ov.Redacteur,
           ra.nom, ra.rib
    FROM [dbo].[DAF_Order_virements] ov
    JOIN [dbo].[DAF_RIB_ATNER] ra ON ov.ribAtner = ra.id
    JOIN (
      SELECT orderVirementId AS id, SUM(montantvirement) AS TotalMontant
      FROM DAF_VIREMENTS
      WHERE Etat <> 'Annuler'
      GROUP BY orderVirementId
    ) TotalOV ON ov.id = TotalOV.id
  `,

  // Récupère un virement spécifique par ID
  getOne: `
    SELECT ov.*, ra.nom, ra.rib
    FROM [dbo].[DAF_Order_virements] ov
    JOIN [dbo].[DAF_RIB_ATNER] ra ON ov.ribAtner = ra.id
    WHERE ov.id = @id
  `,

  // Met à jour un virement
  update: `
    UPDATE [dbo].[DAF_Order_virements]
    SET [ribAtner] = @ribAtner,
        [directeursigne] = @directeursigne,
        [etat] = @etat
    WHERE id = @id
  `,

  // Récupère les virements en cours
  orderVirementsEnCours: `
    SELECT * FROM [dbo].[DAF_Order_virements]
    WHERE etat = 'En cours' AND dateExecution IS NULL
  `,

  // Récupère les virements d'état spécifique
  orderVirementsEtat: `
    SELECT * FROM [dbo].[DAF_Order_virements]
    WHERE etat IN ('En cours') AND total <> 0
  `,

  // Ajoute un montant au total
  AddToTotal: `
    UPDATE [DAF_Order_virements]
    SET total = total + @montantVirement
    WHERE id = @id
  `,

  // Soustrait un montant du total
  MiunsFromTotal: `
    UPDATE [DAF_Order_virements]
    SET total = total - @montantVirement
    WHERE id = @id
  `,

  // Récupère les en-têtes pour l'impression
  getHeaderPrint: `
    SELECT ov.*, FORMAT(ov.total, '0.00') AS totalformater,
           ra.nom, ra.rib
    FROM [dbo].[DAF_Order_virements] ov
    JOIN [dbo].[DAF_RIB_ATNER] ra ON ov.ribAtner = ra.id
    WHERE ov.id = @ovId
  `,

  // Récupère la somme des virements pour l'impression
  getSumVirmentPrint: `
    SELECT FORMAT(SUM(montantvirement), '0.00') AS SumVirement
    FROM DAF_VIREMENTS
    WHERE orderVirementId = @ovId AND Etat <> 'Annuler'
  `,

  // Récupère les corps pour l'impression
  getBodyPrint: `
    SELECT DISTINCT v.[id], [orderVirementId], f.nom, rf.rib,
           FORMAT(montantVirement, '0.00') AS montantVirementModifier,
           v.Etat
    FROM [dbo].[DAF_VIREMENTS] v
    JOIN [dbo].[DAF_RIB_Fournisseurs] rf ON v.ribFournisseurId = rf.id
    JOIN [dbo].[DAF_FOURNISSEURS] f ON v.fournisseurId = f.id
    WHERE v.Etat = 'En cours' AND [orderVirementId] = @ovId
  `,

  // Met à jour un virement à l'état "Réglé"
  updateVirements: `
    UPDATE [dbo].[DAF_Order_virements]
    SET Etat = 'Reglee'
    WHERE id = @id
  `,

  // Met à jour l'état des factures
  updateLogFacture: `
    UPDATE [dbo].[DAF_LOG_FACTURE]
    SET Etat = 'Reglee'
    WHERE ModePaiementID = @id AND Etat <> 'Annuler'
  `,

  // Met à jour la date d'exécution
  updateDateExecution: `
    UPDATE [dbo].[DAF_Order_virements]
    SET dateExecution = @dateExecution
    WHERE id = @id
  `,

  // Met à jour l'état des virements à "Réglé"
  updatvirementRegler: `
    UPDATE [dbo].[DAF_VIREMENTS]
    SET Etat = 'Reglee'
    WHERE orderVirementId = @id AND etat <> 'Annuler'
  `,

  // Met à jour l'état des virements à "Annulé"
  updateVirementsAnnuler: `
    UPDATE [dbo].[DAF_VIREMENTS]
    SET Etat = 'Annuler'
    WHERE orderVirementId = @id
  `,

  // Met à jour l'état des factures à "Annulé"
  updateLogFactureAnnuler: `
    UPDATE [dbo].[DAF_LOG_FACTURE]
    SET Etat = 'Annuler'
    WHERE ModePaiementID = @id
  `,

  // Met à jour l'état des RAS à "Annulé"
  updateRasAnnuler: `
    UPDATE [dbo].[DAF_RAS_Tva]
    SET Etat = 'Annuler'
    WHERE modePaiement = @id
  `,

  // Met à jour un virement à l'état "Annulé"
  updateordervirementAnnuler: `
    UPDATE [dbo].[DAF_Order_virements]
    SET Etat = 'Annule',
        total = 0 
    WHERE id = @id
  `,
  updateRestitWhenAnnuleV: `update DAF_RestitAvance
  set Etat='AnnulerPaiement'
   where  modePaiement =@orderVirementId  
 `,
};
