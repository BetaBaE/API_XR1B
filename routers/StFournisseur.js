const express = require("express");
const {
  getchefferDAffaireByFou,
  getFAStateForByFournisseur,
  getRestitiByFou,
  getDonneeFournissuerByNom,
  getstatueRIBByFou,
  getAttsFourByNom,
} = require("../controllers/StFournisseur");

const router = express.Router();

router.get("/chefferdaffaire", getchefferDAffaireByFou);
router.get("/fastatebyFournisseur", getFAStateForByFournisseur);
router.get("/restitbyFournisseur", getRestitiByFou);
router.get("/ribfournisseur", getstatueRIBByFou);
router.get("/datafournisseur", getDonneeFournissuerByNom);
router.get("/attsfiscle", getAttsFourByNom);

module.exports = router;
