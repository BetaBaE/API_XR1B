const { getConnection, getSql } = require("../database/connection"); // Importation des fonctions de connexion à la base de données
const { chantiers } = require("../database/ChantierQuery"); // Importation des requêtes SQL spécifiques aux chantiers depuis ../database/querys

// Fonction pour récupérer une liste paginée de chantiers avec possibilité de filtrage et de tri
exports.GetChantier = async (req, res) => {
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
    if (filter.LIBELLE) {
      // Construction de la clause de filtre SQL si un libellé est spécifié
      queryFilter += ` and upper(nom) like upper('%${filter.LIBELLE}%')`;
    }
    console.log(queryFilter); // Affichage de la clause de filtre pour débogage

    const pool = await getConnection(); // Obtention d'une connexion pool à la base de données

    // Récupération du nombre total de chantiers (pour la pagination)
    const countResult = await pool
      .request()
      .query(`${chantiers.getChantiers} ${queryFilter}`);
    // const count = countResult.recordset[0].totalCount;

    // Récupération des chantiers paginés, triés et filtrés
    const result = await pool.request().query(
      `${chantiers.getChantiers} ${queryFilter}
      ORDER BY ${sort[0]} ${sort[1]}
      OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );

    // Définition de l'en-tête Content-Range pour indiquer la plage des résultats retournés
    res.set("Content-Range", `Chantier ${range[0]}-${range[1] + 1}/$1000`);
    res.json(result.recordset); // Envoi des données des chantiers au format JSON
  } catch (error) {
    // Gestion des erreurs : envoi du statut d'erreur 500 et du message d'erreur
    res.status(500);
    res.send(error.message);
  }
};

// Fonction middleware pour récupérer le nombre total de chantiers
exports.GetChantierCount = async (req, res, next) => {
  try {
    const pool = await getConnection(); // Obtention d'une connexion pool à la base de données
    const result = await pool.request().query(chantiers.getcountChantier); // Exécution de la requête SQL pour compter les chantiers
    req.count = result.recordset[0].count; // Stockage du nombre de chantiers dans req.count
    next(); // Appel à la fonction middleware suivante
  } catch (error) {
    // Gestion des erreurs : envoi du statut d'erreur 500 et du message d'erreur
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};

// Fonction pour récupérer les chantiers associés à une facture spécifique en utilisant son ID
exports.GetChantierbyFactureId = async (req, res) => {
  try {
    const pool = await getConnection(); // Obtention d'une connexion pool à la base de données

    const result = await pool
      .request()
      .input("id", getSql().Int, req.params.id) // Utilisation du paramètre d'URL :id comme valeur pour l'ID de facture
      .query(chantiers.getChantiersbyfactureid); // Exécution de la requête SQL pour récupérer les chantiers

    res.set("Content-Range", `Chantier 0-1/1`); // Définition de l'en-tête Content-Range (peut être ajusté selon le besoin)

    res.json(result.recordset); // Envoi des données des chantiers associés à la facture au format JSON
  } catch (error) {
    // Gestion des erreurs : envoi du statut d'erreur 500 et du message d'erreur
    res.send(error.message);
    res.status(500);
  }
};

// Fonction pour récupérer les chantiers associés à un numéro de bon de commande spécifique
exports.GetChantierByBoncommande = async (req, res) => {
  try {
    const pool = await getConnection(); // Obtention d'une connexion pool à la base de données

    const resultBc = await pool
      .request()
      .input("Boncommande", getSql().VarChar, req.params.Boncommande) // Utilisation du paramètre d'URL :Boncommande comme valeur pour le bon de commande
      .query(chantiers.getChantierbyBc); // Exécution de la requête SQL pour récupérer les chantiers

    const resultFA = await pool
      .request()
      .input("Boncommande", getSql().VarChar, req.params.Boncommande) // Utilisation du paramètre d'URL :Boncommande comme valeur pour le bon de commande
      .query(chantiers.getChantierbyFA); // Exécution de la requête SQL pour récupérer les chantiers

    res.set("Content-Range", `cahntier 0-1/1`); // Définition de l'en-tête Content-Range (peut être ajusté selon le besoin)

    res.json({ BC: resultBc.recordset, FA: resultFA.recordset }); // Envoi des données des chantiers associés au bon de commande au format JSON
  } catch (error) {
    // Gestion des erreurs : envoi du statut d'erreur 500 et du message d'erreur
    res.send(error.message);
    res.status(500);
  }
};
