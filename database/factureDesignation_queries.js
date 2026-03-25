exports.FactureDesignation = {

  availableYears: `
    SELECT DISTINCT YEAR(DateFacture) AS year
    FROM DAF_FactureSaisie
    WHERE Etat != 'Annuler'
      AND YEAR(DateFacture) > 2023
    ORDER BY year DESC
  `,

  byDesignation: `
    SELECT
      fd.id AS id,
      fd.designation,
      fd.codeDesignation,
      CAST(SUM(fs.HT) AS INT) AS total
    FROM DAF_FactureSaisie fs
    LEFT JOIN FactureDesignation fd ON fd.id = fs.iddesignation
    WHERE YEAR(fs.DateFacture) = @yearParam
      AND fs.Etat != 'Annuler'
    GROUP BY fd.id, fd.designation, fd.codeDesignation
    ORDER BY total DESC
  `,

  byChantier: `
    SELECT
      CONCAT(CAST(c.id AS VARCHAR), '-', CAST(fd.id AS VARCHAR)) AS id,
      c.id AS codecht,
      c.LIBELLE,
      fd.designation,
      fd.codeDesignation,
      CAST(SUM(fs.HT) AS INT) AS total
    FROM DAF_FactureSaisie fs
    LEFT JOIN FactureDesignation fd ON fd.id = fs.iddesignation
    LEFT JOIN chantier c ON c.id = fs.codechantier
    WHERE YEAR(fs.DateFacture) = @yearParam
      AND fs.Etat != 'Annuler'
      AND fd.id = @designationId
    GROUP BY c.id, c.LIBELLE, fd.id, fd.designation, fd.codeDesignation
    ORDER BY total DESC
  `,

  byFournisseur: `
    SELECT
      CONCAT(CAST(f.id AS VARCHAR), '-', CAST(fd.id AS VARCHAR)) AS id,
      f.id AS idFournisseur,
      f.nom,
      fd.designation,
      fd.codeDesignation,
      CAST(SUM(fs.HT) AS INT) AS total
    FROM DAF_FactureSaisie fs
    LEFT JOIN FactureDesignation fd ON fd.id = fs.iddesignation
    LEFT JOIN DAF_FOURNISSEURS f ON f.id = fs.idfournisseur
    WHERE YEAR(fs.DateFacture) = @yearParam
      AND fs.Etat != 'Annuler'
      AND fd.id = @designationId
    GROUP BY f.nom, f.id, fd.id, fd.designation, fd.codeDesignation
    ORDER BY total DESC
  `,
};