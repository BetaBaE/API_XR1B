const express = require("express");
const router = express.Router();
const { createfacture, getFactureCount, getFacture, getfactureresById, updatenavette, getficheNavetteByfournisseur, getavanceByfournisseur, getsumavancebyfournisseurwithfn, correction, annulation, getBonLivraisonByFactureId } = require("../controllers/FactureFicheNavette");

router.post("/FicheNavette", createfacture);
router.get("/FicheNavette/:id", getfactureresById);
router.put("/FicheNavette/:id", updatenavette);
router.get("/FicheNavette", getFactureCount, getFacture);
router.get("/getficheNavettebyfournisseur/:id", getficheNavetteByfournisseur);
router.get("/getavancebyfournisseur/:idfournisseur", getavanceByfournisseur);
router.get("/getsumavancebyfournisseur/:id",getsumavancebyfournisseurwithfn);
router.get("/ModificationFichnavette", getFactureCount, getFacture);
router.get("/ModificationFichnavette/:id", getfactureresById);
router.put("/ModificationFichnavette/:id", correction);
router.patch("/AnnulationFn", annulation);




router.get('/FicheNavette/:factureId/BonLivraison', getBonLivraisonByFactureId);
module.exports = router;