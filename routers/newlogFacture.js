const express = require("express");
const {
  GetFactureDetails,
  GetFactureDetailsCount,
} = require("../controllers/newlogFacture");

const router = express.Router();

router.get("/getfacturedetails", GetFactureDetailsCount, GetFactureDetails);

module.exports = router;
