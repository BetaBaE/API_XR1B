const express = require("express");
const {
  getRibFCount,
  getRibsFournisseurs,
} = require("../controllers/ribFournisseurs");

const router = express.Router();

router.get("/ribfournisseurs", getRibFCount, getRibsFournisseurs);
// router.get("/fournisseurs/count", getFournisseursCount);

module.exports = router;
