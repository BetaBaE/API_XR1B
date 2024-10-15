const express = require("express");
const {
  getAlertAttestationRegFiscCount,
  getAlertAttestationRegFisc,
  getRasTva,
  getRasTvaFilter,
  getFactureAyantFNSage,
  getFactureAyantFNSageCount,
} = require("../controllers/alerts");

const router = express.Router();

router.get(
  "/alertattestationregfisc",
  getAlertAttestationRegFiscCount,
  getAlertAttestationRegFisc
);
router.get("/rastva", getRasTva);
router.get("/rastvafilter", getRasTvaFilter);
router.get("/faayantfn", getFactureAyantFNSageCount, getFactureAyantFNSage);

module.exports = router;
