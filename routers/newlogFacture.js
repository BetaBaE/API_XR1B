const express = require("express");
const {
  GetFactureDetails,
  GetFactureDetailsCount,
  GetAvanceDetails,
  GetAvanceDetailsCount,
  GetOneAvanceDetails,
} = require("../controllers/newlogFacture");

const router = express.Router();

router.get("/getfacturedetails", GetFactureDetailsCount, GetFactureDetails);
router.get("/getavancedetails", GetAvanceDetailsCount, GetAvanceDetails);
router.get("/getavancedetails/:id", GetOneAvanceDetails);

module.exports = router;
