const { getConnection, getSql } = require("../database/connection");
const { StFournisseur } = require("../database/StFournisseur");

exports.getchefferDAffaireByFou = async (req, res) => {
  try {
    let filter = req.query.fournisseur || "{}";
    filter = JSON.parse(req.query.fournisseur);

    // Pagination parameters
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 1000; // Default to 1000 items per page
    const offset = (page - 1) * limit; // Calculate the offset for SQL query

    const pool = await getConnection();
    console.log("req", filter);

    // Query for paginated data
    const paginatedQuery = `
      SELECT FORMAT(DateFacture, 'yyyy-MM') AS id,
             FORMAT(DateFacture, 'yyyy-MM') AS name,
             SUM(TTC) AS TTC
      FROM DAF_FactureSaisie fa
      INNER JOIN DAF_FOURNISSEURS f ON fa.idfournisseur = f.id
      WHERE nom = @nom
        AND fa.Etat <> 'Annuler'
        AND fa.deletedAt IS NULL
      GROUP BY FORMAT(DateFacture, 'yyyy-MM')
      ORDER BY name
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY;
    `;

    // Query for the total number of records
    const totalCountQuery = `
      SELECT COUNT(DISTINCT FORMAT(DateFacture, 'yyyy-MM')) AS totalCount
      FROM DAF_FactureSaisie fa
      INNER JOIN DAF_FOURNISSEURS f ON fa.idfournisseur = f.id
      WHERE nom = @nom
        AND fa.Etat <> 'Annuler'
        AND fa.deletedAt IS NULL;
    `;

    // Execute paginated data query
    const result = await pool
      .request()
      .input("nom", getSql().VarChar, filter.nom)
      .input("offset", getSql().Int, offset)
      .input("limit", getSql().Int, limit)
      .query(paginatedQuery);

    // Execute total count query
    const totalResult = await pool
      .request()
      .input("nom", getSql().VarChar, filter.nom)
      .query(totalCountQuery);

    const totalItems = totalResult.recordset[0].totalCount; // Get total count

    // Calculate Content-Range
    const end = Math.min(offset + limit - 1, totalItems - 1);
    res.set("Content-Range", `items ${offset}-${end}/${totalItems}`);

    // Send the paginated data
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
