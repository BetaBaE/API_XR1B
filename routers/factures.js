const express = require("express");
const {
  getFacturesCount,
  getFactures,
  getFacturesById,
  getAllFactures,
  getfacturebyfournisseurid,
} = require("../controllers/factures");

const router = express.Router();
router.get("/factures", getFacturesCount, getFactures);
router.get("/factures/:id", getFacturesById);
router.get("/allfactures", getFacturesCount, getAllFactures);
router.get("/getfacturebyfournisseurid/:id", getfacturebyfournisseurid);

module.exports = router;
