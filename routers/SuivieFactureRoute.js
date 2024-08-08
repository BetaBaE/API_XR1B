const express = require("express"); // Importation du framework Express

// Importation des fonctions de contrôleur depuis "../controllers/SuivieFacture"
const {
  getSuivieFactureCount,
  getSuivieFacture,
  getSuivieFactureCountEchu,
  getSuivieFactureEchu,
  getallCountexport,
  getSuivieFactureNonPayeCount,
  getSuivieFactureNonPayé,
  getAnneeFacture,
  SuivieFactureByFournisseurExercice,
} = require("../controllers/SuivieFacture");

const router = express.Router(); // Création d'une instance de routeur Express

// Route pour obtenir le comptage et les détails des factures suivies
router.get("/SuivieFacture", getSuivieFactureCount, getSuivieFacture);

// Route pour obtenir le comptage et les détails des factures échues
router.get(
  "/SuivieFactureEchu",
  getSuivieFactureCountEchu,
  getSuivieFactureEchu
);

// Route pour obtenir le comptage et les détails des factures non payées
router.get(
  "/FactureNonPaye",
  getSuivieFactureNonPayeCount,
  getSuivieFactureNonPayé
);

// Route pour obtenir le comptage total des exports
router.get("/allcountexport", getallCountexport);

// Route pour obtenir les années des factures suivies disponibles
router.get("/getAnneeSuivieFacture", getAnneeFacture);

// Route pour obtenir les détails des factures suivies par fournisseur pour un exercice donné
router.get(
  "/SuivieFactureByFournisseurExercice/:nom/:annee",
  SuivieFactureByFournisseurExercice
);

module.exports = router; // Exportation du routeur pour pouvoir l'utiliser dans d'autres fichiers
