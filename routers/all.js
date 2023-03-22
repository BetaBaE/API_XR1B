const express = require("express");
const { getallCount, getall } = require("../controllers/All");


const router = express.Router();
router.get("/all", getallCount, getall);



module.exports = router;
