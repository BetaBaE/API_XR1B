const express = require("express");
const { getDossierCount, getDossiers } = require("../controllers/Dossier");

const router = express.Router();

router.get("/dossier", getDossierCount, getDossiers);

module.exports = router;
