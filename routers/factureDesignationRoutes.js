const express = require("express");
const { getAvailableYears, getByDesignation, getByChantier, getByFournisseur } = require("../controllers/factureDesignationController");
const router = express.Router();
// const {
//   getAvailableYears,
//   getByDesignation,
//   getByChantier,
//   getByFournisseur,
// } = require("../controllers/factureDesignationController");

// GET all available years
router.get("/facturedesignation/years", getAvailableYears);

// GET designations totals for a given year
router.get("/facturedesignation/:year", getByDesignation);

// GET chantier breakdown for a given year + codeDesignation
router.get("/facturedesignation/:year/:designationId/chantier", getByChantier);

// GET fournisseur breakdown for a given year + codeDesignation
router.get("/facturedesignation/:year/:designationId/fournisseur", getByFournisseur);

module.exports = router;
