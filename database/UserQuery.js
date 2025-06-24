exports.Users = {
  create: `INSERT INTO [dbo].[DAF_USER]
              ([fullname]
              ,[username]
              ,[Role]
              ,[hached_password]
              ,[salt]
              ,[isActivated])
             VALUES
              (@fullname
              ,@username
              ,@Role
              ,@hached_password
              ,@salt
              ,'true')`,

  update: `UPDATE [dbo].[DAF_USER]
           SET [fullname] = @fullname
              ,[username] = @username
              ,[Role] = @Role
              ,[isActivated] = @isActivated
           WHERE id = @id`,

  getCount: `SELECT COUNT(*) as count FROM [dbo].[DAF_USER]`,

  getAll: `SELECT * FROM [dbo].[DAF_USER] WHERE 1=1`,

  getOne: `SELECT * FROM [dbo].[DAF_USER] WHERE id = @id`,

  getOneUsename: `SELECT * FROM [dbo].[DAF_USER] WHERE username = @username`,

  resetPassword: `UPDATE [dbo].[DAF_USER]
    SET [hached_password] = @hached_password,
        [salt] = @salt
    WHERE id = @id
`,
};
