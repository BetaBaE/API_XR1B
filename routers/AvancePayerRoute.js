const express = require("express");

const {
  getAvancePayer,
  getAvancePayerCount,
} = require("../controllers/AvancePayer");
const router = express.Router();

router.get("/logfactures", getAvancePayerCount, getAvancePayer);

module.exports = router;
