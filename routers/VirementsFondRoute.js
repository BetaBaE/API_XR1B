const express = require("express");
const {
  createVirementsFond,
  getVirementsFond,
  getVirementFondCount,
  getOneVirementByIdFond,
  updateVirmeentsFond,
} = require("../controllers/VirementFond");

const router = express.Router();
router.post("/virementsFond", createVirementsFond);
router.get("/virementsFond", getVirementFondCount, getVirementsFond);
router.get("/virementsFond/:id", getOneVirementByIdFond);
router.put("/virementsFond/:id", updateVirmeentsFond);

// router.get("/CheckedFournisseurDejaExiste/:ribFournisseurId", CheckedFournisseurDejaExiste)
module.exports = router;
