const express = require("express");
const {
  getPaiementByMonth,
  getPaiementByMonthDetailFournisseur,
  getPaiementByMonthDetailBank,
  getChequeDetail,
} = require("../controllers/charts/atnerPaiements");

const router = express.Router();

router.get("/atnerpaiements", getPaiementByMonth);
router.get("/chequedetail", getChequeDetail);
router.get(
  "/atnerpaiementsfournisseur/:id",
  getPaiementByMonthDetailFournisseur
);
router.get("/atnerpaiementsmois/:id", getPaiementByMonthDetailBank);
module.exports = router;
