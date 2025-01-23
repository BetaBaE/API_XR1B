const express = require("express");
const {
  getDesignationCount,
  getDesignation,
} = require("../controllers/Designations");

const router = express.Router();

router.get("/designations", getDesignationCount, getDesignation);

module.exports = router;
