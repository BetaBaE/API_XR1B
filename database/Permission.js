// database/Permission.js
exports.Permission = {
  getAllRoles: `
    SELECT id, name, description 
    FROM DAF_Roles
    ORDER BY name
  `,
  getRoleById: `
    SELECT id, name, description 
    FROM DAF_Roles
    WHERE id = @id
  `,
  createRole: `
    INSERT INTO DAF_Roles (name, description)
    OUTPUT INSERTED.id, INSERTED.name, INSERTED.description
    VALUES (@name, @description)
  `,
  updateRole: `
    UPDATE DAF_Roles
    SET name = @name, description = @description
    WHERE id = @id
  `,
  getAllResources: `
    SELECT id, name, label, icon, description 
    FROM DAF_Resources
    ORDER BY name
  `,
  getResourceById: `
    SELECT id, name, label, icon, description 
    FROM DAF_Resources
    WHERE id = @id
  `,
  createResource: `
    INSERT INTO DAF_Resources (name, label, icon, description)
    OUTPUT INSERTED.id, INSERTED.name, INSERTED.label, INSERTED.icon, INSERTED.description
    VALUES (@name, @label, @icon, @description)
  `,
  updateResource: `
    UPDATE DAF_Resources
    SET name = @name, label = @label, icon = @icon, description = @description
    WHERE id = @id
  `,
  getRolePermissions: `
    SELECT 
      rp.id, rp.role_id, rp.resource_id,
      rp.can_list, rp.can_create, rp.can_edit, rp.can_delete,
      r.name AS role_name,
      res.name AS resource_name
    FROM DAF_RolePermissions rp
    JOIN DAF_Roles r ON rp.role_id = r.id
    JOIN DAF_Resources res ON rp.resource_id = res.id
    WHERE rp.role_id = @roleId
  `,
  setRolePermission: `
    MERGE INTO DAF_RolePermissions AS target
    USING (SELECT @roleId AS role_id, @resourceId AS resource_id) AS source
    ON target.role_id = source.role_id AND target.resource_id = source.resource_id
    WHEN MATCHED THEN
      UPDATE SET 
        can_list = @canList,
        can_create = @canCreate,
        can_edit = @canEdit,
        can_delete = @canDelete
    WHEN NOT MATCHED THEN
      INSERT (role_id, resource_id, can_list, can_create, can_edit, can_delete)
      VALUES (source.role_id, source.resource_id, @canList, @canCreate, @canEdit, @canDelete);
  `,
  deleteRolePermission: `
    DELETE FROM DAF_RolePermissions
    WHERE id = @id
  `
};