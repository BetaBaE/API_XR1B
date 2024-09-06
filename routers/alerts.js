const express = require("express");
const {
  getAlertAttestationRegFiscCount,
  getAlertAttestationRegFisc,
  getRasTva,
  getRasTvaFilter,
} = require("../controllers/alerts");

const router = express.Router();

router.get(
  "/alertattestationregfisc",
  getAlertAttestationRegFiscCount,
  getAlertAttestationRegFisc
);
router.get("/rastva", getRasTva);
router.get("/rastvafilter", getRasTvaFilter);

module.exports = router;
