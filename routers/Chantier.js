const express = require("express");
const {
  getChantierCount,
  getChantiers,
  getchantierbyfactureid,
  getchantierbyBoncommande,
  getAllChantiers,
} = require("../controllers/Chantier");

const router = express.Router();
router.get("/chantier", getChantierCount, getAllChantiers);

router.get("/getchantierbyfactureid/:id", getchantierbyfactureid);

router.get("/getchantierbyBonCommande/:Boncommande", getchantierbyBoncommande);

module.exports = router;
