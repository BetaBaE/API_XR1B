const express = require("express");

const {
  getOverdueInvoicesr,
} = require("../controllers/charts/overdueInvoicesQuery");
const {
  getSumFournisseur,
  getSumChantier,
  getSumMensuel,
  getSumForMonth,
  getEffetEcheance,
} = require("../controllers/charts/sumFournisseur");

const router = express.Router();

router.get("/overdueInvoices", getOverdueInvoicesr);
router.get("/sumfournisseur", getSumFournisseur);
router.get("/sumchantier", getSumChantier);
router.get("/summensuel", getSumMensuel);
router.get("/sumformonth/:id", getSumForMonth);
router.get("/effetecheance", getEffetEcheance);

module.exports = router;
