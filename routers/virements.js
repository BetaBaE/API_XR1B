const express = require("express");
const { update } = require("lodash");
const {
  createVirements,
  getVirements,
  getVirementCount,
  getOneVirementById,
  updateVirmeents,
} = require("../controllers/virements");

const router = express.Router();
router.post("/virements", createVirements);
router.get("/virements", getVirementCount, getVirements);
router.get("/virements/:id", getOneVirementById);
router.put("/virements/:id", updateVirmeents);

module.exports = router;
