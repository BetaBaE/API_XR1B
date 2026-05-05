const express = require("express");
const {
  getMarcheCount,
  getMarche,
  getMarcheById,
  createMarche,
  updateMarche,
} = require("../controllers/Marche");
const { requireSignin } = require("../controllers/Auth");

const router = express.Router();

router.get("/marche", getMarcheCount, getMarche);
router.get("/marche/:id", getMarcheById);
router.post("/marche", requireSignin, createMarche);
router.put("/marche/:id", requireSignin, updateMarche);

module.exports = router;
