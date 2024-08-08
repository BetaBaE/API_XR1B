exports.Users = {
  // Cette requête insère un nouvel utilisateur dans la table DAF_USER avec les informations fournies.
  create: `INSERT INTO [dbo].[DAF_USER]
              ([fullname]           -- Nom complet de l'utilisateur
              ,[username]           -- Nom d'utilisateur
              ,[Role]              -- Rôle de l'utilisateur
              ,[hached_password]    -- Mot de passe haché
              ,[salt])             -- Sel pour le hachage du mot de passe
             VALUES
              (@fullname            -- Valeur du nom complet
              ,@username            -- Valeur du nom d'utilisateur
              ,@Role               -- Valeur du rôle
              ,@hached_password     -- Valeur du mot de passe haché
              ,@salt)               -- Valeur du sel
  `,

  // Cette requête met à jour les informations d'un utilisateur existant dans la table DAF_USER.
  update: `UPDATE [dbo].[DAF_USER]
      SET [fullname] = @fullname     -- Mise à jour du nom complet
        ,[username] = @username      -- Mise à jour du nom d'utilisateur
        ,[Role] = @Role            -- Mise à jour du rôle
        ,[isActivated] = @isActivated -- Mise à jour de l'état d'activation
      WHERE id = @id                -- Condition de mise à jour : ID de l'utilisateur
  `,

  // Cette requête compte le nombre total d'utilisateurs dans la table DAF_USER.
  getCount: `SELECT COUNT(*) as count 
             FROM [dbo].[DAF_USER]   -- Table des utilisateurs
  `,

  // Cette requête récupère tous les utilisateurs de la table DAF_USER.
  getAll: `SELECT * 
           FROM [dbo].[DAF_USER]      --  Table des utilisateurs
           WHERE 1=1                 -- Condition toujours vraie pour récupérer tous les enregistrements
  `,

  // Cette requête récupère un utilisateur spécifique par son ID.
  getOne: `SELECT * 
           FROM [dbo].[DAF_USER]     -- Table des utilisateurs
           WHERE id = @id             -- Condition de recherche : ID de l'utilisateur
  `,

  // Cette requête récupère un utilisateur spécifique par son nom d'utilisateur.
  getOneUsename: `SELECT * 
                  FROM [dbo].[DAF_USER] -- Table des utilisateurs
                  WHERE username = @username -- Condition de recherche : nom d'utilisateur
  `,
};
