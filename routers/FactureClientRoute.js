const express = require("express");
const {
  getFactureClientCount,
  getFactureClient,
  getFactureClientById,
  createFactureClient,
  updateFactureClient,
  getCautionsDisponiblesByMarche,
} = require("../controllers/FactureClient");
const { requireSignin } = require("../controllers/auth");

const router = express.Router();

router.get("/factureclient", getFactureClientCount, getFactureClient);
router.get(
  "/factureclient/cautions-disponibles/:idMarche",
  getCautionsDisponiblesByMarche
);
router.get("/factureclient/:id", getFactureClientById);
router.post("/factureclient", requireSignin, createFactureClient);
router.put("/factureclient/:id", requireSignin, updateFactureClient);

module.exports = router;
