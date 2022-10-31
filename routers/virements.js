const express = require("express");
const { createVirements, getVirements } = require("../controllers/virements");

const router = express.Router();
router.post("/virements", createVirements);
router.get("/virements", getVirements);

module.exports = router;
