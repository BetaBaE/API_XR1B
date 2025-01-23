exports.designations = {
  getAll: `SELECT  * FROM [FactureDesignation]`,
  getCount: `SELECT   COUNT(*) AS count FROM [FactureDesignation]`,
  getOneById: `SELECT  * FROM [FactureDesignation] where id = @id`,
  create: `
  INSERT INTO [dbo].[FactureDesignation]
    (
      [codeDesignation]
      ,[PourcentageTVA]
      ,[PosteTVA]
      ,[Etat]
    )
  VALUES
    (
      @codeDesignation
      ,@PourcentageTVA
      ,@PosteTVA
      ,@Etat
    )
  `,
};
