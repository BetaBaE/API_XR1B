const express = require("express");
const {
  getEcheanceCount,
  getEcheances,
  getEcheanceByFouId,
  createEcheance,
  updateEcheance,
  getEcheanceById,
} = require("../controllers/EcheanceFournisseur");

const router = express.Router();

router.get("/echeancefournisseur", getEcheanceCount, getEcheances);
router.get("/echeancefournisseur/:id", getEcheanceById);
router.get("/echeancebyfournisseur/:id", getEcheanceByFouId);
router.post("/echeancefournisseur", createEcheance);
router.put("/echeancefournisseur/:id", updateEcheance);
module.exports = router;
