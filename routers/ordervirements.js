const express = require("express");
const {
  createOrderVirements,
  getOrderCount,
  getorderVirements,
  getOneOrderById,
  updateOrderVirements,
  orderVirementsEnCours,
  PrintOrderVirement,
  orderVirementsEtat,
  getfacturebyordervirement,
} = require("../controllers/ordervirement");
const router = express.Router();


router.post("/ordervirement", createOrderVirements);
router.get("/ordervirement", getOrderCount, getorderVirements);
router.get("/ordervirement/:id", getOneOrderById);
router.put("/ordervirement/:id", updateOrderVirements);
router.get("/ordervirementencours", getOrderCount, orderVirementsEnCours);
router.get("/ordervirementetat", getOrderCount, orderVirementsEtat);

router.get("/oneordervirement/", PrintOrderVirement);
router.get("/ordervirementbyfacture/:id", getfacturebyordervirement);
module.exports = router;
