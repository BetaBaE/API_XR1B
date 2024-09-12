const express = require("express");
const {
  GetFactureDetails,
  GetFactureDetailsCount,
  GetAvanceDetails,
  GetAvanceDetailsCount,
} = require("../controllers/newlogFacture");

const router = express.Router();

router.get("/getfacturedetails", GetFactureDetailsCount, GetFactureDetails);
router.get("/getavancedetails", GetAvanceDetailsCount, GetAvanceDetails);

module.exports = router;
