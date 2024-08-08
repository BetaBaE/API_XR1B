exports.designation = {
  // Récupère le nombre total de désignations dans la table FactureDesignation
  getdesignationCount:
    "SELECT COUNT(*) as count FROM [dbo].[FactureDesignation]",

  // Récupère toutes les désignations de la table FactureDesignation
  getDesignation: "SELECT * FROM [dbo].[FactureDesignation]",

  // Récupère une désignation spécifique par ID
  getdesignationbynom: `
       SELECT *
       FROM [dbo].[FactureDesignation]
       WHERE id = @id`,
  getPourcentageTva: `
  SELECT  distinct PourcentageTVA as id ,concat((PourcentageTVA-1)*100, '%') as PourcentageTva100  from FactureDesignation
    where PourcentageTVA > 0
       order by PourcentageTVA

  `,
};
