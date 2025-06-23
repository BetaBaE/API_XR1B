const express = require("express");
const {
  getFactureDeviseCount,
  createFactureDevise,
  updateFactureDevise,
  getOneFactureDevise,

  getFacturesDevise,
  getFacturesByDossier,
} = require("../controllers/factureDevise");

const router = express.Router();

router.get("/facturedevise", getFactureDeviseCount, getFacturesDevise);
router.post("/facturedevise", createFactureDevise);
router.put("/facturedevise/:id", updateFactureDevise);
router.get("/facturedevise/:id", getOneFactureDevise);
router.get("/facturedevise/dossier/:idDossier", getFacturesByDossier);

module.exports = router;
