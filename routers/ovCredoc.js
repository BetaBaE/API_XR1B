// OVCredocRoute.js
const express = require("express");
const {
  getOVCredocs,
  getOVCredocCount,
  createOVCredoc,
  updateOVCredoc,
  getOneOVCredoc,
  getValidOVCredocs,
} = require("../controllers/ovCredoc");
const router = express.Router();

// GET all Credoc payment orders with count (for pagination)
router.get("/ovcredoc", getOVCredocCount, getOVCredocs);
router.post("/ovcredoc", createOVCredoc);
router.put("/ovcredoc/:id", updateOVCredoc);
router.get("/ovcredoc/:id", getOneOVCredoc);
router.get("/ovcredocValid", getValidOVCredocs);

module.exports = router;
