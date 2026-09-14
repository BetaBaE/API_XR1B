const express = require("express");
const {
  getchefferDAffaireByFou,
  getFAStateForByFournisseur,
  getRestitiByFou,
  getDonneeFournissuerByNom,
  getstatueRIBByFou,
  getAttsFourByNom,
  getPaiementByMonthFournisseur,
  getPaiementDetailByMonthFournisseur,
  getSoldeFournisseur,
} = require("../controllers/StFournisseur");

const router = express.Router();

router.get("/chefferdaffaire", getchefferDAffaireByFou);
router.get("/fastatebyFournisseur", getFAStateForByFournisseur);
router.get("/restitbyFournisseur", getRestitiByFou);
router.get("/ribfournisseur", getstatueRIBByFou);
router.get("/datafournisseur", getDonneeFournissuerByNom);
router.get("/attsfiscle", getAttsFourByNom);
router.get("/paiementbymonthfournisseur", getPaiementByMonthFournisseur);
router.get(
  "/paiementdetailbyfournisseur",
  getPaiementDetailByMonthFournisseur
);
router.get("/soldefournisseur", getSoldeFournisseur);

module.exports = router;
