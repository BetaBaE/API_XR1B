const express = require("express");
const {
  getRibFCount,
  getRibsFournisseurs,
  updateRibsFournisseurs,
  getOneRibfournisseurById,
  RibFournisseursValid,
} = require("../controllers/RibFournisseurs");

const router = express.Router();

router.get("/ribfournisseurs", getRibFCount, getRibsFournisseurs);
router.put("/ribfournisseurs/:id", updateRibsFournisseurs);
router.get("/ribfournisseurs/:id", getOneRibfournisseurById);
router.get("/ribfournisseursvalid", getRibFCount, RibFournisseursValid);

module.exports = router;
