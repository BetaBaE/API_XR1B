const express = require("express"); // Importation du framework Express

// Importation des contrôleurs de gestion des designations de facture et des opérations sur les factures
const {
  GetDesignations,
  GetDesignationByCode,
} = require("../controllers/DesignationFacture");
const {
  getfactureSaisieCount,
  getfactureSaisie,
  createfacture,
  getfactureSaisieById,
  updatefactureSaisie,
  getfacturebyfournisseur,
  getfacturehistorique,
  getFacturehistoriqueCount,
  getfacturebyfournisseurpaiement,
  getFacturevaliderCount,
  getfacturevalider,
  updatefacturevalider,
  getsumfacturebyfournisseurwithfn,
  getsumfacturebyfournisseurwithoutfn,
  getAvancesNonPayeesParFournisseurId,
  checkFAcreation,
} = require("../controllers/FactureSaisie"); // Importation des fonctions de contrôle des opérations sur les factures

const router = express.Router(); // Création d'un routeur Express

// Définition des routes avec les méthodes HTTP correspondantes et les fonctions de contrôle associées

router.get("/facturesSaisie", getfactureSaisieCount, getfactureSaisie); // Route pour récupérer les factures saisies avec comptage
router.get("/facturesSaisie/:id", getfactureSaisieById); // Route pour récupérer une facture saisie par ID

router.post("/facturesSaisie", createfacture); // Route pour créer une nouvelle facture saisie

router.put("/facturesSaisie/:id", updatefactureSaisie); // Route pour mettre à jour une facture saisie par ID

router.get("/facturebyfournisseur/:nom", getfacturebyfournisseur); // Route pour récupérer les factures d'un fournisseur par nom

router.get("/designation", GetDesignations); // Route pour récupérer les designations de facture

router.get("/designationbycode/:id", GetDesignationByCode); // Route pour récupérer une designation de facture par code

router.get(
  "/getfacturebyfournisseurid/:id",
  getAvancesNonPayeesParFournisseurId
);

router.get(
  "/historiquefacture",
  getFacturehistoriqueCount,
  getfacturehistorique
); // Route pour récupérer l'historique des factures avec comptage

router.get("/getfacturebyfournisseur/:id", getfacturebyfournisseurpaiement); // Route pour récupérer les factures d'un fournisseur pour paiement

router.get(
  "/facturevalider",
  getFacturevaliderCount,
  getfacturevalider
); /* Route pour récupérer les factures
qui ont  verifiyMidelt IS NULL OR f.BonCommande IS NULL OR f.BonCommande = ''
or f.CatFn is null qui n'ont avec comptage*/
router.get("/facturevalider/:id", getfactureSaisieById); // Route pour récupérer une facture validée par ID

router.get(
  "/getsumfacturebyfournisseurwithfn/:id",
  getsumfacturebyfournisseurwithfn
); // Route pour récupérer le total des factures d'un fournisseur avec fiche Navette
router.get(
  "/getsumfacturebyfournisseurwithoutfn/:id",
  getsumfacturebyfournisseurwithoutfn
); // Route pour récupérer le total des factures d'un fournisseur sans fiche Navette

router.put("/facturevalider/:id", updatefacturevalider); // Route pour mettre à jour le statut de validation d'une facture par ID

router.get("/checkfacturecreation", checkFAcreation); // Route pour mettre à jour le statut de validation d'une facture par ID

module.exports = router; // Exportation du routeur pour être utilisé dans d'autres fichiers
