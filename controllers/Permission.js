const { getConnection, getSql } = require("../database/connection");
const { Permission } = require("../database/Permission");

// Role CRUD Operations
exports.getAllRoles = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(Permission.getAllRoles);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getRoleById = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input("id", getSql().Int, req.params.id)
      .query(Permission.getRoleById);
    
    if (result.recordset.length === 0) {
      return res.status(404).send("Role not found");
    }
    
    res.json(result.recordset[0]);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.createRole = async (req, res) => {
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).send("Role name is required");
  }

  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input("name", getSql().VarChar, name)
      .input("description", getSql().VarChar, description || null)
      .query(Permission.createRole);
    
    res.status(201).json(result.recordset[0]);
  } catch (error) {
    if (error.message.includes("UNIQUE KEY constraint")) {
      return res.status(400).send("Role name must be unique");
    }
    res.status(500).send(error.message);
  }
};

exports.updateRole = async (req, res) => {
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).send("Role name is required");
  }

  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input("id", getSql().Int, req.params.id)
      .input("name", getSql().VarChar, name)
      .input("description", getSql().VarChar, description || null)
      .query(Permission.updateRole);
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).send("Role not found");
    }
    
    res.json({ id: req.params.id, name, description });
  } catch (error) {
    if (error.message.includes("UNIQUE KEY constraint")) {
      return res.status(400).send("Role name must be unique");
    }
    res.status(500).send(error.message);
  }
};

// Resource CRUD Operations
exports.getAllResources = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(Permission.getAllResources);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getResourceById = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input("id", getSql().Int, req.params.id)
      .query(Permission.getResourceById);
    
    if (result.recordset.length === 0) {
      return res.status(404).send("Resource not found");
    }
    
    res.json(result.recordset[0]);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.createResource = async (req, res) => {
  const { name, label, icon, description } = req.body;
  
  if (!name) {
    return res.status(400).send("Resource name is required");
  }

  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input("name", getSql().VarChar, name)
      .input("label", getSql().VarChar, label || null)
      .input("icon", getSql().VarChar, icon || null)
      .input("description", getSql().VarChar, description || null)
      .query(Permission.createResource);
    
    res.status(201).json(result.recordset[0]);
  } catch (error) {
    if (error.message.includes("UNIQUE KEY constraint")) {
      return res.status(400).send("Resource name must be unique");
    }
    res.status(500).send(error.message);
  }
};

exports.updateResource = async (req, res) => {
  const { name, label, icon, description } = req.body;
  
  if (!name) {
    return res.status(400).send("Resource name is required");
  }

  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input("id", getSql().Int, req.params.id)
      .input("name", getSql().VarChar, name)
      .input("label", getSql().VarChar, label || null)
      .input("icon", getSql().VarChar, icon || null)
      .input("description", getSql().VarChar, description || null)
      .query(Permission.updateResource);
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).send("Resource not found");
    }
    
    res.json({ id: req.params.id, name, label, icon, description });
  } catch (error) {
    if (error.message.includes("UNIQUE KEY constraint")) {
      return res.status(400).send("Resource name must be unique");
    }
    res.status(500).send(error.message);
  }
};

// Permission Management Operations
exports.getRolePermissions = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input("roleId", getSql().Int, req.params.roleId)
      .query(Permission.getRolePermissions);
    
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.setRolePermission = async (req, res) => {
  const { roleId, resourceId, canList, canCreate, canEdit, canDelete } = req.body;
  
  if (roleId === undefined || resourceId === undefined) {
    return res.status(400).send("roleId and resourceId are required");
  }

  try {
    const pool = await getConnection();
    await pool.request()
      .input("roleId", getSql().Int, roleId)
      .input("resourceId", getSql().Int, resourceId)
      .input("canList", getSql().Bit, canList || false)
      .input("canCreate", getSql().Bit, canCreate || false)
      .input("canEdit", getSql().Bit, canEdit || false)
      .input("canDelete", getSql().Bit, canDelete || false)
      .query(Permission.setRolePermission);
    
    res.json({ 
      roleId, 
      resourceId, 
      permissions: {
        canList, 
        canCreate, 
        canEdit, 
        canDelete 
      }
    });
  } catch (error) {
    if (error.message.includes("FOREIGN KEY constraint")) {
      return res.status(400).send("Invalid roleId or resourceId");
    }
    res.status(500).send(error.message);
  }
};

exports.deleteRolePermission = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input("id", getSql().Int, req.params.id)
      .query(Permission.deleteRolePermission);
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).send("Permission not found");
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Additional helper endpoint
exports.getUserPermissions = async (req, res) => {
  try {
    const userId = req.params.userId;
    const pool = await getConnection();
    const result = await pool.request()
      .input("userId", getSql().Int, userId)
      .query(Permission.getUserPermissions);
    
    const formatted = result.recordset.reduce((acc, perm) => {
      acc[perm.resource] = {
        canList: perm.can_list,
        canCreate: perm.can_create,
        canEdit: perm.can_edit,
        canDelete: perm.can_delete
      };
      return acc;
    }, {});
    
    res.json(formatted);
  } catch (error) {
    res.status(500).send(error.message);
  }
};