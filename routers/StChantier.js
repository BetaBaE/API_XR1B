const express = require("express");
const {
  getClotureDataByChantier,
  getFactureSummaryByChantierAndMonth,
  getChantierDetailFournisser,
  getDetailMoisFournisseurForChantier,
} = require("../controllers/StChantier");

const router = express.Router();

router.get("/clotuerchantier", getClotureDataByChantier);
router.get("/facturesummary", getFactureSummaryByChantierAndMonth);
router.get("/chantierdetailfournisser", getChantierDetailFournisser);
router.get("/moisfournisseurforchantier", getDetailMoisFournisseurForChantier);

module.exports = router;
