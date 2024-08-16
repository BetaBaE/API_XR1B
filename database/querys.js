//***à  voir */
exports.factures = {
  getCount: `SELECT COUNT(*) as count FROM [dbo].[DAF_FA_VC]`,
  getAll: `SELECT * FROM [dbo].[DAF_FA_VC] where 1=1 `,
  getOne: `SELECT * FROM [dbo].[DAF_FA_VC] where id=@id`,
  getAllFactures: `SELECT * FROM [dbo].[DAF_FA_VC]
  order by nom , datedouc `,
};

exports.factureFicheNavette = {
  updateQuery: `
        UPDATE DAF_FactureSaisie
        SET NetAPayer = @netAPayer
        WHERE id = @idFacture
      `,
  getTtcQuery: `
        SELECT TTC
        FROM DAF_FactureSaisie
        WHERE id = @idFacture
      `,

  updateFactureQuery: `
  UPDATE DAF_factureNavette
  SET ficheNavette = @ficheNavette,
      idFacture = @idFacture,
      codechantier = @codechantier,
      idfournisseur = @idfournisseur,
      montantAvance = @montantAvance,
      dateSaisie=getdate(),
      Validateur=@Validateur
  WHERE idfacturenavette = @id
`,
  getMontantAvanceQuery: `
        SELECT montantAvance
        FROM DAF_factureNavette
        WHERE idFacture = @idFacture
      `,
  createBonlivraison: `INSERT INTO [dbo].[BonlivraisonTable]
  ([Bonlivraison])
VALUES
  (@BonLivraison)`,
  create: `INSERT INTO [dbo].[DAF_factureNavette]
  ([codechantier],[montantAvance],[idfournisseur],[idFacture],[ficheNavette],[Bcommande]
    ,[fullname]
    ,[dateSaisie]
    ,[CatFn] 
    ,[TTC]
    ,[HT]
    ,[MontantTVA])
    VALUES 
    (@codechantier,
    @montantAvance,
    @idfournisseur,
    @idFacture,
    @modifiedFicheNavette,
    @Bcommande,
    @fullName,
    getdate(),
    @CatFn,
    @TTC,
    @HT,
    @MontantTVA)
  `,

  get: `
  SELECT DISTINCT
  fich.id,
  fich.BonCommande,
  fich.CodeFournisseur,
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
  CASE
      WHEN ch.LIBELLE IS NULL THEN fich.LIBELLE
      ELSE ch.LIBELLE
  END AS libelle,
  fich.CatFn
FROM [dbo].[DAF_ficheNavette] fich
LEFT JOIN (SELECT * FROM chantier) ch ON fich.LIBELLE = ch.LIBELLE
WHERE fich.deletedAt IS NULL
AND fich.ficheNavette <> 'Annuler'
`,
  getCount: `SELECT COUNT(*) as count
    FROM  [dbo].[DAF_ficheNavette]
    WHERE  ficheNavette<>'Annuler' `,
  getOne: `select * from DAF_ficheNavette where id=@id`,
  update: `update [dbo].[DAF_factureNavette] 
        set   ficheNavette=@ficheNavette,
              idfacture=@idFacture,
              codechantier=@codechantier,
              montantAvance=@montantAvance,
              Bcommande=@BonCommande,
              Validateur=@Validateur,
              CatFn=@CatFn
        where idfacturenavette=@id `,
  getavancebyfournisseur: `select * from DAF_factureNavette
where Bcommande is not null
and idFacture=0 and idfournisseur=@idfournisseur`,

  getsumavancebyforurnisseur: `Select SUM(fa.ttc) as sum from [dbo].[DAF_FOURNISSEURS] f,[dbo].[DAF_Facture_Avance_Fusion] fa
where fa.ficheNavette is not null and fa.DateFacture is  null and 
f.id=@id and not
EXISTS (SELECT  CODEDOCUTIL,nom
FROM [dbo].[DAF_LOG_FACTURE] lf
where fa.CODEDOCUTIL=lf.CODEDOCUTIL
and lf.etat <>'Annuler'
and fa.nom=lf.NOM
)
 and  fa.nom=f.nom

`,
  annulationFn: `update DAF_factureNavette  set  idfacture=0 ,  ficheNavette='Annuler' where idfacturenavette=@id`,
  updateficheNavette: `  UPDATE DAF_factureNavette
  SET ficheNavette = @ficheNavette,
      idFacture = @idFacture,
      codechantier = @codechantier,
      idfournisseur = @idfournisseur,
      montantAvance = @montantAvance
  WHERE idfacturenavette = @id`,
  getMontantAvance: `SELECT montantAvance FROM DAF_factureNavette WHERE idFacture = @idFacture`,
  updateNetApayer: ` UPDATE DAF_FactureSaisie
SET NetAPayer = @netAPayer
WHERE id = @idFacture`,
  existingCompositionAvance: ` SELECT COUNT(*)
FROM daf_factureNavette AS dfn1
WHERE 
   dfn1.ficheNavette = @ficheNavette
  AND dfn1.Bcommande = @Bcommande
  AND dfn1.idfournisseur = @idfournisseur
  And idfacture=0
group by  dfn1.ficheNavette,
     dfn1.ficheNavette,
     dfn1.Bcommande
     `,
};

//where id>30

// exports.BonLivraison = {
//   getAllBl: `
//   SELECT *
//   FROM BonlivraisonTable
// where 1=1

//   `,
//   getAllBlCount: `
//   SELECT   count(*)
//   FROM BonlivraisonTable
//   where 1=1

//     `,
// };

/////////////////////
