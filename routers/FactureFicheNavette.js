const express = require("express");
const { createfacture, getFactureCount, getFacture, getfactureresById, updatenavette } = require("../controllers/FactureFicheNavette");


const router = express.Router();

router.post("/factureRech", createfacture);
router.get("/factureRech/:id", getfactureresById);
router.put("/factureRech/:id", updatenavette);
router.get("/factureRech", getFactureCount, getFacture);
module.exports = router;