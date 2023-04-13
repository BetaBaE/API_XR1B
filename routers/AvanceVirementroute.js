const express = require("express");
const {
    createVirements,
    getVirements,
    getVirementCount,
    getOneVirementById,
    updateVirmeents,
} = require("../controllers/AvanceVirement");

const router = express.Router();
router.post("/AvanceVirement", createVirements);
router.get("/AvanceVirement", getVirementCount, getVirements);
router.get("/AvanceVirement/:id", getOneVirementById);
router.put("/AvanceVirement/:id", updateVirmeents);

module.exports = router;