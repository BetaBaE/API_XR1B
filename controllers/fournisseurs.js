const { getConnection, getSql } = require("../database/connection");
const { Fournisseurs } = require("../database/FournisseurQuery");

// Récupérer le nombre total de fournisseurs
exports.getFournisseursCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query(Fournisseurs.getFournisseursCount);
    req.count = result.recordset[0].count; // Stocker le compte des fournisseurs
    next(); // Passer au middleware suivant
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message); // Retourner l'erreur
  }
};

// Récupérer les fournisseurs avec pagination et tri
exports.getFournissuers = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]"; // Définir la plage par défaut
    let sort = req.query.sort || '["id", "ASC"]'; // Définir le tri par défaut
    let filter = req.query.filter || "{}"; // Définir les filtres par défaut
    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);
    console.log(filter);

    let queryFilter = "";
    // Ajouter un filtre sur le nom si présent
    if (filter.nom) {
      queryFilter += ` and upper(fou.nom) like(upper('%${filter.nom}%'))`;
    }
    // Ajouter un filtre sur le code fournisseur si présent
    if (filter.codeFournisseur) {
      queryFilter += ` and upper(fou.codeFournisseur) like('%${filter.codeFournisseur}%')`;
    }
    console.log(queryFilter);

    const pool = await getConnection();

    // Exécuter la requête pour récupérer les fournisseurs
    const result = await pool.request().query(
      `${Fournisseurs.getAllFournisseurs} ${queryFilter} Order by ${sort[0]} ${
        sort[1]
      }
      OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );

    console.log(req.count);
    res.set(
      "Content-Range",
      `fournisseurs ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

// Récupérer tous les fournisseurs sans pagination
exports.getAllFournissuers = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(Fournisseurs.getAllFournisseurs);

    res.set("Content-Range", `fournisseurs 0-${req.count - 1}/${req.count}`);
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

// Créer un nouveau fournisseur
exports.createFournisseurs = async (req, res) => {
  const {
    CodeFournisseur,
    nom,
    Echeance,
    IF,
    mail,
    addresse,
    ICE,
    Redacteur,
    catFournisseur,
    exonorer,
    RasIr,
  } = req.body;

  try {
    const pool = await getConnection();

    await pool
      .request()
      .input("CodeFournisseur", getSql().VarChar, CodeFournisseur)
      .input("nom", getSql().VarChar, nom.trim())
      .input("catFournisseur", getSql().VarChar, catFournisseur)
      .input("ICE", getSql().VarChar, ICE)
      .input("IF", getSql().VarChar, IF)
      .input("addresse", getSql().VarChar, addresse)
      .input("mail", getSql().VarChar, mail)
      .input("Redacteur", getSql().VarChar, Redacteur)
      .input("exonorer", getSql().VarChar, exonorer)
      .input("RasIr", getSql().VarChar, RasIr)
      .query(Fournisseurs.createFournisseur);

    console.log("success");
    res.json({
      id: "",
      CodeFournisseur,
      nom,
      Echeance,
      IF,
      mail,
      addresse,
      ICE,
      exonorer,
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
    console.log(error.message);
  }
};

// Récupérer les RIB des fournisseurs valides
exports.getRibsFournisseurValid = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .query(Fournisseurs.RibsFournisseurValid);

    console.log(req.count);
    res.set(
      "Content-Range",
      `fournisseurs 0-${req.count - 1}/${req.count - 1}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

// Récupérer les RIB d'un fournisseur spécifique basé sur l'ID
exports.FournisseursRibValid = async (req, res) => {
  let filter = req.query.ordervirment || "{}";
  filter = JSON.parse(filter);

  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("ovId", getSql().VarChar, filter.id)
      .query(Fournisseurs.RibsFournisseurValid);

    res.set("Content-Range", `fournisseurs 0 - ${req.count}/${req.count}`);
    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

// Récupérer un fournisseur par son ID
exports.getfournisseurById = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().VarChar, req.params.id)
      .query(Fournisseurs.getOne);

    res.set("Content-Range", `factures 0-1/1`);
    res.json(result.recordset[0]);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

// Mettre à jour un fournisseur existant
exports.updatefournisseur = async (req, res) => {
  const {
    ICE,
    Identifiantfiscal,
    addresse,
    mail,
    catFournisseur,
    exonorer,
    RasIr,
  } = req.body;

  try {
    const pool = await getConnection();

    await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .input("ICE", getSql().VarChar, ICE)
      .input("Identifiantfiscal", getSql().VarChar, Identifiantfiscal)
      .input("addresse", getSql().VarChar, addresse)
      .input("mail", getSql().VarChar, mail)
      .input("catFournisseur", getSql().VarChar, catFournisseur)
      .input("exonorer", getSql().VarChar, exonorer)
      .input("RasIr", getSql().VarChar, RasIr)
      .query(Fournisseurs.update);

    res.json({
      id: req.params.id,
      ICE,
      Identifiantfiscal,
      addresse,
      mail,
      catFournisseur,
      exonorer,
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

// Récupérer tous les fournisseurs ayant une échéance
exports.getfournisseurwithecheance = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .query(Fournisseurs.getallfournisseurwithecheanceLoi);

    console.log(req.count);
    res.set(
      "Content-Range",
      `fournisseurs 0-${req.count - 1}/${req.count - 1}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

/* Récupérer le fournisseur par nom */
exports.getNomfournisseur = async (req, res) => {
  const { nom } = req.body;
  console.log("req.body", req.body);
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("nom", getSql().VarChar, nom)
      .query(Fournisseurs.getNomfournisseur);

    console.log(req.count);
    res.set(
      "Content-Range",
      `fournisseurs 0-${req.count - 1}/${req.count - 1}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

// Récupérer tous les fournisseurs "propres" qui ont ice IF , Catégorie
exports.getAllFournissuersClean = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(Fournisseurs.getFournisseurClean);

    res.set("Content-Range", `fournisseurs 0-${req.count - 1}/${req.count}`);
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.getMatchfournisseurByName = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("name", getSql().VarChar, req.params.id)
      .query(Fournisseurs.fournisseurMatchsByName);

    res.set("Content-Range", `tmpFournisseur 0-1/1`);
    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
exports.getfournisseurInternational = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query(Fournisseurs.fournisseurInternational);

    res.set("Content-Range", `tmpFournisseur 0-99/100`);
    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
