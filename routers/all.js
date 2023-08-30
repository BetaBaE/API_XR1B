const express = require("express");
const { getallCount, getall, getallCountechu, getallechu, getallCountexport } = require("../controllers/All");


const router = express.Router();
router.get("/all", getallCount, getall);

router.get("/allechu", getallCountechu, getallechu);



router.get("/allcountexport", getallCountexport);
module.exports = router;
