const express = require("express");
const {
    createVirements,
    getVirements,
    getVirementCount,
    getOneVirementById,
    updateVirmeents,
} = require("../controllers/Avanceespece");

const router = express.Router();
router.post("/AvanceEspece", createVirements);
router.get("/AvanceEspece", getVirementCount, getVirements);
router.get("/AvanceEspece/:id", getOneVirementById);
router.put("/AvanceEspece/:id", updateVirmeents);

module.exports = router;