exports.factureSaisie = {
  // Récupère le TTC d'une facture par son ID
  getTTc: `SELECT TTC FROM DAF_FactureSaisie WHERE id = @idFacture`,

  // Récupère les informations détaillées sur les factures saisies
  getfactureSaisie: `
  SELECT 
    f.id,
		f.fullName,
		f.numeroFacture,
		f.BonCommande,
		f.TTC AS TTC,
		f.createdDate,
		f.DateFacture,
		f.HT,
		f.MontantTVA,
		d.designation as designation,
		fou.nom as nom,
		fou.CodeFournisseur,
		f.verifiyMidelt,
		f.updatedBy,
		ch.LIBELLE as LIBELLE,
		f.dateecheance,
		f.CatFn,
		f.AcompteReg,
		f.AcompteVal
  FROM [APP_COMPTA].[dbo].[DAF_FactureSaisie] f
    INNER JOIN [dbo].[FactureDesignation] d on d.id=f.iddesignation
    INNER JOIN [dbo].[DAF_FOURNISSEURS] fou on fou.id=f.idfournisseur
    LEFT JOIN [dbo].[chantier] ch on ch.id=f.codechantier
  where NOT Exists (
		select 1 
		from DAF_LOG_FACTURE lf 
		where lf.idDocPaye = concat('fr',f.id) 
			and lf.etat <> 'Annuler'
	  )
  and deletedAt is null
  and (f.etat in('Saisie' ) OR f.etat is null)
  `,

  // Compte le nombre de factures saisies non supprimées
  getfactureSaisiecount: `
  SELECT COUNT(*) as count
  FROM [dbo].[DAF_FactureSaisie] f
    INNER JOIN [dbo].[FactureDesignation] d on d.id=f.iddesignation
    INNER JOIN [dbo].[DAF_FOURNISSEURS] fou on fou.id=f.idfournisseur
    LEFT JOIN [dbo].[chantier] ch on ch.id=f.codechantier
  where NOT Exists (
		select 1 
		from DAF_LOG_FACTURE lf 
		where lf.idDocPaye = concat('fr',f.id) 
			and lf.etat <> 'Annuler'
	  )
  and deletedAt is null
  and (f.etat in('Saisie' ) OR f.etat is null)`,

  // Crée une nouvelle facture saisie
  createfacture: `INSERT INTO [dbo].[DAF_FactureSaisie](
    [numeroFacture],
    [BonCommande],
    [TTC],
    [idfournisseur],
    [DateFacture],
    [iddesignation],
    [fullName],
    [codechantier],
    [dateecheance],
    [CatFn],
    [EtatIR]
  )
  VALUES (
    @numeroFacture,
    @BonCommande,
    @TTC,
    @idfournisseur,
    @DateFacture,
    @iddesignation,
    @fullName,
    @codechantier,
    @dateEcheance,
    @CatFn,
    @EtatIR
  )`,

  // Récupère une facture saisie par son ID
  getOne: `
    SELECT f.id,
		f.fullName,
		f.numeroFacture,
		f.BonCommande,
		f.TTC AS TTC,
		f.createdDate,
		f.DateFacture,
		f.HT,
		f.MontantTVA,
		f.iddesignation as designation,
		fou.nom as nom,
		fou.CodeFournisseur,
		f.verifiyMidelt,
		f.updatedBy,
		f.codeChantier,
		f.dateecheance,
		f.CatFn,
		f.AcompteReg,
		f.AcompteVal,
    f.etat,
    f.EtatIR
  FROM [APP_COMPTA].[dbo].[DAF_FactureSaisie] f
  INNER JOIN [dbo].[DAF_FOURNISSEURS] fou on fou.id=f.idfournisseur
  where NOT Exists (
		select 1 
		from DAF_LOG_FACTURE lf 
		where lf.idDocPaye = concat('fr',f.id) 
			and lf.etat <> 'Annuler'
	)
  and deletedAt is null
  and (etat in('Saisie' ) OR etat is null)
  --and AcompteReg =0 and AcompteVal= 0
  and f.id=@id
  `,

  // Vérifie si une facture existe déjà par numéro de facture et bon de commande
  alreadyexist:
    "SELECT COUNT(*) FROM [dbo].[DAF_FactureSaisie] WHERE numeroFacture = @numeroFacture AND BonCommande = @BonCommande",

  // Marque une facture comme supprimée
  delete: `
  UPDATE [dbo].[DAF_FactureSaisie]
    SET [numeroFacture] = @numeroFacture
        ,[BonCommande] = @BonCommande
        ,[TTC] = @TTC
        ,[DateFacture] = @DateFacture
        ,[MontantTVA] = @MontantTVA
        ,[verifiyMidelt] = @verifiyMidelt
        ,[updatedBy] = @fullNameupdating
        ,[HT] = @HT
        ,[iddesignation] = @iddesignation
        ,[codechantier] = @codechantier
        ,[dateecheance] = @dateecheance
        ,[CatFn] = @CatFn
        ,[etat] = @etat
        ,[EtatIR] = @EtatIR
  WHERE id = @id
    
    `,

  // Met à jour une facture en la marquant comme supprimée
  edit: `UPDATE [dbo].[DAF_FactureSaisie]
    SET deletedAt = GETDATE(),
        numeroFacture = '----' + CAST(id AS VARCHAR(20)) + '----',
        etat = 'Annuler'
    WHERE id = @id`,

  // Récupère les factures d'un fournisseur par nom à modifier
  getfacturebyfournisseurnom: `
  SELECT * FROM [dbo].[DAF_FactureSaisie] 
    WHERE deletedAt IS NULL
	AND ETAT <> 'Annuler'
	AND idfournisseur 
    IN (SELECT id FROM [dbo].[DAF_FOURNISSEURS] WHERE id = @nom)
    AND id NOT IN (SELECT idfacture FROM DAF_factureNavette)
    order by DateFacture 
    `,

  // Récupère l'historique des factures supprimées
  gethistoriquefacture: `SELECT f.id,
    f.numeroFacture,
    f.BonCommande,
    f.TTC,
    f.DateFacture,
    f.HT,
    f.createdDate,
    f.MontantTVA,
    d.designation AS "designation",
    fou.nom AS "nom",
    fou.CodeFournisseur
  FROM [dbo].[DAF_FactureSaisie] f,
       [dbo].[FactureDesignation] d,
       [dbo].[DAF_FOURNISSEURS] fou
  WHERE d.id = f.iddesignation  
    AND fou.id = f.idfournisseur  
    AND deletedAt IS NOT NULL`,

  // Compte le nombre de factures dans l'historique
  gethistoriquefacturecount: `SELECT COUNT(*) AS count
  FROM [dbo].[DAF_FactureSaisie] f,
       [dbo].[FactureDesignation] d,
       [dbo].[DAF_FOURNISSEURS] fou
  WHERE d.id = f.iddesignation  
    AND fou.id = f.idfournisseur  
    AND deletedAt IS NOT NULL`,

  // Récupère les factures d'un fournisseur
  getfacturebyfournisseur: `SELECT f.* FROM [dbo].[DAF_FactureSaisie] f,
       [dbo].[DAF_factureNavette] fn
  WHERE fn.idFacture = f.id
  AND fn.ficheNavette !='-'
    AND f.id NOT IN (SELECT facture FROM DAF_LOG_FACTURE)
    AND idfournisseur IN (SELECT id FROM [dbo].[DAF_FOURNISSEURS] WHERE id = @id)`,

  // Récupère les factures à valider
  getfacturevalider: `SELECT DISTINCT
    ch.LIBELLE,
    f.id,
    f.fullName,
    f.numeroFacture,
    f.BonCommande,
    f.TTC,
    f.DateFacture,
    f.HT,
    f.MontantTVA,
    d.designation AS "designation",
    fou.nom AS "nom",
    fou.CodeFournisseur,
    f.verifiyMidelt,
    f.createdDate
  FROM 
    [dbo].[DAF_FactureSaisie] f
    INNER JOIN [dbo].[FactureDesignation] d ON d.id = f.iddesignation
    INNER JOIN [dbo].[DAF_FOURNISSEURS] fou ON fou.id = f.idfournisseur
    LEFT JOIN [dbo].[chantier] ch ON ch.id = f.codechantier
  WHERE 
    f.deletedAt IS NULL 
    AND (f.verifiyMidelt IS NULL OR f.BonCommande IS NULL OR f.BonCommande = ''
    OR f.CatFn IS NULL OR f.CatFn = '')`,

  // Compte le nombre de factures à valider
  getcountvalider: `SELECT COUNT(*) AS count FROM [dbo].[DAF_FactureSaisie] WHERE deletedAt IS NULL 
    AND (verifiyMidelt IS NULL OR BonCommande IS NULL OR BonCommande = '')`,

  // Valide une facture en mettant à jour son état
  validerfacture: `UPDATE [dbo].[DAF_FactureSaisie]
    SET verifiyMidelt = @verifiyMidelt,
        updatedBy = @updatedBy,
        BonCommande = @BonCommande,
        CatFn = @CatFn
    WHERE id = @id`,

  // Somme des factures d'un fournisseur sans facture navette
  getsumfacturebyfournisseurwithoutfn: `SELECT SUM(fa.ttc) AS sumfacturewithoutfn FROM [dbo].[DAF_FOURNISSEURS] f,
       [dbo].[DAF_Facture_Avance_Fusion_RAS] fa
  WHERE fa.ficheNavette IS NULL  
    AND fa.DateFacture IS NOT NULL  
    AND f.id = @id 
    AND NOT EXISTS (SELECT CODEDOCUTIL, nom
                     FROM [dbo].[DAF_LOG_FACTURE] lf
                     WHERE fa.CODEDOCUTIL = lf.CODEDOCUTIL
                     AND lf.etat <> 'Annuler'
                     AND fa.nom = lf.NOM) 
    AND fa.nom = f.nom`,

  // Somme des factures d'un fournisseur avec facture navette
  getsumfacturebyfournisseurwithfn: `SELECT SUM(fa.ttc) AS sumfactureValuefn 
    FROM [dbo].[DAF_FOURNISSEURS] f
    INNER JOIN [dbo].[DAF_Facture_Avance_Fusion_RAS] fa ON f.nom = fa.nom
    WHERE fa.ficheNavette IS NOT NULL 
      AND fa.DateFacture IS NOT NULL 
      AND f.id = @id 
      AND NOT EXISTS (
          SELECT 1 
          FROM [dbo].[DAF_LOG_FACTURE] lf
          WHERE fa.CODEDOCUTIL = lf.CODEDOCUTIL
          AND lf.etat <> 'Annuler'
          AND fa.nom = lf.NOM
          AND fa.DateFacture = lf.DateDouc
      )`,

  //  LISTER LES FACTURES LES AVANCE NON PAYER
  getAvancesNonPayeesParFournisseurId: `
  SELECT fa.*,
	Case
    when fa.TTC > 5000 and fa.dateExpiration < GETDATE() 
	     AND (fa.CatFn = 'FET' OR (fa.catFournisseur='personne physique' and fa.CatFn='Service') )  
               then '100% RAS demander ARF'
	    else ''
	end as validation
 
    -- Sélectionne toutes les colonnes de la table DAF_CalculRasNetApaye (alias fa)
    FROM [dbo].[DAF_FOURNISSEURS] f
    -- Jointure avec la table DAF_FOURNISSEURS sur le nom
    INNER JOIN [dbo].[DAF_CalculRasNetApaye] fa ON f.nom = fa.nom
    WHERE 
    f.id = @id
    --AND fa.ficheNavette not like '%-%'
    AND fa.ficheNavette != '-'
    -- Filtre pour le fournisseur ayant l'identifiant spécifié
	 AND
     NOT EXISTS (
        -- Vérifie qu'il n'existe pas de factures dans DAF_LOG_FACTURE avec les conditions suivantes
        SELECT 1 
        FROM [dbo].[DAF_LOG_FACTURE] lf
        WHERE fa.id = lf.iddocpaye
        -- La facture doit avoir le même CODEDOCUTIL que dans la table des logs
        AND lf.etat <> 'Annuler'
        -- Le statut de la facture ne doit pas être 'Annuler'
        AND fa.nom = lf.NOM
        -- Le nom du fournisseur doit correspondre

        /*AND (
            (fa.DateFacture IS NULL AND lf.DateDouc IS NULL) OR
            (fa.DateFacture = lf.DateDouc)
        )*/
        -- Vérifie que soit les dates des factures sont toutes deux NULL,
        -- soit les dates correspondent
    )
    
    ORDER BY fa.DateFacture
    -- Trie les résultats par DateFacture

`,

  checkFAcreation: `
    SELECT 
      numeroFacture,
      DateFacture,
      TTC 
    FROM DAF_FactureSaisie 
    WHERE numeroFacture LIKE( 
    REPLACE(
      REPLACE(
        REPLACE( 
          REPLACE(
            REPLACE(@nfa, '_', '%')
          , '-', '%')
        , '/', '%')
      , '\', '%')
    , ' ', '%'))
    and YEAR(DateFacture) = Year(@fdate)
    and idfournisseur = @idf
`,
};
