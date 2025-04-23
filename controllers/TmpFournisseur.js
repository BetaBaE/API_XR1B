const { getConnection, getSql } = require("../database/connection");
const { TMPFournisseurs } = require("../database/TmpFournisseur");

exports.getTMPFournisseursCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query(TMPFournisseurs.getCountTmpFournisseur);
    req.count = result.recordset[0].count; // Stocker le compte des fournisseurs
    next(); // Passer au middleware suivant
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message); // Retourner l'erreur
  }
};

exports.getTMPFournissuers = async (req, res) => {
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
    console.log(queryFilter);

    const pool = await getConnection();

    // Exécuter la requête pour récupérer les fournisseurs
    const result = await pool.request().query(
      `${TMPFournisseurs.getAllTmpFournisseurs} ${queryFilter} Order by ${
        sort[0]
      } ${sort[1]}
      OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );

    console.log(req.count);
    res.set(
      "Content-Range",
      `tmpFournisseur ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.createTMPFournisseurs = async (req, res) => {
  const { nom, Redacteur, catFournisseur } = req.body;

  try {
    const pool = await getConnection();

    await pool
      .request()
      .input("nom", getSql().VarChar, nom.trim())
      .input("catFournisseur", getSql().VarChar, catFournisseur)
      .input("Redacteur", getSql().VarChar, Redacteur)
      .query(TMPFournisseurs.createTmpFournisseur);

    console.log("success");
    res.json({
      id: "",
      nom,
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
    console.log(error.message);
  }
};

exports.getTMPfournisseurById = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().VarChar, req.params.id)
      .query(TMPFournisseurs.getOneTmpFournisseurs);

    res.set("Content-Range", `tmpFournisseur 0-1/1`);
    res.json(result.recordset[0]);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.updateTMPfournisseur = async (req, res) => {
  const { etat, Validateur } = req.body;
  console.log(req.body);

  try {
    const pool = await getConnection();

    await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .input("etat", getSql().VarChar, etat)
      .input("validateur", getSql().VarChar, Validateur)
      .query(TMPFournisseurs.updateTmpFournisseur);

    res.json({
      id: req.params.id,
      etat,
      Validateur,
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};
