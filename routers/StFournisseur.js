const express = require("express");
const { getchefferDAffaireByFou } = require("../controllers/StFournisseur");

const router = express.Router();

router.get("/chefferdaffaire", getchefferDAffaireByFou);

module.exports = router;
