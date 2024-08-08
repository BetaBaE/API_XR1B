const express = require("express");
const {
  createVirements,
  getVirements,
  getVirementCount,
  getOneVirementById,
  updateVirmeents,
  CheckedFournisseurDejaExiste,
} = require("../controllers/Virements");

const router = express.Router();
router.post("/virements", createVirements);
router.get("/virements", getVirementCount, getVirements);
router.get("/virements/:id", getOneVirementById);
router.put("/virements/:id", updateVirmeents);

router.get(
  "/CheckedFournisseurDejaExiste/:ribFournisseurId",
  CheckedFournisseurDejaExiste
);
module.exports = router;
