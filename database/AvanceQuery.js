// Exportations pour Avance
exports.avance = {
  // Vérifie si une composition d'avance existe déjà pour une fiche navette, une commande et un fournisseur spécifiques
  getCount: ` SELECT COUNT(*) as count from daf_avance where etat IN ('En Cours', 'Reglee') `,
  existingCompositionAvance: `
    SELECT COUNT(*)
    FROM daf_factureNavette AS dfn1
    WHERE 
      dfn1.ficheNavette = @ficheNavette
      AND dfn1.Bcommande = @Bcommande
      AND dfn1.idfournisseur = @idfournisseur
      AND idfacture = 0  // Vérifie que l'avance n'est pas encore liée à une facture
    GROUP BY dfn1.ficheNavette, dfn1.Bcommande
  `,

  // Récupère les détails des avances qui ne sont pas encore restituées
  /**
 *    SELECT av.*, ch.LIBELLE AS chantier, fou.nom, fou.CodeFournisseur, fou.catFournisseur,
   fn.ficheNavette, fn.CatFn as categorieDoc
    FROM DAF_Avance av
    INNER JOIN chantier ch ON ch.CODEAFFAIRE = av.CodeAffaire  --Join ture pour obtenir le nom du chantier
    INNER JOIN DAF_FOURNISSEURS fou ON fou.id = av.idFournisseur  --Jointure pour obtenir les détails du fournisseur
    inner join DAF_factureNavette fn on fn.idfacturenavette=av.id
    WHERE av.EtatRestit = 'Non'  -- Filtre pour les avances qui ne sont pas restituées
    AND av.etat IN ('En Cours', 'Reglee')   -- Filtre potentiel pour les états des avances
   */
  getAvance: `
        select 
          ra.[idAvance] as id
          ,ra.[idFacture]
          ,ra.[Montant]
          ,ra.[Etat]
          ,ra.[DateCreation]
          ,ra.[Redacteur]
          ,ra.[Attributeur]
          ,ra.[nom]
          ,ra.[ModePaiement],
          a.MontantAvanceTTC,
          a.MontantAvanceHT,
          a.MontantAvanceTVA,
          f.CodeFournisseur,
          f.catFournisseur,
          fn.ficheNavette,
          a.CatFn as categorieDoc,
          a.BonCommande
          from DAF_RestitAvance ra inner join DAF_Avance a on ra.idAvance = a.id
                        inner join DAF_factureNavette fn on fn.idfacturenavette = ra.idAvance
                        inner join DAF_FOURNISSEURS f on f.nom = ra.nom
          where  
          ra.idFacture is null
          and ra.etat <> 'Annuler' 
    `,

  // Récupère les avances par fournisseur, filtrées par ceux qui ont une commande et dont les avances ne sont pas encore facturées
  getavancebyfournisseurNonRestituer: `
          select * from DAF_Avance
      where id  in(select idavance from DAF_RestitAvance where idfacture is null  
       and  Etat  not In('Annuler') )
      and idFournisseur=@idfournisseur

  `,

  // Calcule la somme des avances par fournisseur qui n'ont pas encore été facturées
  getsumavancebyforurnisseur: `
    SELECT SUM(fa.ttc) AS sum
    FROM [dbo].[DAF_FOURNISSEURS] f, [dbo].[DAF_Facture_Avance_Fusion_RAS] fa
    WHERE fa.ficheNavette IS NOT NULL  --  Filtre pour les fiches navettes non nulles
      AND fa.DateFacture IS NULL  -- Filtre pour les avances non encore facturées
      AND f.id = @id  --  Filtre par identifiant du fournisseur
      AND NOT EXISTS (
        SELECT CODEDOCUTIL, nom
        FROM [dbo].[DAF_LOG_FACTURE] lf
        WHERE fa.CODEDOCUTIL = lf.CODEDOCUTIL
          AND lf.etat <> 'Annuler'  --// Exclut les avances qui ne sont pas Annuler
          AND fa.nom = lf.NOM
      )
      AND fa.nom = f.nom
  `,

  // Crée une nouvelle avance dans la table DAF_factureNavette
  create: `
    INSERT INTO [dbo].[DAF_factureNavette]
      ([codechantier],
      [montantAvance],
      [idfournisseur],
      [idFacture],
      [ficheNavette],
      [Bcommande],
      [fullname],
      [dateSaisie],
      [CatFn],
      [TTC],
      [HT],
      [MontantTVA])
    VALUES 
      (@codechantier,
      @montantAvance,
      @idfournisseur,
      0,  --  Défini à 0 car l'avance n'est pas encore liée à une facture
      @modifiedFicheNavette,
      @Bcommande,
      @fullName,
      GETDATE(), --  Date actuelle
      @CatFn,
      @TTC,
      @HT,
      @MontantTVA)
  `,

  // Insère une ligne de restitution d'avance dans la table DAF_RestitAvance
  insertlineRestitAvance: `
    INSERT INTO [dbo].[DAF_RestitAvance]
      ([idAvance],
      [Montant],
      [Etat],
      [DateCreation],
      [Redacteur],
      [nom],
      [ModePaiement],
      [LogDateCreation]
      )
    VALUES
      (@id,
      @Deference,
      @etat,
      GETDATE(), -- Date actuelle
      @Redacteur,
      @nom,
      @modePaiement,
      @LogDateCreation)
  `,

  // Met à jour les informations de restitution dans la table DAF_RestitAvance
  updateRestitution: `

    UPDATE DAF_RestitAvance
    SET idFacture = @idfacture,
        --  Met à jour l'identifiant de la facture
      montant = @MontantRestantARestituer --  Met à jour le montant restant à restituer
    WHERE idavance = @id AND idFacture IS NULL   --  Filtre par identifiant de l'avance et vérifie que l'avance n'est pas encore facturée
    and etat not in ('Annuler')
    `,

  // Met à jour les informations de restitution de facture dans la table Daf_factureSaisie
  updateFactureRestituition: `
  select 1 /*
   UPDATE Daf_factureSaisie
    SET AcompteReg = CASE 
                      WHEN @etat = 'Reglee' THEN AcompteReg
                      WHEN @etat = 'En cours' THEN AcompteReg + @MontantRestantARestituer
                      END,
      AcompteVal = CASE 
                    WHEN @etat = 'En cours' THEN AcompteVal
                    WHEN @etat = 'Reglee' THEN AcompteVal + @MontantRestantARestituer
                    END,
      idAvance = @idAvance 
    WHERE id = @idfacture  -- Filtre par identifiant de la facture
    */
  `,

  // Récupère les factures par fournisseur pour la restitution
  getfacturebyfournisseurRestit: `
    SELECT fs.id AS idfacture, 
       fs.numeroFacture, 
       fs.DateFacture, 
       fs.TTC - ISNULL(
            (SELECT SUM(Montant) 
             FROM DAF_RestitAvance 
             WHERE idFacture = fs.id 
               AND etat <> 'Annuler'), 
            0) AS TTC
FROM [dbo].[DAF_FactureSaisie] fs
INNER JOIN DAF_FOURNISSEURS four ON four.id = fs.idfournisseur
WHERE deletedAt IS NULL -- Filtre pour les factures non supprimées
  AND fs.etat != 'Saisie'
  AND four.id = @idfournisseur
  AND fs.TTC - ISNULL(
            (SELECT SUM(Montant) 
             FROM DAF_RestitAvance 
             WHERE idFacture = fs.id 
               AND etat <> 'Annuler'), 
            0) > 5
  AND NOT EXISTS (
    SELECT 1
    FROM DAF_LOG_FACTURE
    WHERE fs.numeroFacture = CODEDOCUTIL
      AND fs.DateFacture = DateDouc
      AND four.nom = nom
      AND etat IN ('en cours', 'Reglee')  -- Exclut les factures en cours ou réglées
  );
  `,

  // Récupère les restitutions d'avance par ID qui ne sont pas encore facturées
  getAvanceRestit: `
    SELECT rs.*, av.idFournisseur , av.CodeAffaire
    FROM DAF_RestitAvance rs
    INNER JOIN daf_avance av ON av.id = rs.idavance
    WHERE idAvance = @id AND idfacture IS NULL  --  Filtre par identifiant de l'avance et vérifie que l'avance n'est pas encore facturée

    `,

  // Crée une nouvelle avance dans la table DAF_Avance
  CreateAvance: `
    INSERT INTO [dbo].[DAF_Avance]
      ([id],
      [NdocAchat],
      [DateDocAchat],
      [idDesignation],
      [BonCommande],
      [MontantAvanceTTC],
      [MontantAvanceHT],
      [MontantAvanceTVA],
      [CodeAffaire],
      [idFournisseur],
      [DateCreation],
      [Redacteur],
      [CatFn],
      [EtatIR]
      )
    VALUES
      ((SELECT MAX(idfacturenavette)+1 FROM daf_facturenavette  ),
      @NdocAchat,
      @DateDocAchat,
      @idDesignation,
      @Bcommande,
      @TTC,
      @HT,
      @MontantTVA,
      @codechantier,
      @idfournisseur,
      GETDATE(),  -- Date actuelle
      @fullName,
      @CatFn,
      @EtatIR
      )
  `,

  // Récupère les détails de restitution d'avance par ID qui ne sont pas encore facturées
  getAvanceRestitById: `
 	  SELECT  restit.etat  ,av.id,  av.Etat as etatAvance,
           restit.Montant, four.nom AS nom, 
           four.CodeFournisseur AS CodeFournisseur, 
           four.id AS idfournisseur,
           restit.ModePaiement, 
           av.CodeAffaire,
           restit.LogDateCreation
    FROM DAF_RestitAvance restit 
    INNER JOIN DAF_Avance av ON av.id = restit.idAvance
    INNER JOIN DAF_FOURNISSEURS four ON four.id = av.idFournisseur
    --INNER JOIN chantier ch ON ch.CODEAFFAIRE = av.CodeAffaire

    WHERE idfacture IS NULL --  Filtre par identifiant de l'avance et vérifie que l'avance n'est pas encore facturée
    and restit.etat not in ('Annuler')
    AND av.id = @Id 
  `,
  annulationFn: `update DAF_factureNavette   ficheNavette='Annuler' where idfacturenavette=@id`,

  AnnulerAvance: `Update DAF_avance set etat='Annuler' where id=@id`,

  getOne: `select * from DAF_ficheNavette where id=@id`,

  getAvanceDétailRestit: `WITH UniqueIds AS (
    SELECT DISTINCT Av.id
    FROM DAF_Avance Av
    INNER JOIN DAF_RestitAvance Rav ON Av.id = Rav.idAvance
    LEFT JOIN DAF_FactureSaisie fs ON Rav.idFacture = fs.id
    INNER JOIN DAF_factureNavette fn ON fn.idfacturenavette = Av.id
    INNER JOIN chantier ch ON ch.CODEAFFAIRE = Av.CodeAffaire
)
SELECT 

    Av.id, 
    Av.BonCommande, 
    Av.MontantAvanceTTC, 
    Av.MontantAvanceHT, 
    Av.MontantAvanceTVA, 
    Av.CodeAffaire, 
    Av.CatFn, 
    Rav.nom, 
    Rav.ModePaiement, 
    fs.numeroFacture, 
    fs.DateFacture, 
    fs.TTC, 
    ch.LIBELLE
FROM 
    DAF_Avance Av
INNER JOIN 
    DAF_RestitAvance Rav ON Av.id = Rav.idAvance
LEFT JOIN 
    DAF_FactureSaisie fs ON Rav.idFacture = fs.id
INNER JOIN 
    DAF_factureNavette fn ON fn.idfacturenavette = Av.id
INNER JOIN 
    chantier ch ON ch.CODEAFFAIRE = Av.CodeAffaire
INNER JOIN 
    UniqueIds U ON Av.id = U.id;
`,
  getAvanceDétailRestitCount: `WITH UniqueIds AS (
  SELECT DISTINCT Av.id
  FROM DAF_Avance Av
  INNER JOIN DAF_RestitAvance Rav ON Av.id = Rav.idAvance
  LEFT JOIN DAF_FactureSaisie fs ON Rav.idFacture = fs.id
  INNER JOIN DAF_factureNavette fn ON fn.idfacturenavette = Av.id
  INNER JOIN chantier ch ON ch.CODEAFFAIRE = Av.CodeAffaire
)
SELECT 

   COUNT(*) as count
FROM 
  DAF_Avance Av
INNER JOIN 
  DAF_RestitAvance Rav ON Av.id = Rav.idAvance
LEFT JOIN 
  DAF_FactureSaisie fs ON Rav.idFacture = fs.id
INNER JOIN 
  DAF_factureNavette fn ON fn.idfacturenavette = Av.id
INNER JOIN 
  chantier ch ON ch.CODEAFFAIRE = Av.CodeAffaire
INNER JOIN 
  UniqueIds U ON Av.id = U.id;
`,
  getAvanceForUpdate: `
     SELECT av.*, ch.LIBELLE AS chantier, fou.nom, fou.CodeFournisseur, fou.catFournisseur,
    fn.ficheNavette, fn.CatFn as categorieDoc
     FROM DAF_Avance av
     INNER JOIN chantier ch ON ch.CODEAFFAIRE = av.CodeAffaire  --Jointure pour obtenir le nom du chantier
     INNER JOIN DAF_FOURNISSEURS fou ON fou.id = av.idFournisseur  --Jointure pour obtenir les détails du fournisseur
     inner join DAF_factureNavette fn on fn.idfacturenavette=av.id
   WHERE 
    av.etat ='Saisie'   -- Filtre potentiel pour les états des avances
     `,
  getAvanceForUpdateCount: `
     SELECT     COUNT(*) as count
     FROM DAF_Avance av
     INNER JOIN chantier ch ON ch.CODEAFFAIRE = av.CodeAffaire  --Jointure pour obtenir le nom du chantier
     INNER JOIN DAF_FOURNISSEURS fou ON fou.id = av.idFournisseur  --Jointure pour obtenir les détails du fournisseur
     inner join DAF_factureNavette fn on fn.idfacturenavette=av.id
   WHERE 
    av.etat ='Saisie'   -- Filtre potentiel pour les états des avances
     `,
  getAvanceForUpdateByid: ` select av.* , fn.fichenavette from 
  daf_avance av inner join daf_facturenavette  fn on  fn.idfacturenavette=av.id 
  where av.id=@id`,

  updateAvance: `
  UPDATE [dbo].[DAF_Avance] 
  SET BonCommande = @BonCommande,  
  CatFn = @CatFn,
  MontantAvanceTTC=@MontantAvanceTTC,
  MontantAvanceHT=@MontantAvanceHT,
  MontantAvanceTVA=@MontantAvanceTVA,
  EtatIR=@EtatIR,
  NdocAchat = @NdocAchat,
  DateDocAchat = @DateDocAchat,
  idDesignation = @idDesignation
  WHERE id = @id ;


  update Daf_facturenavette
  set   BCommande = @BonCommande,  
  CatFn = @CatFn,
  TTC=@MontantAvanceTTC,
  HT=@MontantAvanceHT,
  MontantTVA=@MontantAvanceTVA

  where  idfacturenavette = @id ;
`,

  // Annule une fiche navette
  annulationAvance: `
  UPDATE DAF_Avance
  SET etat = 'Annuler'
  WHERE id = @id ;
      UPDATE DAF_factureNavette
      SET   ficheNavette = 'Annuler'
      WHERE idfacturenavette = @id
    `,

  getAvanceNonRestitByFournisseur: `
    select COUNT(*) as number
    from DAF_RestitAvance ra left join DAF_FOURNISSEURS f on (f.nom = ra.nom)
    where f.id = @id
    and idFacture is null
    and ra.etat <> 'Annuler'
    `,
};
