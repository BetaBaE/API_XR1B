const express = require("express");
const {
  createOrderVirementsFond,
  getOrderCountFond,
  getorderVirementsFond,
  getOneOrderByIdFond,
  updateOrderVirementsFond,
  orderVirementsEnCoursFond,

  orderVirementsEtatFond,
  PrintOrderVirementFond,
} = require("../controllers/OrdervirementFond");
const router = express.Router();

router.post("/ordervirementFond", createOrderVirementsFond);
router.get("/ordervirementFond", getOrderCountFond, getorderVirementsFond);
router.get("/ordervirementFond/:id", getOneOrderByIdFond);
router.put("/ordervirementFond/:id", updateOrderVirementsFond);
router.get(
  "/ordervirementencoursFond",
  getOrderCountFond,
  orderVirementsEnCoursFond
);
router.get("/ordervirementFondetat", getOrderCountFond, orderVirementsEtatFond);

router.get("/oneordervirementFond/", PrintOrderVirementFond);

module.exports = router;
