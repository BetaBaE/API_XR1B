const express = require("express");
const {
  getFacturesCount,
  getFactures,
  getFacturesById,
  getAllFactures,
} = require("../controllers/factures");

const router = express.Router();
router.get("/factures", getFacturesCount, getFactures);
router.get("/factures/:id", getFacturesById);
router.get("/allfactures", getFacturesCount, getAllFactures);

module.exports = router;
