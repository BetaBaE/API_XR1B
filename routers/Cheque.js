const express = require("express");
const { createcheque, getCheueCount, getCheque, getOneChequeById, updateCheque } = require("../controllers/PaiementCheque");

const router = express.Router();
router.post("/cheque", createcheque);
router.get("/cheque", getCheueCount, getCheque);
router.get("/cheque/:id", getOneChequeById);
router.put("/cheque/:id", updateCheque);

module.exports = router;
