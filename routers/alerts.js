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
  GetFA_BCsameBC,
  GetFA_BCsameBCCount,
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
router.get("/fabcsamebc", GetFA_BCsameBCCount, GetFA_BCsameBC);

module.exports = router;
