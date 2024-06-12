const express = require("express");
const { getAttestationCount, getAttestation, create } = require("../controllers/Attestation");



const router = express.Router();
router.get("/Attestaion", getAttestationCount, getAttestation);
router.post("/Attestaion", create);

// router.get("/getEcheanceLoibyfournisseur/:idfournisseur",getEcheanceLoibyfournisseur);


module.exports = router;