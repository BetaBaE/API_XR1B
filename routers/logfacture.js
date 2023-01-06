const express = require("express");

const {
  getLogFactureCount,
  getLogFactures,
} = require("../controllers/logFarcture");
const router = express.Router();

router.get("/logfactures", getLogFactureCount, getLogFactures);

module.exports = router;
