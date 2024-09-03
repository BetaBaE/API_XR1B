const { getConnection, getSql } = require("../database/connection"); // Importation des fonctions de connexion à la base de données
const { designation } = require("../database/FactureDesignationQuery"); // Importation des requêtes SQL spécifiques aux designations depuis ../database/querys

// Fonction pour récupérer une liste paginée de designations avec possibilité de filtrage et de tri
exports.GetDesignations = async (req, res) => {
  try {
    // Récupération des paramètres de pagination, tri et filtre depuis la requête
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["id" , "ASC"]';
    let filter = req.query.filter || "{}";

    // Conversion des paramètres JSON en objets JavaScript
    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);

    console.log(filter); // Affichage du filtre pour débogage

    let queryFilter = "";
    if (filter.codeDesignation) {
      // Construction de la clause de filtre SQL si un code de designation est spécifié
      queryFilter += ` and upper(codeDesignation) like(upper('%${filter.codeDesignation}%'))`;
    }

    const pool = await getConnection(); // Obtention d'une connexion pool à la base de données

    // Récupération des designations paginées, triées et filtrées
    const result = await pool.request().query(
      `${designation.getDesignation} ${queryFilter} Order by ${sort[0]} ${
        sort[1]
      }
            OFFSET ${range[0]} ROWS FETCH NEXT ${
        range[1] + 1 - range[0]
      } ROWS ONLY`
    );

    // Traitement des résultats pour ajouter un texte personnalisé en fonction de l'ID
    const recordsWithSeparator = result.recordset.map((record) => {
      if (record.id > 30) {
        // Ajouter un texte spécifique avant l'affichage pour les ID supérieurs à 30
        record.designation = `Designation des factures 2024-${record.designation}`;
      } else {
        record.designation = `Ancien designation-${record.designation}`;
      }
      return record;
    });

    // Définition de l'en-tête Content-Range pour indiquer la plage des résultats retournés
    res.set(
      "Content-Range",
      `Designations ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );
    res.json(recordsWithSeparator); // Envoi des données des designations au format JSON avec les modifications effectuées
  } catch (error) {
    // Gestion des erreurs : envoi du statut d'erreur 500 et du message d'erreur
    res.status(500);
    res.send(error.message);
  }
};

// Fonction pour récupérer les designations par code de designation spécifique
exports.GetDesignationByCode = async (req, res) => {
  try {
    const pool = await getConnection(); // Obtention d'une connexion pool à la base de données

    const result = await pool
      .request()
      .input("id", getSql().VarChar, req.params.id) // Utilisation du paramètre d'URL :id comme valeur pour le code de designation
      .query(designation.getdesignationbynom); // Exécution de la requête SQL pour récupérer les designations

    res.set("Content-Range", `virement 0-1/1`); // Définition de l'en-tête Content-Range (peut être ajusté selon le besoin)

    res.json(result.recordset); // Envoi des données des designations associées au code de designation au format JSON
  } catch (error) {
    // Gestion des erreurs : envoi du statut d'erreur 500 et du message d'erreur
    res.send(error.message);
    res.status(500);
  }
};

exports.GetPourcentageTVA = async (req, res) => {
  try {
    const pool = await getConnection(); // Obtention d'une connexion pool à la base de données

    const result = await pool
      .request()

      .query(designation.getPourcentageTva); // Exécution de la requête SQL pour récupérer les designations

    res.set("Content-Range", `pourcentage 0-1/1`); // Définition de l'en-tête Content-Range (peut être ajusté selon le besoin)

    res.json(result.recordset); // Envoi des données des designations associées au code de designation au format JSON
  } catch (error) {
    // Gestion des erreurs : envoi du statut d'erreur 500 et du message d'erreur
    res.send(error.message);
    res.status(500);
  }
};
