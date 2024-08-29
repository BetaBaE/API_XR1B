const express = require("express");
const {
  getAlertAttestationRegFiscCount,
  getAlertAttestationRegFisc,
} = require("../controllers/Alerts");

const router = express.Router();

router.get(
  "/alertattestationregfisc",
  getAlertAttestationRegFiscCount,
  getAlertAttestationRegFisc
);

module.exports = router;
