const express = require("express");
const {
  getFournissuers,
  getFournisseursCount,
  getAllFournissuers,
  getRibsFournisseurValid,
  FournisseursRibValid,
} = require("../controllers/fournisseurs");
const router = express.Router();

router.get("/fournisseurs", getFournisseursCount, getFournissuers);
router.get("/allfournisseurs", getFournisseursCount, getAllFournissuers);
router.get("/fournisseursribvalid", getFournisseursCount, FournisseursRibValid);
router.get(
  "/allfournisseursvalid",
  getFournisseursCount,
  getRibsFournisseurValid
);

// router.get("/fournisseurs/count", getFournisseursCount);

module.exports = router;
