const express = require("express");
const {
  getClotureDataByChantier,
  getFactureSummaryByChantierAndMonth,
} = require("../controllers/StChantier");

const router = express.Router();

router.get("/clotuerchantier", getClotureDataByChantier);
router.get("/facturesummary", getFactureSummaryByChantierAndMonth);

module.exports = router;
