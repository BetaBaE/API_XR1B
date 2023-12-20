const express = require("express");
const {
  getFacturesCount,
  getFactures,
  getFacturesById,
  getAllFactures,
  getfacturebyfournisseurid,
  createfacture,
  updateFacture,
} = require("../controllers/factures");

const router = express.Router();
router.get("/factures", getFacturesCount, getFactures);
router.get("/factures/:id", getFacturesById);
router.get("/allfactures", getFacturesCount, getAllFactures);
router.post("/factures", createfacture);
router.put("/factures", updateFacture);

router.get("/getfacturebyfournisseurid/:id", getfacturebyfournisseurid);

module.exports = router;
