const express = require("express");
const router = express.Router();
const {
  CreateFicheNavette,

  getDocById,
  UpdateorAnnuler,
  getFicheNavetteCount,
  getFicheNavette,
} = require("../controllers/FicheNavette");
router.post("/FicheNavette", CreateFicheNavette);
router.get("/FicheNavette", getFicheNavetteCount, getFicheNavette);
// router.get("/ModificationFichnavette", getDocCount, getDoc);
router.get("/FicheNavette/:id", getDocById);
router.put("/FicheNavette/:id", UpdateorAnnuler);
module.exports = router;
