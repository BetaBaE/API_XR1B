const express = require("express");
const {
  getDossierCount,
  getDossiers,
  createDossier,
  getDossierById,
  getDossierCountByYear,
  updateDossier,
  getFournisseurByIdDossier,
} = require("../controllers/Dossier");

const router = express.Router();

router.get("/dossier", getDossierCount, getDossiers);
router.post("/dossier", getDossierCountByYear, createDossier);
router.get("/dossier/:id", getDossierById);
router.put("/dossier/:id", updateDossier);

router.get("/fournissuerdossier/:id", getFournisseurByIdDossier);
module.exports = router;
