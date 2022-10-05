const express = require("express");
const {
  getFournissuers,
  getFournisseursCount,
} = require("../controllers/fournisseurs");
const router = express.Router();

router.get("/fournisseurs", getFournisseursCount, getFournissuers);
// router.get("/fournisseurs/count", getFournisseursCount);

module.exports = router;
