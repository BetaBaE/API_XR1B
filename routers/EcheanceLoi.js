const express = require("express");
const { getEcheanceLoiCount, getEcheanceLoi, create, getEcheanceLoibyfournisseur } = require("../controllers/EcheanceLoi");



const router = express.Router();
router.get("/EcheanceLoi", getEcheanceLoiCount, getEcheanceLoi);
router.post("/EcheanceLoi", create);

router.get("/getEcheanceLoibyfournisseur/:idfournisseur",getEcheanceLoibyfournisseur);


module.exports = router;