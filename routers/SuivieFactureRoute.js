const express = require("express");
const { getSuivieFactureCount, getSuivieFacture, getSuivieFactureCountEchu, getSuivieFactureEchu, getallCountexport } = require("../controllers/SuivieFacture");


const router = express.Router();
router.get("/SuivieFacture", getSuivieFactureCount, getSuivieFacture);

 router.get("/SuivieFactureEchu", getSuivieFactureCountEchu, getSuivieFactureEchu);



 router.get("/allcountexport", getallCountexport);
module.exports = router;
