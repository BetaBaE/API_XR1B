const express = require("express");
const {
  getDesignationCount,
  getDesignation,
  getOneDesignationsById,
  updateDesignations,
  createDesignations,
} = require("../controllers/Designations");

const router = express.Router();

router.post("/designations", createDesignations);
router.get("/designations", getDesignationCount, getDesignation);
router.get("/designations/:id", getOneDesignationsById);
router.put("/designations/:id", updateDesignations);

module.exports = router;
