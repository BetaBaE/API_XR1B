const express = require("express");
const { createfacture, getFactureCount, getFacture, getfactureresById, updatenavette, getficheNavetteByfournisseur, getavanceByfournisseur, getsumavancebyfournisseurwithfn } = require("../controllers/FactureFicheNavette");


const router = express.Router();

router.post("/factureRech", createfacture);
router.get("/factureRech/:id", getfactureresById);
router.put("/factureRech/:id", updatenavette);
router.get("/factureRech", getFactureCount, getFacture);

router.get("/getficheNavettebyfournisseur/:id", getficheNavetteByfournisseur);




router.get("/getavancebyfournisseur/:idfournisseur", getavanceByfournisseur);





router.get("/getsumavancebyfournisseur/:id",getsumavancebyfournisseurwithfn);





module.exports = router;