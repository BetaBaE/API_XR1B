// Importation des modules nécessaires
const { getConnection, getSql } = require("../database/connection");
const { EcheanceReel } = require("../database/EcheanceReelQuery");

// Fonction pour récupérer les échéances réelles avec pagination, tri et filtrage
exports.getEcheanceReel = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["nom" , "ASC"]';
    let filter = req.query.filter || "{}";

    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);

    let queryFilter = ""; // Initialisation de la chaîne de filtre

    const pool = await getConnection(); // Obtention d'une connexion à la base de données

    // Exécution de la requête pour récupérer les échéances réelles avec filtres, tri et pagination
    const result = await pool.request().query(
      `${EcheanceReel.getAllecheanceReel} ${queryFilter} Order by ${sort[0]} ${
        sort[1]
      }
        OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );

    res.set(
      "Content-Range",
      `fournisseurs ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    ); // Configuration de l'en-tête de réponse pour indiquer la plage de résultats
    res.json(result.recordset); // Envoi des résultats au client
  } catch (error) {
    res.status(500); // Envoi d'une réponse d'erreur en cas de problème
    res.send(error.message); // Envoi de l'erreur au client
  }
};

// Middleware pour obtenir le nombre total d'échéances réelles
exports.getEcheanceReelCount = async (req, res, next) => {
  try {
    const pool = await getConnection(); // Obtention d'une connexion à la base de données
    const result = await pool
      .request()
      .query(EcheanceReel.getAllecheanceReelCount); // Exécution de la requête pour compter les échéances
    req.count = result.recordset[0].count; // Stockage du résultat dans req.count
    next(); // Passage au middleware suivant
  } catch (error) {
    res.status(500); // Envoi d'une réponse d'erreur en cas de problème
    console.log(error.message); // Affichage de l'erreur dans la console
    res.send(error.message); // Envoi de l'erreur au client
  }
};

// Fonction pour créer une nouvelle échéance réelle
exports.create = async (req, res) => {
  const { idfournisseur, modalitePaiement, dateecheance, Redacteur } = req.body;

  try {
    const pool = await getConnection(); // Obtention d'une connexion à la base de données

    await pool
      .request()
      .input("idfournisseur", getSql().Int, idfournisseur)
      .input("modalitePaiement", getSql().VarChar, modalitePaiement)
      .input("dateecheance", getSql().Date, dateecheance)
      .input("Redacteur", getSql().VarChar, Redacteur)
      .query(EcheanceReel.create); // Exécution de la requête pour créer une nouvelle échéance réelle
    console.log("success");

    res.json({
      id: "",
      idfournisseur,
      modalitePaiement,
      dateecheance,
      Redacteur,
    }); // Envoi des détails de la nouvelle échéance au client
  } catch (error) {
    res.status(500); // Envoi d'une réponse d'erreur en cas de problème
    res.send(error); // Envoi de l'erreur au client
    console.log(error); // Affichage de l'erreur dans la console
  }
};

// Fonction pour récupérer les échéances réelles par fournisseur
exports.getEcheanceReelbyfournisseur = async (req, res) => {
  try {
    const pool = await getConnection(); // Obtention d'une connexion à la base de données

    const result = await pool
      .request()
      .input("idfournisseur", getSql().Int, req.params.idfournisseur)
      .query(EcheanceReel.getEcheanceReelbyfournisseur); // Exécution de la requête pour récupérer les échéances par fournisseur

    res.set("Content-Range", `cahntier 0-1/1`); // Configuration de l'en-tête de réponse pour indiquer la plage de résultats

    res.json(result.recordset); // Envoi des résultats au client
  } catch (error) {
    res.status(500).send(error.message); // Envoi d'une réponse d'erreur en cas de problème
  }
};
