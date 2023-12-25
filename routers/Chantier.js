const express = require("express");
const { getChantierCount, getChantiers, getchantierbyfactureid,getchantierbyBoncommande } = require("../controllers/Chantier");

const router = express.Router();
router.get("/Chantier", getChantierCount, getChantiers);

router.get("/getchantierbyfactureid/:id", getchantierbyfactureid);

router.get("/getchantierbyBonCommande/:Boncommande", getchantierbyBoncommande);


module.exports = router;