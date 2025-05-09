exports.FicheNavette = {
  // Crée une nouvelle fiche navette
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
      [TTC],
      [HT],
      [MontantTVA])
      VALUES 
      (@codechantier,
      @montantAvance,
      @idfournisseur,
      @idFacture,
      @modifiedFicheNavette,
      @Bcommande,
      @fullName,
      GETDATE(),
      @TTC,
      @HT,
      @MontantTVA)
    `,

  // Récupère toutes les fiches navettes
  get: `
               SELECT DISTINCT
        fich.id,
        fich.BonCommande AS BonCommande,
        fich.CodeFournisseur AS CodeFournisseur,
        fich.montantAvance,
        fich.nom,
        fich.MontantTVA,
        fich.DateFacture,
        fich.TTC,
        fich.HT,
        fich.designation,
        fich.numeroFacture,
        fich.ficheNavette,
        fich.fullname,
        fich.deletedAt,
        fich.annulation,
        CASE
          WHEN fich.numeroFacture IS NULL THEN 'avance'
          WHEN fich.deletedAt IS NOT NULL THEN 'facture annulée'
          ELSE 'normal'
        END AS etat,
        COALESCE(ch.LIBELLE, fich.LIBELLE) AS libelle,
        fich.CatFn
      FROM [dbo].[DAF_ficheNavette] fich
      LEFT JOIN chantier ch ON fich.LIBELLE = ch.LIBELLE
      WHERE fich.deletedAt IS NULL
        AND fich.ficheNavette <> 'Annuler' 
        AND fich.ficheNavette NOT LIKE '-%'
 --       and fich.numerofacture is not  null

    `,

  // Compte le nombre de fiches navettes valides
  getCount: `
      SELECT COUNT(*) AS count
      FROM [dbo].[DAF_ficheNavette]
      WHERE ficheNavette <> 'Annuler'
      AND ficheNavette NOT LIKE '-%'
    `,

  // Met à jour une fiche navette existante
  update: `
      UPDATE [dbo].[DAF_factureNavette] 
      SET ficheNavette = @ficheNavette,  
      CatFn = @CatFn
      WHERE idfacturenavette = @id 
      and ficheNavette !='-'
    `,

  // Annule une fiche navette
  annulationFn: `
      UPDATE DAF_factureNavette
      SET idfacture = 0, ficheNavette = '-'
      WHERE idfacturenavette = @id
    `,

  // Vérifie si une composition d'avance existe déjà
  existingCompositionAvance: `
      SELECT COUNT(*)
      FROM daf_factureNavette AS dfn1
      WHERE dfn1.ficheNavette = @ficheNavette
        AND dfn1.Bcommande = @Bcommande
        AND dfn1.idfournisseur = @idfournisseur
        AND idfacture = 0
      GROUP BY dfn1.ficheNavette, dfn1.Bcommande
    `,
  getficheNavetebyfournisseur: `SELECT fa.*
  FROM [dbo].[DAF_FOURNISSEURS] f
  INNER JOIN [dbo].[DAF_factureNavette] fa ON f.id = @id
  WHERE fa.idfacturenavette NOT IN (SELECT idAvance FROM [dbo].[DAF_LOG_FACTURE])`,
  getone: ` SELECT DISTINCT
        fich.id,
        fich.BonCommande AS BonCommande,
        fich.CodeFournisseur AS CodeFournisseur,
        fich.montantAvance,
        fich.nom,
        fich.MontantTVA,
        fich.DateFacture,
        fich.TTC,
        fich.HT,
        fich.designation,
        fich.numeroFacture,
        fich.ficheNavette,
        fich.fullname,
        fich.deletedAt,
        fich.annulation,
        CASE
          WHEN fich.numeroFacture IS NULL THEN 'avance'
          WHEN fich.deletedAt IS NOT NULL THEN 'facture annulée'
          ELSE 'normal'
        END AS etat,
        COALESCE(ch.LIBELLE, fich.LIBELLE) AS libelle,
        fich.CatFn
      FROM [dbo].[DAF_ficheNavette] fich
      LEFT JOIN chantier ch ON fich.LIBELLE = ch.LIBELLE
      WHERE fich.deletedAt IS NULL
        AND fich.ficheNavette <> 'Annuler'
             and  fich.id=@id
     --   AND fich.numeroFacture IS NOT NULL`,

  AnnulationFnAvance: `
  select 1
  /*
        update daf_facturenavette  set
        ficheNavette='Annuler', idfacture=0
        where idfacturenavette=@id ; 
        update daf_avance 
        set etat ='Annuler'
        where id=@id
  */
  `,
};
