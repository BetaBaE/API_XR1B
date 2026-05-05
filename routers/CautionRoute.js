const express = require("express");
const {
  getCautionCount,
  getCaution,
  getCautionById,
  createCaution,
  updateCaution,
} = require("../controllers/Caution");
const { requireSignin } = require("../controllers/Auth");

const router = express.Router();

router.get("/caution", getCautionCount, getCaution);
router.get("/caution/:id", getCautionById);
router.post("/caution", requireSignin, createCaution);
router.put("/caution/:id", requireSignin, updateCaution);

module.exports = router;
