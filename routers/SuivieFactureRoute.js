const express = require("express");
const { getSuivieFactureCount, getSuivieFacture, getSuivieFactureCountEchu, getSuivieFactureEchu, getallCountexport, getSuivieFactureNonPayeCount, getSuivieFactureNonPayé, getAnneeFacture } = require("../controllers/SuivieFacture");


const router = express.Router();
router.get("/SuivieFacture", getSuivieFactureCount, getSuivieFacture);

 router.get("/SuivieFactureEchu", getSuivieFactureCountEchu, getSuivieFactureEchu);

 router.get("/FactureNonPaye", getSuivieFactureNonPayeCount, getSuivieFactureNonPayé);


 router.get("/allcountexport", getallCountexport);

router.get("/getAnneeSuivieFacture", getAnneeFacture)
 module.exports = router;
