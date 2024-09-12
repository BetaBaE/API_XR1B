exports.virements = {
  // Cette requête insère un nouveau virement dans la table DAF_VIREMENTS.
  create: `
    INSERT INTO [dbo].[DAF_VIREMENTS]
        (
         [fournisseurId]       -- ID du fournisseur
        ,[ribFournisseurId]    -- ID du RIB du fournisseur
        ,[orderVirementId]     -- ID de l'ordre de virement
        ,[montantVirement]     -- Montant du virement
        ,[Redacteur]           -- Rédacteur du virement
        ,[dateCreation]        -- Date de création du virement
        )
    VALUES
        (
         @fournisseurId
        ,@ribFournisseurId
        ,@orderVirementId
        ,@montantVirement
        ,@Redacteur
        ,getdate()             -- Utilise la date et l'heure actuelles
        )
  `,

  // Cette requête vérifie si un fournisseur a déjà été utilisé pour un virement avec le même RIB.
  CheckedFournisseurDejaExiste: `  
    select count(*) 
    from DAF_VIREMENTS
    where ribFournisseurId=@ribFournisseurId
  `,

  // Cette requête compte le nombre total de virements dans la table DAF_VIREMENTS.
  getCount: "SELECT COUNT(*) as count FROM [dbo].[DAF_VIREMENTS]",

  // Cette requête récupère tous les virements avec les informations du fournisseur et du RIB.
  getAll: `
    SELECT v.[id]
        ,[orderVirementId]     -- ID de l'ordre de virement
        ,f.nom                 -- Nom du fournisseur
        ,rf.rib               -- RIB du fournisseur
        ,[montantVirement],   -- Montant du virement
        v.Etat,               -- État du virement
        v.dateoperation        -- Date de l'opération
    FROM  [dbo].[DAF_VIREMENTS] v
        ,[dbo].[DAF_RIB_Fournisseurs] rf
        ,[dbo].[DAF_FOURNISSEURS] f
    where v.fournisseurId = f.id
      and v.ribFournisseurId = rf.id
      and 1=1                   -- Condition toujours vraie pour récupérer tous les enregistrements
  `,

  // Cette requête récupère les données du journal de factures à partir de la table DAF_CalculRasNetApaye.
  getDataFromLogFacture: `SELECT * FROM [dbo].[DAF_CalculRasNetApaye] where 1=1 `,

  // Cette requête insère une nouvelle entrée dans le journal de factures DAF_LOG_FACTURE.
  createLogFacture: `
   INSERT INTO [dbo].[DAF_LOG_FACTURE]
             ([CODEDOCUTIL]      --  Code document utilisateur
             ,[CODECHT]           -- Code chantier
             ,[NOM]               -- Nom
             ,[LIBREGLEMENT]      -- Libellé du règlement
             ,[datedouc]          -- Date du document
             ,[TOTALTTC]          --Total TTC
             ,[TOTHTNET]         -- Total HT net
             ,[TOTTVANET]        -- Total TVA net
             ,[NETAPAYER]         -- Net à payer
             ,[ModePaiementID]    -- ID du mode de paiement
             ,[modepaiement]      -- Mode de paiement
             ,[idAvance]          -- ID de l'avance
             ,[Ras]               -- RAS (retenue à la source)
             ,[idDocPaye]         -- Ref doc a paye
             )             
       VALUES
  `,

  // Cette requête insère une nouvelle entrée dans la table DAF_RAS_Tva pour une facture.
  CreateRasFactue: `
    INSERT INTO [dbo].[DAF_RAS_Tva]
       ([idFournisseur]        -- ID du fournisseur
       ,[RefernceDOC]         -- Référence du document
       ,[CategorieFn]         -- Catégorie de la fonction
       ,[dateFactue]         -- Date de la facture
       ,[HT]                   -- Montant HT
       ,[TauxTva]             -- Taux de TVA
       ,[Pourcentage_TVA]      -- Pourcentage de TVA
       ,[RaS]                  -- RAS (retenue à la source)
       ,[PourcentageRas]       -- Pourcentage de RAS
       ,[modePaiement]         -- Mode de paiement
       ,[Nom]                  -- Nom
       ,[idDocPaye]            -- Ref doc a paye
       )
  VALUES
  `,

  // Cette requête met à jour l'état et la date d'opération d'un virement existant dans la table DAF_VIREMENTS.
  update: `Update [dbo].[DAF_VIREMENTS]
              set Etat=@Etat,             -- Mise à jour de l'état
              DateOperation=@DateOperation --  Mise à jour de la date d'opération
              where id=@id                 -- Condition de mise à jour : ID du virement
  `,

  // Cette requête récupère un virement spécifique par son ID avec les informations du fournisseur et du RIB.
  getOne: `
    SELECT v.[id]
        ,[orderVirementId]     -- ID de l'ordre de virement
        ,f.nom                 -- Nom du fournisseur
        ,rf.rib                -- RIB du fournisseur
        ,[montantVirement],    -- Montant du virement
        v.Etat,                -- État du virement
        v.DateOperation
    FROM  [dbo].[DAF_VIREMENTS] v
        ,[dbo].[DAF_RIB_Fournisseurs] rf
        ,[dbo].[DAF_FOURNISSEURS] f
    where v.fournisseurId = f.id
      and v.ribFournisseurId = rf.id
      and v.[id] = @id           -- Condition de recherche : ID du virement
  `,

  // Cette requête met à jour l'état d'une entrée dans le journal de factures DAF_LOG_FACTURE lorsqu'un virement est annulé.
  updateLogFactureWhenAnnuleV: `
    update [dbo].[DAF_LOG_FACTURE] 
    set Etat = 'Annuler'           -- Mise à jour de l'état à 'Annuler'
    where [ModePaiementID] =@orderVirementId -- Condition de mise à jour : ID de l'ordre de virement
    and nom=@nom                 -- Condition de mise à jour : nom
  `,
  updateRestitWhenAnnuleV: `update DAF_RestitAvance
   set Etat='Annuler'
    where  modePaiement =@orderVirementId  and nom =@nom  
  `,
  updateRasWhenAnnuleV: `update DAF_RAS_Tva
 set etat='Annuler'
   where  modePaiement =@orderVirementId  and nom =@nom
  `,

  createRestit: `
  INSERT INTO [dbo].[DAF_RestitAvance]
            ([idAvance],
             [Montant],
             [Redacteur],
             [etat],
             [nom],
             [ModePaiement])
      VALUES`,
  updateOrderVirementwhenVRegler: ` update DAF_Order_virements 
         set etat='Reglee'
         where id =@orderVirementId
      `,

  updateRestitwhenVRegler: ` update DAF_RestitAvance 
      set Etat='Reglee'
      where  modePaiement =@orderVirementId  and nom =@nom
   `,
  updateAvanceWhenVRegler: `update DAF_Avance 
         where  etat= 'Reglee'
         where id in()
   `,
  updateRasWhenReglerV: ` update  DAF_RAS_Tva
   set etat='Reglee', dateOperation=@dateOperation
   where  modePaiement =@orderVirementId  and nom =@nom
   
   
   `,
  updateLogFactureWhenRegleeV: `update DAF_LOG_FACTURE
            set etat='Reglee' , dateOperation=@dateOperation
       where  modePaiementId =@orderVirementId  and nom =@nom
   

   `,
};
