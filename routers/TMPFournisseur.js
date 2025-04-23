const express = require("express");
const {
  getTMPFournisseursCount,
  getTMPFournissuers,
  createTMPFournisseurs,
  getTMPfournisseurById,
  updateTMPfournisseur,
} = require("../controllers/TmpFournisseur");

const router = express.Router();

router.post("/tmpfournisseurs", createTMPFournisseurs);
router.get("/tmpfournisseurs", getTMPFournisseursCount, getTMPFournissuers);
router.get("/tmpfournisseurs/:id", getTMPfournisseurById);
router.put("/tmpfournisseurs/:id", updateTMPfournisseur);

module.exports = router;
