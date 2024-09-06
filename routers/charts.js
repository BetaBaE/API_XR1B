const express = require("express");

const {
  getOverdueInvoicesr,
} = require("../controllers/charts/overdueInvoicesQuery");
const {
  getSumFournisseur,
  getSumChantier,
} = require("../controllers/charts/sumFournisseur");

const router = express.Router();

router.get("/overdueInvoices", getOverdueInvoicesr);
router.get("/sumfournisseur", getSumFournisseur);
router.get("/sumchantier", getSumChantier);

module.exports = router;
