const express = require("express");
const {
  getEcheanceReelCount,
  getEcheanceReel,
  create,
  getEcheanceReelbyfournisseur,
} = require("../controllers/EcheanceReel");

const router = express.Router();
router.get("/EcheanceReel", getEcheanceReelCount, getEcheanceReel);
router.post("/EcheanceReel", create);

router.get(
  "/getEcheanceReelbyfournisseur/:idfournisseur",
  getEcheanceReelbyfournisseur
);

module.exports = router;
