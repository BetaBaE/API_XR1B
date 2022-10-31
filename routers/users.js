const express = require("express");
const {
  getUserCount,
  getUsers,
  createUsers,
  updateUsers,
  getOneUserById,
  getUserOne,
  signin,
} = require("../controllers/auth");

const router = express.Router();

router.get("/users", getUserCount, getUsers);
router.post("/users", createUsers);
router.put("/users/:id", updateUsers);
router.get("/users/:id", getOneUserById);

router.post("/auth", signin);

router.param("id", getUserOne);

module.exports = router;
