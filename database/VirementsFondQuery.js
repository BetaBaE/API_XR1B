exports.virementsFond = {
  // Cette requête insère un nouveau virement de fonds dans la table DAF_VIREMENTS_Fond.
  create: `
    INSERT INTO [dbo].[DAF_VIREMENTS_Fond]
        (
         [RibAtnerDestId]       -- ID du RIB ATNER de destination
        ,[orderVirementFondId]  -- ID de l'ordre de virement de fonds
        ,[montantVirement]      -- Montant du virement
        ,[Redacteur]            -- Rédacteur du virement
        ,[dateCreation]         -- Date de création du virement
        )
    VALUES
        (
         @RibAtnerDestId
        ,@orderVirementFondId
        ,@montantVirement
        ,@Redacteur
        ,getdate()              -- Utilise la date et l'heure actuelles
        )
  `,

  // Cette requête compte le nombre total de virements de fonds dans la table DAF_VIREMENTS_Fond.
  getCount: "SELECT COUNT(*) as count FROM [dbo].[DAF_VIREMENTS_Fond]",

  // Cette requête récupère tous les virements de fonds avec les informations du RIB ATNER.
  getAll: `
    SELECT v.[id]
    ,v.[orderVirementFondId]  -- ID de l'ordre de virement de fonds
    ,ra.nom                  -- Nom du RIB ATNER
    ,ra.rib                  -- RIB ATNER
    ,[montantVirement],     -- Montant du virement
    v.Etat,                  -- État du virement
    v.dateoperation         --  Date de l'opération
  FROM  [dbo].[DAF_VIREMENTS_Fond] v
    ,[dbo].[DAF_RIB_ATNER] ra
  where v.RibAtnerDestId = ra.id
    and 1=1                  -- Condition toujours vraie pour récupérer tous les enregistrements
  `,

  // Cette requête met à jour l'état et la date d'opération d'un virement de fonds existant dans la table DAF_VIREMENTS_Fond.
  update: `Update [dbo].[DAF_VIREMENTS_Fond]
              set Etat=@Etat,            -- Mise à jour de l'état
              dateOperation=@dateOperation -- Mise à jour de la date d'opération
              where id=@id                 --Condition de mise à jour : ID du virement de fonds
  `,

  // Cette requête récupère un virement de fonds spécifique par son ID avec les informations du RIB ATNER.
  getOne: `
    SELECT v.[id]
    ,v.[orderVirementFondId]  -- ID de l'ordre de virement de fonds
    ,ra.nom                  -- Nom du RIB ATNER
    ,ra.rib                  -- RIB ATNER
    ,[montantVirement],      -- Montant du virement
    v.Etat,                -- État du virement
    v.dateoperation         -- Date de l'opération
  FROM  [dbo].[DAF_VIREMENTS_Fond] v
    ,[dbo].[DAF_RIB_ATNER] ra
  where v.RibAtnerDestId = ra.id
      and v.[id] = @id           -- Condition de recherche : ID du virement de fonds
  `,
};
