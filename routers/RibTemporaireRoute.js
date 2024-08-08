const express = require("express");
const {
  getRibCount,
  getRibs,
  createRibs,
} = require("../controllers/RibTemporaire");

const router = express.Router();

router.get("/ribtempo", getRibCount, getRibs);
router.post("/ribtempo", createRibs);
router.get("/count", getRibCount);

module.exports = router;
