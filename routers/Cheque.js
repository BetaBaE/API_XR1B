const express = require("express");
const { createVirements, getVirementCount, getVirements, getOneVirementById, updateVirmeents } = require("../controllers/PaiementCheque");

const router = express.Router();
router.post("/cheque", createVirements);
router.get("/cheque", getVirementCount, getVirements);
router.get("/cheque/:id", getOneVirementById);
router.put("/cheque/:id", updateVirmeents);

module.exports = router;
