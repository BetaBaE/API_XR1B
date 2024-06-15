const express = require("express");

const {
  getFournissuers,
  getFournisseursCount,
  getAllFournissuers,
  getRibsFournisseurValid,
  FournisseursRibValid,
  createFournisseurs,
  getfournisseurById,
  updatefournisseur,
  getfournisseurwithecheance,
  getNomfournisseur,
  getAllFournissuersClean,
} = require("../controllers/fournisseurs");
const router = express.Router();
router.get("/fournisseurs", getFournisseursCount, getFournissuers);
router.get("/allfournisseurs", getFournisseursCount, getAllFournissuers);
router.post("/fournisseurs", createFournisseurs);
router.get("/fournisseursribvalid", getFournisseursCount, FournisseursRibValid);
router.get(
  "/allfournisseursvalid",
  getFournisseursCount,
  getRibsFournisseurValid
);
router.get("/fournisseurs/:id", getfournisseurById);
router.put("/fournisseurs/:id", updatefournisseur);

router.get("/fournisseurswithecheanceLoi", getfournisseurwithecheance);

router.post("/getNomfournisseur", getNomfournisseur);


router.get("/getAllFournissuersClean", getFournisseursCount, getAllFournissuersClean);
module.exports = router;
