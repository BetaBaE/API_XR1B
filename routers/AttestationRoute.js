const express = require("express");
const { GetAttestationCount, GetAttestation,  CreateAttestation } = require("../controllers/Attestation");
const router = express.Router();
router.get("/Attestaion", GetAttestationCount, GetAttestation); // Affichage des fournisseur avec leurs Attestion   
router.post("/Attestaion", CreateAttestation); // Creation des Attestaions
module.exports = router;