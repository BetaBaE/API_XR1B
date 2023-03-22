const express = require("express");
const { getChantierCount, getChantiers } = require("../controllers/Chantier");

const router = express.Router();
router.get("/Chantier", getChantierCount, getChantiers);

module.exports = router;