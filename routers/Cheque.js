const express = require("express");
const { createcheque, getChequeCount, getCheque, getOneChequeById, updateCheque } = require("../controllers/PaiementCheque");

const router = express.Router();
 router.post("/cheque", createcheque);
router.get("/cheque", getChequeCount, getCheque);
 router.get("/cheque/:id", getOneChequeById);
 router.put("/cheque/:id", updateCheque);

module.exports = router;
