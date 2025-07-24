const express = require("express");
const {
  getUserCount,
  getUsers,
  createUsers,
  updateUsers,
  updatePassword,
  getOneUserById,
  getUserOne,
  signin,
  requireSignin,
  signout,
  updateProfile,
  resetUserPassword,
  resetPassword,
} = require("../controllers/Auth");

const router = express.Router();

// Public routes
router.post("/auth", signin);

// Protected routes
router.get("/users", getUserCount, getUsers);
router.post("/users", createUsers);
router.put("/users/:id", updateUsers);
router.put("/auth/change-password", requireSignin, updatePassword);
router.post("/auth/signout", requireSignin, signout);
router.get("/users/:id", getOneUserById);
router.put("/auth/update-profile", requireSignin, updateProfile);
router.put("/auth/reset-password", requireSignin, resetUserPassword);
router.put("/users/:id/reset-password", resetPassword);
router.get("/auth/check", requireSignin, (req, res) => {
  res.json({ valid: true });
});
router.param("id", getUserOne);

module.exports = router;
