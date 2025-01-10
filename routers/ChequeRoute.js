const express = require("express");
const {
  createcheque,
  getChequeCount,
  getCheque,
  getOneChequeById,
  updateCheque,
  getChequeEncours,
  PrintCheque,
} = require("../controllers/Cheque");

const router = express.Router();
router.post("/cheque", createcheque);
router.get("/cheque", getChequeCount, getCheque);
router.get("/cheque/:id", getOneChequeById);
router.put("/cheque/:id", updateCheque);

/**
 * Printing Cheque
 */

router.get("/chequeencours", getChequeEncours);
router.get("/chequeprint", PrintCheque);

module.exports = router;
