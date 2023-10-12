const express = require("express");
const { createEspece, getEspeceCount, getEspece} = require("../controllers/PaiementEspece");

const router = express.Router();
router.post("/espece", createEspece);
router.get("/espece", getEspeceCount, getEspece);



module.exports = router;
