const express = require("express");
const router = express.Router();
const { CreateFicheNavetteAvance, getFactureCount, getAvance, getfactureresById, RestitutionAvance, getficheNavetteByfournisseur, getavanceByfournisseur, getsumavancebyfournisseurwithfn, correction, annulation, getBonLivraisonByFactureId, getAvanceRestitById } = require("../controllers/Avance");

router.post("/Avance", CreateFicheNavetteAvance);
router.get("/Avance/:id", getAvanceRestitById);
router.put("/Avance/:id", RestitutionAvance);
router.get("/Avance", getFactureCount, getAvance);
router.get("/getficheNavettebyfournisseur/:id", getficheNavetteByfournisseur);
router.get("/getavancebyfournisseur/:idfournisseur", getavanceByfournisseur);
router.get("/getsumavancebyfournisseur/:id",getsumavancebyfournisseurwithfn);
// router.get("/ModificationFichnavette", getFactureCount, getFacture);
router.get("/ModificationFichnavette/:id", getfactureresById);
router.put("/ModificationFichnavette/:id", correction);
router.patch("/AnnulationFn", annulation);

// router.get('/getRestitByid/:id',getAvanceRestitById );


router.get('/FicheNavette/:factureId/BonLivraison', getBonLivraisonByFactureId);
module.exports = router;