const { getConnection, getSql } = require("../database/connection");

const { FicheNavette } = require("../database/FicheNavetteQuery");

exports.getFicheNavetteCount = async (req, res, next) => {
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
exports.getFicheNavette = async (req, res) => {
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
      queryFilter += ` and upper(Bcommande)  like ('%${filter.BonCommande}%')`;
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
      `${FicheNavette.get} ${queryFilter} Order by ${sort[0]} ${sort[1]}
    OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );

    console.log(req.count);
    res.set(
      "Content-Range",
      `DOC ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};
exports.CreateFicheNavette = async (req, res) => {
  const {
    codechantier,
    idFacture,
    ficheNavette,
    idfournisseur,
    montantAvance,
    service,
    fullName,
    Bcommande,
    TTC,
    HT,
    MontantTVA,
  } = req.body;

  try {
    const pool = await getConnection();
    console.log("Connected to database");
    console.log("Checking if composition already exists");

    const existingCompositionResult = await pool
      .request()
      .input("codechantier", getSql().VarChar, codechantier)
      .input("ficheNavette", getSql().VarChar, ficheNavette)
      .input("Bcommande", getSql().VarChar, Bcommande)
      .input("idfournisseur", getSql().Int, idfournisseur)
      .query(FicheNavette.existingCompositionAvance);

    console.log(
      "Existing composition result:",
      existingCompositionResult.recordset
    );

    if (existingCompositionResult.recordset.length > 0) {
      return res.status(400).json({
        message: "La composition existe déjà dans la table daf_factureNavette",
      });
    }

    let modifiedFicheNavette = ficheNavette;
    if (service) {
      modifiedFicheNavette = `admin/${new Date().getFullYear()}/${service}/${ficheNavette}`;
      console.log("Modified ficheNavette with service:", modifiedFicheNavette);
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
      .input("TTC", getSql().Numeric(10, 2), TTC)
      .input("HT", getSql().Numeric(10, 2), HT)
      .input("MontantTVA", getSql().Numeric(10, 2), MontantTVA)
      .query(FicheNavette.create);

    res.json({
      id: "",
      codechantier,
      idFacture,
      ficheNavette: modifiedFicheNavette,
      idfournisseur,
      montantAvance,
      TTC,
      HT,
      MontantTVA,
    });
    console.log("Response sent successfully");
  } catch (error) {
    res.status(500).send(error.message);
    console.error("Error occurred:", error);
  }
};

exports.getDocById = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().VarChar, req.params.id)
      .query(FicheNavette.getone);

    res.set("Content-Range", `AvanceFacture 0-1/1`);

    res.json(result.recordset[0]);
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

exports.UpdateorAnnuler = async (req, res) => {
  const { ficheNavette, codechantier, BonCommande, annulation, CatFn } =
    req.body;
  try {
    const pool = await getConnection();
    const request = pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .input("ficheNavette", getSql().VarChar, ficheNavette)
      .input("BonCommande", getSql().VarChar, BonCommande)
      .input("annulation", getSql().VarChar, annulation)
      .input("CatFn", getSql().VarChar, CatFn);

    if (annulation === "Annuler") {
      await request.query(FicheNavette.AnnulationFnAvance);
    } else {
      await request.query(FicheNavette.update);
    }

    res.json({
      id: req.params.id,
      ficheNavette,
      codechantier,
      BonCommande,
      annulation,
      CatFn,
    });
  } catch (error) {
    res.status(500).send(error.message);
    console.log(error.message);
  }
};
