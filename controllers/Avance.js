const { avance } = require("../database/AvanceQuery");
const { getConnection, getSql } = require("../database/connection");
const { designations } = require("../database/Designations");

exports.getAvanceCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(avance.getCount);
    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};

exports.getAvance = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["id" , "desc"]';
    let filter = req.query.filter || "{}";

    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);

    let queryFilter = "";

    if (filter.BonCommande) {
      queryFilter += ` and upper(a.BonCommande) like (upper('%${filter.BonCommande}%'))`;
    }
    if (filter.ficheNavette) {
      queryFilter += ` and upper(fn.ficheNavette) like (upper('%${filter.ficheNavette}%'))`;
    }
    if (filter.fournisseur) {
      queryFilter += ` and upper(ra.nom) like (upper('%${filter.fournisseur}%'))`;
    }
    if (filter.Etat) {
      queryFilter += ` and ra.Etat = '${filter.Etat}'`;
    }
    console.log(queryFilter);
    const pool = await getConnection();

    const result = await pool.request().query(
      `${avance.getAvance} ${queryFilter} Order by ${sort[0]} ${sort[1]}
    OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );

    console.log(req.count);
    res.set(
      "Content-Range",
      `Avance ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.CreateAvance = async (req, res) => {
  const {
    codechantier,
    NdocAchat,
    DateDocAchat,
    iddesignation,
    idFacture,
    ficheNavette,
    idfournisseur,
    montantAvance,
    service,
    fullName,
    Bcommande,
    CatFn,
    TTC,
    HT,
    MontantTVA,
    EtatIR,
  } = req.body;
  console.log(req.body);
  let prcTVA = 1;
  try {
    // Vérifier que les paramètres requis ne sont pas undefined
    if (!codechantier || !ficheNavette || !Bcommande || !idfournisseur) {
      return res.status(400).json({ message: "Paramètres requis manquants" });
    }

    try {
      const pool = await getConnection();
      const result = await pool
        .request()
        .input("id", getSql().Int, iddesignation)
        .query(designations.getOneById);
      prcTVA = result.recordset[0].PourcentageTVA;
      console.log("PourcentageTVA", result.recordset[0].PourcentageTVA);
    } catch (error) {
      res.send(error.message);
      res.status(500);
    }

    const pool = await getConnection();
    console.log("Connected to database");

    let modifiedFicheNavette = ficheNavette;
    if (service) {
      modifiedFicheNavette = `admin/${new Date().getFullYear()}/${service}/${ficheNavette}`;
      console.log("Modified ficheNavette with service:", modifiedFicheNavette);
    }

    // Préparer les paramètres pour la création de l'avance
    const createParams = [
      { name: "NdocAchat", type: getSql().VarChar, value: NdocAchat },
      { name: "DateDocAchat", type: getSql().Date, value: DateDocAchat },
      { name: "idDesignation", type: getSql().Int, value: iddesignation },
      { name: "codechantier", type: getSql().VarChar, value: codechantier },
      {
        name: "montantAvance",
        type: getSql().Numeric(10, 2),
        value: TTC,
      },
      { name: "idfournisseur", type: getSql().Int, value: idfournisseur },
      { name: "idFacture", type: getSql().Int, value: idFacture },
      {
        name: "modifiedFicheNavette",
        type: getSql().VarChar,
        value: modifiedFicheNavette,
      },
      { name: "Bcommande", type: getSql().VarChar, value: Bcommande },
      { name: "fullName", type: getSql().VarChar, value: fullName },
      { name: "EtatIR", type: getSql().VarChar, value: EtatIR },
      { name: "CatFn", type: getSql().VarChar, value: CatFn },
      { name: "TTC", type: getSql().Numeric(10, 2), value: TTC },

      { name: "HT", type: getSql().Numeric(10, 2), value: TTC / prcTVA },
      {
        name: "MontantTVA",
        type: getSql().Numeric(10, 2),
        value: TTC - TTC / prcTVA,
      },
    ];

    const request = pool.request();
    createParams.forEach((param) =>
      request.input(param.name, param.type, param.value)
    );

    try {
      // Créer l'avance
      const createAvanceResult = await request.query(avance.CreateAvance);
      console.log("Create avance result:", createAvanceResult);

      if (createAvanceResult.rowsAffected[0] > 0) {
        // Si la création de l'avance réussit, insérer l'avance
        const insertResult = await request.query(avance.create);
        console.log("Insert result:", insertResult);

        if (insertResult.rowsAffected[0] > 0) {
          // Si l'insertion réussit
          res.json({
            id: "", // Remplacez par l'ID réel si nécessaire
            codechantier,
            idFacture,
            ficheNavette: modifiedFicheNavette,
            idfournisseur,
            montantAvance,
            CatFn,
            TTC,
            HT,
            MontantTVA,
          });
          console.log("Response sent successfully");
        } else {
          // Si l'insertion échoue
          res.status(500).json({ message: "L'insertion a échoué." });
          console.error("Insertion failed.");
        }
      } else {
        // Si la création de l'avance échoue
        res.status(500).json({ message: "La création de l'avance a échoué." });
        console.error("Create avance failed.");
      }
    } catch (createError) {
      // Gérer les erreurs lors de la création de l'avance
      res.status(500).json({
        message: "Erreur lors de la création de l'avance.",
        error: createError.message,
      });
      console.error("Create avance error:", createError);
    }
  } catch (error) {
    res.status(500).send(error.message);
    console.error("Error occurred:", error);
  }
};

exports.getfactureresById = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().VarChar, req.params.id)
      .query(avance.getOne);

    res.set("Content-Range", `factures 0-1/1`);

    res.json(result.recordset[0]);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.getficheNavetteByfournisseur = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().VarChar, req.params.id)
      .query(factures.getficheNavetebyfournisseur);

    res.set("Content-Range", `ficheNavette 0-1/1`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.getavancebyfournisseurNonRestituer = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("idfournisseur", getSql().VarChar, req.params.idfournisseur)
      .query(avance.getavancebyfournisseurNonRestituer);

    if (result.recordset) {
      res.set("Content-Range", `ficheNavette 0-1/1`);
      res.json(result.recordset);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
exports.getsumavancebyfournisseurwithfn = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .query(avance.getsumavancebyforurnisseur);

    res.set("Content-Range", `ficheNavette 0-1/1`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.correction = async (req, res) => {
  const {
    ficheNavette,
    idFacture,
    montantAvance,
    idfournisseur,
    codechantier,
    BonCommande,
    annulation,
    Validateur,
    CatFn,
  } = req.body;

  try {
    const pool = await getConnection();
    await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .input("ficheNavette", getSql().VarChar, ficheNavette)
      .input("codechantier", getSql().VarChar, codechantier)
      .input("idFacture", getSql().Int, idFacture)
      .input("idfournisseur", getSql().Int, idfournisseur)
      .input("montantAvance", getSql().Int, montantAvance)
      .input("BonCommande", getSql().VarChar, BonCommande)
      .input("annulation", getSql().VarChar, annulation)
      .input("Validateur", getSql().VarChar, Validateur)
      .input("CatFn", getSql().VarChar, CatFn)
      .input("EtatIR", getSql().VarChar, EtatIR)
      .query(avance.update);
    if (annulation === "Annuler") {
      updateFNWhenAnnuleVirement(req.params.id);
    }

    res.json({
      id: req.params.id,
      ficheNavette,
      idFacture,
      codechantier,
      montantAvance,
      annulation,
      CatFn,
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
    console.log(error.message);
  }
};

exports.annulation = async (req, res) => {
  const { id } = req.body;
  try {
    const pool = await getConnection();
    await pool
      .request()
      .input("id", getSql().Int, id)

      .query(avance.annulationFn);

    res.json({
      message: "Annulation réussie",
    });
  } catch (error) {
    res.status(500).send(error.message);
    console.error(error.message);
  }
};

async function updateFNWhenAnnuleVirement(id) {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().VarChar, id)

      .query(avance.annulationFn);

    console.log(`${avance.annulationFn}` + "ma requete");
    return result.recordset;
  } catch (error) {
    console.error(error.message);
  }
}

exports.getBonLivraisonByFactureId = async (req, res) => {
  const factureId = req.params.id;

  try {
    const bonLivraisons = await BonLivraison.findAll({
      where: { idFacture: factureId },
    });

    res.json(bonLivraisons);
    console.log("gh", bonLivraisons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
exports.getAvanceRestitById = async (req, res) => {
  try {
    const pool = await getConnection();

    console.log("ID de la requête :", req.params.id);

    // Récupérer l'avance de restitution par ID
    const result = await pool
      .request()
      .input("Id", getSql().Int, req.params.id)
      .query(avance.getAvanceRestitById);
    console.log(req.params.id, "req.params.id");

    console.log("Résultat de la requête getAvanceRestitById :", result);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "Aucune avance de restitution trouvée pour l'ID donné.",
      });
    }

    const avanceRestitution = result.recordset[0];

    console.log("avanceRestitution :", avanceRestitution);
    let idfournisseur = 0;
    idfournisseur = avanceRestitution.idfournisseur;

    // Récupérer la facture par fournisseur
    const factureResult = await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .input("idfournisseur", getSql().Int, idfournisseur)
      .query(avance.getfacturebyfournisseurRestit);

    console.log(
      "Résultat de la requête getfacturebyfournisseurRestit :",
      factureResult
    );

    if (factureResult.recordset.length == 0) {
      return res
        .status(404)
        .json({ message: "Aucune facture trouvée pour le fournisseur donné." });
    }

    const response = {
      id: avanceRestitution.id, // Assurez-vous que cette clé existe et correspond à l'identifiant
      data: {
        avanceRestitution, // Inclure toutes les propriétés de l'avance de restitution
        factures: factureResult.recordset, // Inclure les factures associées
      },
    };
    // Définir l'en-tête Content-Range pour React Admin
    res.set("Content-Range", `avances 0-1/1`); // Adapté selon votre besoin
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.RestitutionAvance = async (req, res) => {
  try {
    const {
      Montant,
      MontantRestantARestituer,
      idfacture,
      etat,
      ModePaiement,
      Redacteur,
      idAvance,
      nom,
    } = req.body;
    const pool = await getConnection();
    const { data } = req.body;
    // console.log("VETCAMMMM", data.avanceRestitution.LogDateCreation);
    if (req.body && Montant !== undefined) {
      console.log("Montant NON RESTITUER:", Montant);
      console.log("Montant Restant ARestituer:", MontantRestantARestituer);
      console.log(Montant == MontantRestantARestituer);

      if (Montant == MontantRestantARestituer) {
        console.log("Montant == MontantRestantARestituer");
        console.log(etat, "Etat");
        await pool
          .request()
          .input("id", getSql().Int, req.params.id)
          .input(
            "MontantRestantARestituer",
            getSql().Numeric(30, 2),
            MontantRestantARestituer
          )
          .input("idfacture", getSql().Int, idfacture)
          .query(avance.updateRestitution);

        await pool
          .request()
          .input("etat", getSql().VarChar, etat)
          .input(
            "MontantRestantARestituer",
            getSql().Numeric(30, 2),
            MontantRestantARestituer
          )
          .input("idfacture", getSql().Int, idfacture)
          .input("idAvance", getSql().Int, req.params.id)
          .query(avance.updateFactureRestituition);
      } else if (Montant > MontantRestantARestituer) {
        console.log("Montant", Montant);
        console.log("MontantRestantARestituer", MontantRestantARestituer);
        console.log("Montant > MontantRestantARestituer");
        console.log("idfacture", idfacture);
        /**
         * Trigger replace restit
         */

        await pool
          .request()
          .input("etat", getSql().VarChar, etat)
          .input(
            "MontantRestantARestituer",
            getSql().Numeric(30, 2),
            MontantRestantARestituer
          )
          .input("idfacture", getSql().Int, idfacture)
          .input("idAvance", getSql().Int, req.params.id)
          .query(avance.updateFactureRestituition);

        console.log(MontantRestantARestituer, "MontantRestantARestituer");
        await pool
          .request()
          .input("id", getSql().Int, req.params.id)
          .input(
            "MontantRestantARestituer",
            getSql().Numeric(30, 2),
            MontantRestantARestituer
          )
          .input("idfacture", getSql().Int, idfacture)
          .query(avance.updateRestitution);
        console.log(req.params.id, " req.params.id");
        console.log(idfacture, "idfacture");

        const Deference = Montant - MontantRestantARestituer;

        console.log("Deference", Deference, typeof Deference);
        await pool
          .request()
          .input("id", getSql().Int, req.params.id)
          .input("Deference", getSql().Numeric(30, 3), Deference)
          .input("ModePaiement", getSql().VarChar, ModePaiement)
          .input("etat", getSql().VarChar, etat)
          .input("Redacteur", getSql().VarChar, Redacteur)
          .input("nom", getSql().VarChar, nom)
          .input(
            "LogDateCreation",
            getSql().DateTime,
            data.avanceRestitution.LogDateCreation
          )
          .query(avance.insertlineRestitAvance);
      }

      res.json({ id: req.params.id });
    } else {
      res.status(400).json({ error: "Il existe une erreur" });
    }
  } catch (error) {
    res.status(500).send(error.message);
    console.log(error.message);
  }
};

exports.getAvanceDétailRestitCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT COUNT(*) as count
      FROM (
        SELECT DISTINCT Av.id
        FROM DAF_Avance Av
        INNER JOIN DAF_RestitAvance Rav ON Av.id = Rav.idAvance
        LEFT JOIN DAF_FactureSaisie fs ON Rav.idFacture = fs.id
        INNER JOIN DAF_factureNavette fn ON fn.idfacturenavette = Av.id
        INNER JOIN chantier ch ON ch.CODEAFFAIRE = Av.CodeAffaire
      ) AS UniqueIds
    `);
    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};

exports.getAvanceDétailRestit = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["id", "desc"]';
    let filter = req.query.filter || "{}";

    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);

    let queryFilter = "";

    if (filter.ficheNavette) {
      queryFilter += ` AND upper(fn.ficheNavette) LIKE upper('%${filter.ficheNavette}%')`;
    }
    if (filter.chantier) {
      queryFilter += ` AND upper(ch.LIBELLE) LIKE upper('%${filter.chantier}%')`;
    }
    if (filter.BonCommande) {
      queryFilter += ` AND upper(Av.BonCommande) LIKE upper('%${filter.BonCommande}%')`;
    }
    if (filter.fournisseur) {
      queryFilter += ` AND upper(Rav.nom) LIKE upper('%${filter.fournisseur}%')`;
    }
    if (filter.designation) {
      queryFilter += ` AND upper(designation) LIKE upper('%${filter.designation}%')`;
    }
    if (filter.numeroFacture) {
      queryFilter += ` AND upper(fou.numeroFacture) LIKE upper('%${filter.numeroFacture}%')`;
    }
    if (filter.CodeFournisseur) {
      queryFilter += ` AND upper(CodeFournisseur) LIKE upper('%${filter.CodeFournisseur}%')`;
    }

    const pool = await getConnection();
    const result = await pool.request().query(`
      WITH UniqueIds AS (
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
        fn.CatFn, 
        Rav.nom, 
        Rav.ModePaiement, 
        fs.numeroFacture, 
        fs.DateFacture, 
        fs.TTC, 
        ch.LIBELLE,
        fn.fichenavette
		--Rav.Montant as MontantRestituer
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
        UniqueIds U ON Av.id = U.id
      WHERE  av.Etat not in('Annuler') ${queryFilter}
       and  Rav.Etat  not in('Annuler') 
      ORDER BY ${sort[0]} ${sort[1]}
    `);

    res.set(
      "Content-Range",
      `AvanceResitiué ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.getAvanceForUpdateCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(avance.getAvanceForUpdateCount);
    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};

exports.getAvanceForUpdate = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["id" , "desc"]';
    let filter = req.query.filter || "{}";

    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);

    let queryFilter = "";

    if (filter.ficheNavette) {
      queryFilter += ` and upper(fn.ficheNavette) like (upper('%${filter.ficheNavette}%'))`;
    }
    if (filter.chantier) {
      queryFilter += ` and upper(ch.LIBELLE) like (upper('%${filter.chantier}%'))`;
    }

    if (filter.BonCommande) {
      queryFilter += ` and upper(BonCommande)  like ('%${filter.BonCommande}%')`;
    }
    if (filter.fournisseur) {
      queryFilter += ` and upper(fou.nom) like (upper('%${filter.fournisseur}%'))`;
    }
    if (filter.CodeFournisseur) {
      queryFilter += ` and upper(CodeFournisseur) like (upper('%${filter.CodeFournisseur}%'))`;
    }
    console.log(queryFilter);
    const pool = await getConnection();

    const result = await pool.request().query(
      `${avance.getAvanceForUpdate} ${queryFilter} Order by ${sort[0]} ${
        sort[1]
      }
    OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );

    console.log(req.count);
    res.set(
      "Content-Range",
      `facturesresptionne ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.getAvanceForUpdateByid = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .query(avance.getAvanceForUpdateByid);

    res.set("Content-Range", `Cheque 0-1/1`);

    res.json(result.recordset[0]);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

// exports.UpdateorAnnulerAvance = async (req, res) => {
//   const {
//     MontantAvanceTTC,
//     BonCommande,
//     annulation,
//     CatFn,
//     NdocAchat,
//     DateDocAchat,
//     idDesignation,
//     EtatIR,
//   } = req.body;
//   console.log(req.body);
//   let prcTVA = 1;
//   try {
//     const pool = await getConnection();
//     try {
//       const pool = await getConnection();
//       const result = await pool
//         .request()
//         .input("id", getSql().Int, iddesignation)
//         .query(designations.getOneById);
//       prcTVA = result.recordset[0].PourcentageTVA;
//       console.log("PourcentageTVA", result.recordset[0].PourcentageTVA);
//     } catch (error) {
//       res.send(error.message);
//       res.status(500);
//     }
//     const request = pool
//       .request()
//       .input("id", getSql().Int, req.params.id)

//       .input("MontantAvanceTTC", getSql().Numeric, MontantAvanceTTC)
//       .input("MontantAvanceHT", getSql().Numeric, MontantAvanceTTC / prcTVA)
//       .input(
//         "MontantAvanceTVA",
//         getSql().VarChar,
//         MontantAvanceTTC - MontantAvanceTTC / prcTVA
//       )
//       .input("BonCommande", getSql().VarChar, BonCommande)
//       .input("annulation", getSql().VarChar, annulation)
//       .input("NdocAchat", getSql().VarChar, NdocAchat)
//       .input("DateDocAchat", getSql().Date, DateDocAchat)
//       .input("idDesignation", getSql().VarChar, idDesignation)
//       .input("EtatIR", getSql().VarChar, EtatIR)
//       .input("CatFn", getSql().VarChar, CatFn);

//     if (annulation === "Annuler") {
//       await request.query(avance.AnnulerAvance);
//     } else {
//       await request.query(avance.updateAvance);
//     }

//     res.json({
//       id: req.params.id,
//       MontantAvanceTTC,
//       MontantAvanceHT,
//       MontantAvanceTVA,
//       BonCommande,
//       annulation,
//       CatFn,
//     });
//   } catch (error) {
//     res.status(500).send(error.message);
//     console.log(error.message);
//   }
// };

exports.UpdateorAnnulerAvance = async (req, res) => {
  // Destructure and log the request body
  const {
    MontantAvanceTTC,
    BonCommande,
    annulation,
    CatFn,
    NdocAchat,
    DateDocAchat,
    idDesignation, // corrected variable name
    EtatIR,
  } = req.body;
  console.log("Request Body:", req.body);

  let prcTVA = 1;
  let pool;

  try {
    // Get the connection once and reuse it
    pool = await getConnection();

    // Validate idDesignation presence
    if (!idDesignation) {
      return res.status(400).json({ error: "idDesignation is required" });
    }

    // Retrieve the TVA percentage for the designation.
    // Adjust the parameter type (getSql().Int) if idDesignation should be a different type.
    const tvaResult = await pool
      .request()
      .input("id", getSql().Int, idDesignation)
      .query(designations.getOneById);

    if (!tvaResult.recordset || tvaResult.recordset.length === 0) {
      return res.status(404).json({ error: "Designation not found" });
    }

    prcTVA = tvaResult.recordset[0].PourcentageTVA;
    console.log("PourcentageTVA:", prcTVA);

    // Avoid division by zero
    if (prcTVA === 0) {
      return res
        .status(400)
        .json({ error: "Invalid TVA percentage: cannot be zero" });
    }

    // Calculate derived fields
    const MontantAvanceHT = MontantAvanceTTC / prcTVA;
    const MontantAvanceTVA = MontantAvanceTTC - MontantAvanceHT;

    // Prepare the request with all parameters
    const request = pool.request();
    request.input("id", getSql().Int, req.params.id);
    request.input("MontantAvanceTTC", getSql().Numeric, MontantAvanceTTC);
    request.input("MontantAvanceHT", getSql().Numeric, MontantAvanceHT);
    request.input("MontantAvanceTVA", getSql().Numeric, MontantAvanceTVA);
    request.input("BonCommande", getSql().VarChar, BonCommande);
    request.input("annulation", getSql().VarChar, annulation);
    request.input("NdocAchat", getSql().VarChar, NdocAchat);
    request.input("DateDocAchat", getSql().Date, DateDocAchat);
    // Assuming idDesignation is a numeric ID; change type if needed.
    request.input("idDesignation", getSql().Int, idDesignation);
    request.input("EtatIR", getSql().VarChar, EtatIR);
    request.input("CatFn", getSql().VarChar, CatFn);

    // Execute the appropriate SQL query based on the 'annulation' flag
    if (annulation === "Annuler") {
      await request.query(avance.AnnulerAvance);
    } else {
      await request.query(avance.updateAvance);
    }

    // Return the updated data as a JSON response
    res.json({
      id: req.params.id,
      MontantAvanceTTC,
      MontantAvanceHT,
      MontantAvanceTVA,
      BonCommande,
      annulation,
      CatFn,
      NdocAchat,
      DateDocAchat,
      idDesignation,
      EtatIR,
    });
  } catch (error) {
    // Log the error and return a 500 status
    console.error("Error in updateOrAnnulerAvance:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAvanceNonRestitByFournisseur = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .query(avance.getAvanceNonRestitByFournisseur);
    res.set("Content-Range", `Count 0-1/1`);
    res.json(result.recordset[0]);
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};
