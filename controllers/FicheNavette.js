const { getConnection, getSql } = require("../database/connection");
const { FicheNavette, factures, BonLivraison, factureSaisie } = require("../database/querys");

exports.getFactureCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(FicheNavette.getCount);
    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};
exports.getFacture = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["id" , "desc"]';
    let filter = req.query.filter || "{}";

    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);

    let queryFilter = "";

    if (filter.ficheNavette) {
      queryFilter += ` and upper(fich.ficheNavette) like (upper('%${filter.ficheNavette}%'))`;
    }
    if (filter.chantier) {
      queryFilter += ` and upper(fich.LIBELLE) like (upper('%${filter.chantier}%'))`;
    }

    if (filter.BonCommande) {
      queryFilter += ` and upper(BonCommande)  like ('%${filter.BonCommande}%')`;
    }
    if (filter.fournisseur) {
      queryFilter += ` and upper(fich.nom) like (upper('%${filter.fournisseur}%'))`;
    }

    if (filter.designation) {
      queryFilter += ` and upper(designation) like (upper('%${filter.designation}%'))`;
    }

    if (filter.numeroFacture) {
      queryFilter += ` and upper(fich.numeroFacture)  like ('%${filter.numeroFacture}%')`;
    }
    if (filter.CodeFournisseur) {
      queryFilter += ` and upper(CodeFournisseur) like (upper('%${filter.CodeFournisseur}%'))`;
    }
    console.log(queryFilter);
    const pool = await getConnection();
   
    const result = await pool.request().query(
      `${FicheNavette.get} ${queryFilter} Order by ${sort[0]} ${
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
exports.CreateFicheNavetteAvance = async (req, res) => {
  const {
    codechantier,
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
    MontantTVA
  } = req.body;

  try {
    const pool = await getConnection();
    console.log('Connected to database');
    console.log('Checking if composition already exists');

    const existingCompositionResult = await pool
      .request()
      .input("codechantier", getSql().VarChar, codechantier)
      .input("ficheNavette", getSql().VarChar, ficheNavette)
      .input("Bcommande", getSql().VarChar, Bcommande)
      .input("idfournisseur", getSql().Int, idfournisseur)
      .query(FicheNavette.existingCompositionAvance);

    console.log('Existing composition result:', existingCompositionResult.recordset);

    if (existingCompositionResult.recordset.length > 0) {
      return res.status(400).json({ message: "La composition existe déjà dans la table daf_factureNavette" });
    }

    let modifiedFicheNavette = ficheNavette;
    if (service) {
      modifiedFicheNavette = `admin/${new Date().getFullYear()}/${service}/${ficheNavette}`;
      console.log('Modified ficheNavette with service:', modifiedFicheNavette);
    }

    const insertResult = await pool
      .request()
      .input("codechantier", getSql().VarChar, codechantier)
      .input("montantAvance", getSql().Numeric(10, 2), montantAvance)
      .input("idfournisseur", getSql().Int, idfournisseur)
      .input("idFacture", getSql().Int, idFacture)
      .input("modifiedFicheNavette", getSql().VarChar, modifiedFicheNavette)
      .input("Bcommande", getSql().VarChar, Bcommande)
      .input("fullName", getSql().VarChar, fullName)
      .input("CatFn", getSql().VarChar, CatFn)
      .input("TTC", getSql().Numeric(10, 2), TTC)
      .input("HT", getSql().Numeric(10, 2), HT)
      .input("MontantTVA", getSql().Numeric(10, 2), MontantTVA)
      .query(FicheNavette.create);
    if (idFacture === 0) {
      await pool
        .request()
        .input("codechantier", getSql().VarChar, codechantier)
        .input("montantAvance", getSql().Numeric(10, 2), montantAvance)
        .input("idfournisseur", getSql().Int, idfournisseur)
        .input("idFacture", getSql().Int, idFacture)
        .input("modifiedFicheNavette", getSql().VarChar, modifiedFicheNavette)
        .input("Bcommande", getSql().VarChar, Bcommande)
        .input("fullName", getSql().VarChar, fullName)
        .input("CatFn", getSql().VarChar, CatFn)
        .input("TTC", getSql().Numeric(10, 2), TTC)
        .input("HT", getSql().Numeric(10, 2), HT)
        .input("MontantTVA", getSql().Numeric(10, 2), MontantTVA)
        .query(FicheNavette.CreateAvance);

      console.log('Avance created successfully');
    }

    res.json({
      id :"",
      codechantier,
      idFacture,
      ficheNavette: modifiedFicheNavette,
      idfournisseur,
      montantAvance,
      CatFn,
      TTC,
      HT,
      MontantTVA
    });
    console.log('Response sent successfully');

  } catch (error) {
    res.status(500).send(error.message);
    console.error('Error occurred:', error);
  }
};

   





exports.getfactureresById = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().VarChar, req.params.id)
      .query(FicheNavette.getOne);

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

exports.getavanceByfournisseur = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("idfournisseur", getSql().VarChar, req.params.idfournisseur)
      .query(FicheNavette.getavancebyfournisseur);

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
      .query(FicheNavette.getsumavancebyforurnisseur);

    res.set("Content-Range", `ficheNavette 0-1/1`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};




exports.correction = async (req, res) => {
  const { ficheNavette, idFacture,montantAvance
    ,idfournisseur,codechantier,BonCommande,
    annulation,Validateur,CatFn
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
      .query(FicheNavette.update);
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
      CatFn
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
    console.log(error.message);
  }
};



exports.annulation = async (req, res) => {
  const { id
    
  } = req.body;
  try {
    const pool = await getConnection();
    await pool
    .request()
    .input("id", getSql().Int, id)
    
    .query(FicheNavette.annulationFn);

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
     
      .query(FicheNavette.annulationFn);

      console.log(`${factureFicheNavette.annulationFn}` + "ma requete")
    return result.recordset;
  } catch (error) {
    console.error(error.message);
  }
}


exports.getBonLivraisonByFactureId = async (req, res) => {
  const factureId = req.params.id;

  try {
   
    const bonLivraisons = await BonLivraison.findAll({
      where: { idFacture: factureId }
    });

    res.json(bonLivraisons);
    console.log("gh",bonLivraisons)
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
exports.updatenavette = async (req, res) => {
  try {
    const {
      ficheNavette,
      idFacture,
      montantAvance: inputMontantAvance,
      idfournisseur,
      codechantier,
      annulation,
      Validateur
    } = req.body;
    // Vérifier si 'montantAvance' est spécifié dans la requête
    if (req.body && req.body.montantAvance !== undefined) {
      console.log("Montant Avance:", req.body.montantAvance);
      const pool = await getConnection();
      await pool
        .request()
        .input("id", getSql().Int, req.params.id)
        .input("ficheNavette", getSql().VarChar, ficheNavette)
        .input("codechantier", getSql().VarChar, codechantier)
        .input("idFacture", getSql().Int, idFacture)
        .input("idfournisseur", getSql().Int, idfournisseur)
        .input("montantAvance", getSql().Int, inputMontantAvance)
        .input("annulation", getSql().VarChar, annulation)
        .input("Validateur", getSql().VarChar, Validateur)
        .query(FicheNavette.updateFactureQuery);
      const result = await pool
        .request()
        .input("idFacture", getSql().Int, idFacture)
        .query(factureFicheNavette.getMontantAvanceQuery);
      const updatedMontantAvance = result.recordset[0].montantAvance;
      const ttcResult = await pool
        .request()
        .input("idFacture", getSql().Int, idFacture)
        .query(factureFicheNavette.getTtcQuery);
      let ttc = 0;
      if (ttcResult.recordset.length > 0) {
        ttc = ttcResult.recordset[0]?.TTC || 0;
      }
      const netAPayer = ttc - updatedMontantAvance;
      await pool
        .request()
        .input("netAPayer", getSql().Float, netAPayer)
        .input("idFacture", getSql().Int, idFacture)
        .query(factureFicheNavette.updateQuery);

      console.log(`NetAPayer mis à jour pour idFacture ${idFacture}: ${netAPayer}`);

      // Répondre avec les données mises à jour
      res.json({
        id: req.params.id,
        ficheNavette,
        idFacture,
        codechantier,
        montantAvance: updatedMontantAvance,
      });
    } else {
      // Si 'montantAvance' n'est pas spécifié, renvoyer une réponse d'erreur
      res.status(400).json({ error: "Montant d'avance non spécifié dans la requête." });
    }
  } catch (error) {
    // Gérer les erreurs
    res.status(500).send(error.message);
    console.log(error.message);
  }
};
