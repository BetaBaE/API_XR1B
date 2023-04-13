const express = require("express");
const {
    createVirements,
    getVirements,
    getVirementCount,
    getOneVirementById,
    updateVirmeents,
} = require("../controllers/Avancecheque");

const router = express.Router();
router.post("/AvanceCheque", createVirements);
router.get("/AvanceCheque", getVirementCount, getVirements);
router.get("/AvanceCheque/:id", getOneVirementById);
router.put("/AvanceCheque/:id", updateVirmeents);

module.exports = router;