const express = require("express");
const {
  getFactureDeviseCount,
  createFactureDevise,
  updateFactureDevise,
  getOneFactureDevise,
  getFacturesDevise,
} = require("../controllers/factureDevise");
const router = express.Router();

// Main
router.get("/facturesinternational", getFactureDeviseCount, getFacturesDevise);
router.post("/facturesinternational", createFactureDevise);
router.put("/facturesinternational/:id", updateFactureDevise);
router.get("/facturesinternational/:id", getOneFactureDevise);

module.exports = router;
