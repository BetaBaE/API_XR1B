const express = require("express");
const router = express.Router();
const {
  CreateAvance,
  getAvanceCount,
  getAvance,
  getfactureresById,
  RestitutionAvance,
  getficheNavetteByfournisseur,
  getavancebyfournisseurNonRestituer,
  getsumavancebyfournisseurwithfn,
  correction,
  annulation,
  getBonLivraisonByFactureId,
  getAvanceRestitById,
  getgetAvanceDétailRestitCount,
  getAvanceDétailRestit,
  getAvanceDétailRestitCount,
  getAvanceForUpdateCount,
  getAvanceForUpdate,
  getAvanceForUpdateByid,
  UpdateorAnnulerAvance,
  getAvanceNonRestitByFournisseur,
} = require("../controllers/Avance");

const { GetPourcentageTVA } = require("../controllers/DesignationFacture");
const {
  RestitFactureMontantExcte,
  MontantAvanceAndFactureByFournisseur,
  MontantAvanceNonRestitueByFournisseur,
} = require("../controllers/charts/aideRestitAvance");

router.post("/AvanceForupdate", CreateAvance);
router.get("/Avance/:id", getAvanceRestitById);
router.put("/Avance/:id", RestitutionAvance);
router.get("/Avance", getAvanceCount, getAvance);
router.get("/getficheNavettebyfournisseur/:id", getficheNavetteByfournisseur);
router.get(
  "/getavancebyfournisseurNonRestituer/:idfournisseur",
  getavancebyfournisseurNonRestituer
);
router.get("/getsumavancebyfournisseur/:id", getsumavancebyfournisseurwithfn);

router.get(
  "/getAvanceDetailRestit",
  getAvanceDétailRestitCount,
  getAvanceDétailRestit
);

router.get("/AvanceForupdate", getAvanceForUpdateCount, getAvanceForUpdate);

router.get("/AvanceForupdate/:id", getAvanceForUpdateByid);

router.put("/AvanceForupdate/:id", UpdateorAnnulerAvance);

router.get("/getPourcentageTva", GetPourcentageTVA);
router.get("/getAvanceNonRestit/:id", getAvanceNonRestitByFournisseur);
/** Aide Restit */
router.get("/restitfacturemontantrxcte", RestitFactureMontantExcte);
router.get(
  "/montantavanceandfacturebyfournisseur",
  MontantAvanceAndFactureByFournisseur
);
router.get(
  "/montantavancenonrestituebyfournisseur",
  MontantAvanceNonRestitueByFournisseur
);

module.exports = router;
