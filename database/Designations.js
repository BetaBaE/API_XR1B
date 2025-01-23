exports.designations = {
  getAll: `SELECT  * FROM [FactureDesignation] where 1=1`,
  getCount: `SELECT   COUNT(*) AS count FROM [FactureDesignation]`,
  getOneById: `SELECT  * FROM [FactureDesignation] where id = @id`,
  create: `
  INSERT INTO [dbo].[FactureDesignation]
        ([designation]
        ,[codeDesignation]
        ,[PourcentageTVA]
        ,[PosteTVA])
  VALUES
        (@designation
        ,@codeDesignation
        ,@PourcentageTVA
        ,@PosteTVA
        )
  `,

  update: `
  UPDATE [dbo].[FactureDesignation]
    SET [codeDesignation] = @codeDesignation
      ,[PourcentageTVA] = @PourcentageTVA
      ,[PosteTVA] = @PosteTVA
      ,[Etat] = @Etat
    WHERE id = @id
  `,
};
