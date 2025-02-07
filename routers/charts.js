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
  getCountFaSansFNbyMonth,
  DetailFaSansFnByMonth,
} = require("../controllers/charts/sumFournisseur");

const router = express.Router();

router.get("/overdueInvoices", getOverdueInvoicesr);
router.get("/sumfournisseur", getSumFournisseur);
router.get("/sumchantier", getSumChantier);
router.get("/summensuel", getSumMensuel);
router.get("/sumformonth/:id", getSumForMonth);
router.get("/effetecheance", getEffetEcheance);

router.get("/countfafansfnBymonth", getCountFaSansFNbyMonth);
router.get("/detailfasansfnbymonth/:id", DetailFaSansFnByMonth);

module.exports = router;
