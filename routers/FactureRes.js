const express = require("express");

const {
  getdesignations,
  getdesignationbycode,
} = require("../controllers/designationFacture");

const {
  getfactureSaisieCount,
  getfactureSaisie,
  createfacture,
  getfactureSaisieById,
  updatefactureSaisie,
  getfacturebyfournisseur,
  getfacturehistorique,
  getFacturehistoriqueCount,
  getfacturebyfournisseurpaiement,
  getFacturevaliderCount,
  getfacturevalider,
  updatefacturevalider,
  getsumfacturebyfournisseurwithfn,
  getsumfacturebyfournisseurwithoutfn,
} = require("../controllers/facturesResptionne");

const router = express.Router();

router.get("/facturesSaisie", getfactureSaisieCount, getfactureSaisie);
router.get("/facturesSaisie/:id", getfactureSaisieById);

router.post("/facturesSaisie", createfacture);

router.put("/facturesSaisie/:id", updatefactureSaisie);

router.get("/facturebyfournisseur/:nom", getfacturebyfournisseur);
router.get("/designation", getdesignations);
router.get("/designationbycode/:id", getdesignationbycode);
router.get(
  "/historiquefacture",
  getFacturehistoriqueCount,
  getfacturehistorique
);

router.get("/getfacturebyfournisseur/:id", getfacturebyfournisseurpaiement);

router.get("/facturevalider", getFacturevaliderCount, getfacturevalider);

router.get("/facturevalider/:id", getfactureSaisieById);

router.get(
  "/getsumfacturebyfournisseurwithfn/:id",
  getsumfacturebyfournisseurwithfn
);

router.get(
  "/getsumfacturebyfournisseurwithoutfn/:id",
  getsumfacturebyfournisseurwithoutfn
);

router.put("/facturevalider/:id", updatefacturevalider);
module.exports = router;
