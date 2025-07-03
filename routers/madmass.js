const express = require("express");
const router = express.Router();
const {
  // Transfers
  getAllTransfers,
  getTransferById,
  createTransfer,
  updateTransfer,
  deleteTransfer,

  // Beneficiaries
  getAllBeneficiaries,
  getBeneficiaryById,
  createBeneficiary,
  updateBeneficiary,
  deleteBeneficiary,

  // Transfer Items
  addToTransfer,
  removeFromTransfer,

  // File Generation
  generateMadFile,
  getBeneficiariesCount,
  getTransfersCount,
  getTransferItemsCount,
  getAllTransferItems,
  getBeneficiariesNotInTransfer,
  generateMadPdf,
} = require("../controllers/madmass");

// Mass Transfers CRUD
router.get("/transfers", getTransfersCount, getAllTransfers);
router.get("/transfers/:id", getTransferById);
router.post("/transfers", createTransfer);
router.put("/transfers/:id", updateTransfer);
// router.delete("/transfers/:id", deleteTransfer);

// Beneficiaries CRUD
router.get("/beneficiaries", getBeneficiariesCount, getAllBeneficiaries);
router.get("/beneficiaries/:id", getBeneficiaryById);
router.post("/beneficiaries", createBeneficiary);
router.put("/beneficiaries/:id", updateBeneficiary);
router.get("/beneficiaries/:id/not-in-transfer", getBeneficiariesNotInTransfer);
// router.delete("/beneficiaries/:id", deleteBeneficiary);

// Get Transfer Items
router.get("/transfersitems", getTransferItemsCount, getAllTransferItems);
router.post("/transfersitems", addToTransfer);

// Transfer Items
// router.delete(
//   "/transfers/:id/beneficiaries/:beneficiaryId",
//   removeFromTransfer
// );

// File Generation
router.get("/transfers/:id/generate", generateMadFile);
router.get("/transfers/:id/generate-pdf", generateMadPdf);

module.exports = router;
