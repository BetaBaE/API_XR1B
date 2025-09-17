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
with FnFa as (
select fr.nom,fn.idfacturenavette as id,fn.ficheNavette as FN,fs.codechantier, fs.numeroFacture as NumeroDoc, fs.DateFacture as DateDoc,fs.HT HT,fs.MontantTVA TVA ,fs.ttc TTC,
fs.Etat,
'Facture' as CatDoc
from DAF_factureNavette fn left join DAF_FOURNISSEURS fr on fn.idfournisseur=fr.id
inner join DAF_FactureSaisie fs on fs.id =fn.idFacture
where  fs.Etat = 'Saisie'

),
FnAv as (
select fr.nom,fn.idfacturenavette,fn.ficheNavette as FN,fs.CodeAffaire, fs.BonCommande as NumeroDoc, fs.DateCreation as DateDoc,fs.MontantAvanceHT HT,fs.MontantAvanceTVA TVA ,
fs.MontantAvanceTTC TTC,
fs.Etat,
'Avance' as CatDoc
from DAF_factureNavette fn left join DAF_FOURNISSEURS fr on fn.idfournisseur=fr.id
inner join DAF_Avance fs on fs.id =fn.idfacturenavette
where  fs.Etat = 'Saisie'
)


select * from (
select
* from FnFa
union
select
* from FnAv) t
where 1=1


              /* 
              --code yousef changment apres error (-)
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
*/
    `,

  // Compte le nombre de fiches navettes valides
  getCount: `
    with FnFa as (
    select fr.nom,fn.idfacturenavette as id,fn.ficheNavette as FN,fs.codechantier, fs.numeroFacture as NumeroDoc, fs.DateFacture as DateDoc,fs.HT HT,fs.MontantTVA TVA ,fs.ttc TTC,
    fs.Etat,
    'Facture' as CatDoc
    from DAF_factureNavette fn left join DAF_FOURNISSEURS fr on fn.idfournisseur=fr.id
    inner join DAF_FactureSaisie fs on fs.id =fn.idFacture
    where  fs.Etat = 'Saisie'

    ),
    FnAv as (
    select fr.nom,fn.idfacturenavette,fn.ficheNavette as FN,fs.CodeAffaire, fs.BonCommande as NumeroDoc, fs.DateCreation as DateDoc,fs.MontantAvanceHT HT,fs.MontantAvanceTVA TVA ,
    fs.MontantAvanceTTC TTC,
    fs.Etat,
    'Avance' as CatDoc
    from DAF_factureNavette fn left join DAF_FOURNISSEURS fr on fn.idfournisseur=fr.id
    inner join DAF_Avance fs on fs.id =fn.idfacturenavette
    where  fs.Etat = 'Saisie'
    )


    select count(*) as count from (
    select
    * from FnFa
    union
    select
    * from FnAv) t
    where 1=1

  /*
      SELECT COUNT(*) AS count
      FROM [dbo].[DAF_ficheNavette]
      WHERE ficheNavette <> 'Annuler'
      AND ficheNavette NOT LIKE '-%'

      */
    `,

  // Met à jour une fiche navette existante
  update: `
      UPDATE [dbo].[DAF_factureNavette] 
      SET ficheNavette = @ficheNavette,  
      CatFn = @CatFn
      WHERE idfacturenavette = @id 
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
