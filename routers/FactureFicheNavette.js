const express = require("express");
const { createfacture, getFactureCount, getFacture, getfactureresById, updatenavette, getficheNavetteByfournisseur, getavanceByfournisseur, getsumavancebyfournisseurwithfn, correction, annulation, getBonLivraisonByFactureId } = require("../controllers/FactureFicheNavette");
const router = express.Router();
router.post("/factureRech", createfacture);
router.get("/factureRech/:id", getfactureresById);
router.put("/factureRech/:id", updatenavette);
router.get("/factureRech", getFactureCount, getFacture);
router.get("/getficheNavettebyfournisseur/:id", getficheNavetteByfournisseur);
router.get("/getavancebyfournisseur/:idfournisseur", getavanceByfournisseur);
router.get("/getsumavancebyfournisseur/:id",getsumavancebyfournisseurwithfn);
router.get("/ModificationFichnavette", getFactureCount, getFacture);
router.get("/ModificationFichnavette/:id", getfactureresById);
router.put("/ModificationFichnavette/:id", correction);
router.patch("/AnnulationFn", annulation);




router.get('/factureRech/:factureId/BonLivraison', getBonLivraisonByFactureId);
module.exports = router;