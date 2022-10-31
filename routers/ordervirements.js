const express = require("express");
const {
  createOrderVirements,
  getOrderCount,
  getorderVirements,
  getOneOrderById,
  updateOrderVirements,
  orderVirementsEnCours,
} = require("../controllers/ordervirement");
const router = express.Router();

// router.get("/ordervirementcount", getOrderCountbyYear);
router.post("/ordervirement", createOrderVirements);
router.get("/ordervirement", getOrderCount, getorderVirements);
router.get("/ordervirement/:id", getOneOrderById);
router.put("/ordervirement/:id", updateOrderVirements);
router.get("/ordervirementencours", getOrderCount, orderVirementsEnCours);

module.exports = router;
