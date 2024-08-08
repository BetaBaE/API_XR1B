// Importation des modules nécessaires
const { getConnection, getSql } = require("../database/connection");
const { AvancePayer } = require("../database/AvancePayerQuery");

// Middleware pour obtenir le nombre total de paiements d'avance
exports.getAvancePayerCount = async (req, res, next) => {
  try {
    const pool = await getConnection(); // Obtention d'une connexion à la base de données
    const result = await pool.request().query(AvancePayer.getAvancePayerCount); // Exécution de la requête pour compter les paiements d'avance
    req.count = result.recordset[0].count; // Stockage du résultat dans req.count
    next(); // Passage au middleware suivant
  } catch (error) {
    res.status(500); // Envoi d'une réponse d'erreur en cas de problème
    console.log(error.message); // Affichage de l'erreur dans la console
    res.send(error.message); // Envoi de l'erreur au client
  }
};

// Fonction pour récupérer les paiements d'avance avec pagination, tri et filtrage
exports.getAvancePayer = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]"; // Récupération de la plage de résultats à afficher
    let sort = req.query.sort || '["id" , "ASC"]'; // Récupération des critères de tri
    let filter = req.query.filter || "{}"; // Récupération des filtres

    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);

    let queryFilter = ""; // Initialisation de la chaîne de filtre

    // Application des filtres si présents
    if (filter.Bcommande) {
      queryFilter += ` and upper(fn.Bcommande) like(upper('%${filter.Bcommande}%'))`;
    }
    if (filter.CodeFournisseur) {
      queryFilter += ` and upper(fou.CodeFournisseur) like(upper('%${filter.CodeFournisseur}%'))`;
    }
    if (filter.nom) {
      queryFilter += ` and upper(fou.nom) like(upper('%${filter.nom}%'))`;
    }
    if (filter.ficheNavette) {
      queryFilter += ` and upper(fn.ficheNavette) like(upper('%${filter.ficheNavette}%'))`;
    }
    if (filter.LIBELLE) {
      queryFilter += ` and upper(ch.LIBELLE) like(upper('%${filter.LIBELLE}%'))`;
    }

    const pool = await getConnection(); // Obtention d'une connexion à la base de données

    // Exécution de la requête pour récupérer les paiements d'avance avec filtres, tri et pagination
    const result = await pool.request().query(
      `${AvancePayer.getAvancePayer} ${queryFilter} Order by ${sort[0]} ${
        sort[1]
      }
      OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );

    res.set(
      "Content-Range",
      `logfacture ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    ); // Configuration de l'en-tête de réponse pour indiquer la plage de résultats
    res.json(result.recordset); // Envoi des résultats au client
  } catch (error) {
    res.status(500); // Envoi d'une réponse d'erreur en cas de problème
    res.send(error.message); // Envoi de l'erreur au client
  }
};
