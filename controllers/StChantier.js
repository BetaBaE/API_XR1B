const { getConnection, getSql } = require("../database/connection");

exports.getClotureDataByChantier = async (req, res) => {
  try {
    let filter = req.query.chantier || "{id/}";
    filter = JSON.parse(req.query.chantier);

    // Pagination parameters
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 1000; // Default to 1000 items per page
    const offset = (page - 1) * limit; // Calculate the offset for SQL query

    const pool = await getConnection();
    console.log("req", filter);

    // Query for paginated data
    const paginatedQuery = `
        DECLARE @MinDate DATE;
  
        SELECT @MinDate = MIN(DateFacture)
        FROM DAF_FactureSaisie fa
        INNER JOIN DAF_FOURNISSEURS f ON fa.idfournisseur = f.id
        WHERE fa.codechantier = @chantier
          AND fa.Etat <> 'Annuler'
          AND fa.deletedAt IS NULL;
  
        WITH Months AS (
            SELECT 
                DATEADD(MONTH, number, @MinDate) AS MonthStart
            FROM 
                master..spt_values
            WHERE 
                type = 'P' 
                AND DATEADD(MONTH, number, @MinDate) <= GETDATE()
        ),
        AggregatedData AS (
            SELECT  
                FORMAT(fs.DateFacture, 'yyyy-MM') AS mois,
                SUM(fs.HT) AS HT_mois, 
                SUM(SUM(fs.HT)) OVER (ORDER BY FORMAT(fs.DateFacture, 'yyyy-MM') ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumul
            FROM 
                DAF_FactureSaisie fs 
            WHERE 
                fs.codechantier = @chantier                          
                AND fs.Etat != 'Annuler'
            GROUP BY  
                FORMAT(fs.DateFacture, 'yyyy-MM') 
        )
  
        SELECT 
            FORMAT(m.MonthStart, 'yyyy-MM') AS id,
            FORMAT(m.MonthStart, 'yyyy-MM') AS mois,
            COALESCE(ad.HT_mois, 0) AS HT_mois,
            SUM(SUM(ad.HT_mois)) OVER (ORDER BY FORMAT(m.MonthStart, 'yyyy-MM') ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumul1
        FROM 
            Months m
        LEFT JOIN 
            AggregatedData ad ON ad.mois = FORMAT(m.MonthStart, 'yyyy-MM')
        GROUP BY FORMAT(m.MonthStart, 'yyyy-MM'), COALESCE(ad.HT_mois, 0), COALESCE(ad.cumul, 0)
        ORDER BY mois ASC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY;
      `;

    // Query for the total number of records
    const totalCountQuery = `
        SELECT COUNT(*) AS totalCount
        FROM DAF_FactureSaisie fa
        WHERE fa.codechantier = @chantier
          AND fa.Etat <> 'Annuler'
          AND fa.deletedAt IS NULL;
      `;

    // Execute paginated data query
    const result = await pool
      .request()
      .input("chantier", getSql().VarChar, filter.id)
      .input("offset", getSql().Int, offset)
      .input("limit", getSql().Int, limit)
      .query(paginatedQuery);

    // Execute total count query
    const totalResult = await pool
      .request()
      .input("chantier", getSql().VarChar, filter.id)
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

exports.getFactureSummaryByChantierAndMonth = async (req, res) => {
  try {
    let filter = JSON.parse(req.query.date); // Assuming the parameters are passed in the query
    const { mois, chantier } = filter; // e.g., '2023-10'

    // console.log(`Mois: ${mois}, Chantier: ${chantier}`);

    const pool = await getConnection();

    // SQL query to get the summary
    const summaryQuery = `
          SELECT f.nom, SUM(HT) AS SUMHT
          FROM DAF_FactureSaisie fa 
          INNER JOIN DAF_FOURNISSEURS f ON f.id = fa.idfournisseur
          WHERE FORMAT(DateFacture, 'yyyy-MM') = @mois
            AND codechantier = @chantier
            AND fa.Etat != 'Annuler'
          GROUP BY f.nom
          ORDER BY SUM(HT) DESC;
        `;

    // Execute the summary query
    const result = await pool
      .request()
      .input("mois", getSql().VarChar, mois)
      .input("chantier", getSql().VarChar, chantier)
      .query(summaryQuery);

    res.json(result.recordset);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

exports.getChantierDetailFournisser = async (req, res) => {
  try {
    let filter = JSON.parse(req.query.date); // Assuming the parameters are passed in the query
    const { chantier } = filter; // e.g., '2023-10'

    // console.log(`Mois: ${mois}, Chantier: ${chantier}`);

    const pool = await getConnection();

    // SQL query to get the summary
    const summaryQuery = `
          SELECT f.nom, SUM(HT) AS SUMHT
          FROM DAF_FactureSaisie fa 
          INNER JOIN DAF_FOURNISSEURS f ON f.id = fa.idfournisseur
          WHERE 1=1
            AND codechantier = @chantier
            AND fa.Etat != 'Annuler'
          GROUP BY f.nom
          ORDER BY SUM(HT) DESC

        `;

    // Execute the summary query
    const result = await pool
      .request()
      .input("chantier", getSql().VarChar, chantier)
      .query(summaryQuery);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

exports.getDetailMoisFournisseurForChantier = async (req, res) => {
  try {
    let filter = JSON.parse(req.query.date); // Assuming the parameters are passed in the query
    const { nom, chantier } = filter; // e.g., '2023-10'

    // console.log(`Mois: ${mois}, Chantier: ${chantier}`);

    const pool = await getConnection();

    // SQL query to get the summary
    const summaryQuery = `
          SELECT FORMAT(DateFacture, 'yyyy-MM') as mois, SUM(HT) AS SUMHT
          FROM DAF_FactureSaisie fa 
          INNER JOIN DAF_FOURNISSEURS f ON f.id = fa.idfournisseur
          WHERE 1=1
		    and f.nom = @nom
            AND codechantier = @chantier
            AND fa.Etat != 'Annuler'
          GROUP BY FORMAT(DateFacture, 'yyyy-MM')
          ORDER BY mois DESC
        `;

    // Execute the summary query
    const result = await pool
      .request()
      .input("nom", getSql().VarChar, nom)
      .input("chantier", getSql().VarChar, chantier)
      .query(summaryQuery);

    res.json(result.recordset);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};
