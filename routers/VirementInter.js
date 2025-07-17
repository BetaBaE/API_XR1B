const express = require("express");
const {
  createVirementInter,
  getVirementsInter,
  getVirementInterCount,
  getOneVirementInterById,
  updateVirementInter,
  CheckedFournisseurDejaExisteInter,
} = require("../controllers/VirementInte");

const router = express.Router();

router.post("/virements-inter", createVirementInter);
router.get("/virements-inter", getVirementInterCount, getVirementsInter);
router.get("/virements-inter/:id", getOneVirementInterById);
router.put("/virements-inter/:id", updateVirementInter);

router.get(
  "/CheckedFournisseurDejaExisteInter/:ribFournisseurId",
  CheckedFournisseurDejaExisteInter
);

module.exports = router;
