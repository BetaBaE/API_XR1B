const express = require("express");
const {
  getRibsAtner,
  getRibCountAtner,
  createRibsAtner,
  updateRibsAtner,
  getOneRibAtnerById,
  getRibAtnerValid,
} = require("../controllers/ribAtner");
const router = express.Router();

router.get("/ribatner", getRibCountAtner, getRibsAtner);
router.post("/ribatner", createRibsAtner);
router.put("/ribatner/:id", updateRibsAtner);
router.get("/ribatner/:id", getOneRibAtnerById);

router.get("/ribatnerValid/:id", getRibAtnerValid);
module.exports = router;
