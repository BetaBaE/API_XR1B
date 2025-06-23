const express = require("express");
const {
  getAlertAttestationRegFiscCount,
  getAlertAttestationRegFisc,
  getRasTva,
  getRasTvaFilter,
  getFactureAyantFNSage,
  getFactureAyantFNSageCount,
  getFournisseurFA_AV,
  GetPreparationPaiementCount,
  GetPreparationPaiement,
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
router.get("/getfourfaav", getFournisseurFA_AV);
router.get(
  "/preparationpaiement",
  GetPreparationPaiementCount,
  GetPreparationPaiement
);

module.exports = router;
