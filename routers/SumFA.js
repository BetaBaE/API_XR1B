const express = require("express");
const {
  getChartSumFA,
  getTableSumFA,
  getSituationFournisseur,
  getFacturebyFournisseur,
} = require("../controllers/charts/sumFA");

const router = express.Router();

router.get("/chartsumfa", getChartSumFA);
router.get("/tablesumfa", getTableSumFA);
router.get("/situationfournisseurs", getSituationFournisseur);
router.get("/facturebyfour/:id", getFacturebyFournisseur);

module.exports = router;
