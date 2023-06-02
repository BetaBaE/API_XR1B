const express = require("express");
const { getChantierCount, getChantiers, getchantierbyfactureid } = require("../controllers/Chantier");

const router = express.Router();
router.get("/Chantier", getChantierCount, getChantiers);

router.get("/getchantierbyfactureid/:id", getchantierbyfactureid);

module.exports = router;