const express = require("express"); // Importation du module Express pour créer des routes
const { GetChantierCount, GetChantier, GetChantierbyFactureId, GetChantierByBoncommande } = require("../controllers/Chantier"); // Importation des fonctions de contrôleur depuis ../controllers/Chantier

const router = express.Router(); // Création d'un routeur Express

// Définition des routes avec leurs fonctions de contrôleur associées

// Route pour obtenir le nombre de chantiers et la liste des chantiers
router.get("/Chantier", GetChantierCount, GetChantier);

// Route pour obtenir les chantiers associés à une facture spécifique en utilisant son ID
router.get("/getchantierbyfactureid/:id", GetChantierbyFactureId);

// Route pour obtenir les chantiers associés à une commande spécifique en utilisant son numéro de bon de commande
router.get("/getchantierbyBonCommande/:Boncommande", GetChantierByBoncommande);

module.exports = router; // Exportation du routeur configuré
