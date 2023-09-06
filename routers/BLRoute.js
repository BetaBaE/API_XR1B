const express = require("express");
const {  getBlCount, getBonLivraison } = require("../controllers/BonLivraison");



const router = express.Router();
router.get("/BonLivraison", getBlCount, getBonLivraison);


module.exports = router;