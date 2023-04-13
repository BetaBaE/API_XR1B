const express = require("express");
const { createVirements, getVirementCount, getVirements, getOneVirementById, updateVirmeents } = require("../controllers/PaiementEspece");

const router = express.Router();
router.post("/espece", createVirements);
router.get("/espece", getVirementCount, getVirements);
router.get("/espece/:id", getOneVirementById);
router.put("/espece/:id", updateVirmeents);

module.exports = router;
