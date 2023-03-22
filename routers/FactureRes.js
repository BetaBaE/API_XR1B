const express = require("express");
const { getdesignations, getdesignationbycode } = require("../controllers/designationFacture");


const { getFactureresCount, getfactureres, createfacture, getfactureresById, updatefactureRes, getfacturebyfournisseur, getfacturehistorique, getFacturehistoriqueCount, getfacturebyfournisseurpaiement, getFacturevaliderCount, getfacturevalider, updatefacturevalider } = require("../controllers/facturesResptionne");


const router = express.Router();
router.get("/facturesres",getFactureresCount ,getfactureres);
router.get("/facturesres/:id", getfactureresById);

router.post("/facturesres", createfacture);

router.put("/facturesres/:id", updatefactureRes);

router.get("/facturebyfournisseur/:nom", getfacturebyfournisseur);
router.get("/designation", getdesignations);
router.get("/designationbycode/:id", getdesignationbycode);
router.get("/historiquefacture", getFacturehistoriqueCount,getfacturehistorique);

router.get("/getfacturebyfournisseur/:id", getfacturebyfournisseurpaiement);


router.get("/facturevalider",getFacturevaliderCount ,getfacturevalider);

router.get("/facturevalider/:id", getfactureresById);


router.put("/facturevalider/:id", updatefacturevalider);
module.exports = router;