const express = require("express");
const {
  getPaiementByMonth,
  getPaiementByMonthDetailFournisseur,
  getPaiementByMonthDetailBank,
} = require("../controllers/charts/atnerPaiements");

const router = express.Router();

router.get("/atnerpaiements", getPaiementByMonth);
router.get(
  "/atnerpaiementsfournisseur/:id",
  getPaiementByMonthDetailFournisseur
);
router.get("/atnerpaiementsmois/:id", getPaiementByMonthDetailBank);
module.exports = router;
