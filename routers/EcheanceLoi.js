const express = require("express");
const { getEcheanceLoiCount, getEcheanceLoi, create } = require("../controllers/EcheanceLoi");
const { getEcheanceReelbyfournisseur } = require("../controllers/EcheanceReel");


const router = express.Router();
router.get("/EcheanceLoi", getEcheanceLoiCount, getEcheanceLoi);
router.post("/EcheanceLoi", create);

router.get("/getEcheanceLoibyfournisseur/:idfournisseur",getEcheanceReelbyfournisseur);


module.exports = router;