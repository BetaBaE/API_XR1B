const express = require("express");
const { getallCount, getall, getallCountechu, getallechu } = require("../controllers/All");


const router = express.Router();
router.get("/all", getallCount, getall);

router.get("/allechu", getallCountechu, getallechu);

module.exports = router;
