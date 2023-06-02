const express = require("express");
const {
    createVirements,
    getVirements,
    getVirementCount,
    getOneVirementById,
    updateVirmeents,
} = require("../controllers/AvanceVirement");

const router = express.Router();
router.post("/VirementAvance", createVirements);
router.get("/VirementAvance", getVirementCount, getVirements);
router.get("/VirementAvance/:id", getOneVirementById);
router.put("/VirementAvance/:id", updateVirmeents);

module.exports = router;