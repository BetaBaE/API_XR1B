const express = require("express");
const {
  createAvances,
  getAllAvances,
  getAvanceById,
  getAvanceCount,
  updateAvances,
} = require("../controllers/avance");

const router = express.Router();
router.post("/Avance", createAvances);
router.get("/Avance", getAvanceCount, getAllAvances);
router.get("/Avance/:id", getAvanceById);
router.put("/Avance/:id", updateAvances);

module.exports = router;
