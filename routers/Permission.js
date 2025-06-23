// routes/Permission.js
const express = require("express");
const {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  getRolePermissions,
  setRolePermission,
  deleteRolePermission,
} = require("../controllers/Permission");

const router = express.Router();

// Role routes
router.get("/roles", getAllRoles);
router.get("/roles/:id", getRoleById);
router.post("/roles", createRole);
router.put("/roles/:id", updateRole);

// Resource routes
router.get("/resources", getAllResources);
router.get("/resources/:id", getResourceById);
router.post("/resources", createResource);
router.put("/resources/:id", updateResource);

// Permission routes
router.get("/roles/:roleId/permissions", getRolePermissions);
router.post("/permissions", setRolePermission);
router.delete("/permissions/:id", deleteRolePermission);

module.exports = router;
