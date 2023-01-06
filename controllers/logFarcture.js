const { getConnection, getSql } = require("../database/connection");
const { logFactures } = require("../database/querys");

exports.getLogFactureCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(logFactures.getLogFactureCount);
    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};

exports.getLogFactures = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["id" , "ASC"]';
    let filter = req.query.filter || "{}";
    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);
    console.log(filter);
    let queryFilter = "";
    if (filter.CODEDOCUTIL) {
      queryFilter += ` and upper(CODEDOCUTIL) like(upper('%${filter.CODEDOCUTIL}%'))`;
    }
    if (filter.CODECHT) {
      queryFilter += ` and upper(CODECHT) like(upper('%${filter.CODECHT}%'))`;
    }
    if (filter.NOM) {
      queryFilter += ` and upper(NOM) like(upper('%${filter.NOM}%'))`;
    }
    if (filter.LIBREGLEMENT) {
      queryFilter += ` and upper(LIBREGLEMENT) like(upper('%${filter.LIBREGLEMENT}%'))`;
    }
    if (filter.orderVirementId) {
      queryFilter += ` and upper(orderVirementId) like(upper('%${filter.orderVirementId}%'))`;
    }
    if (filter.etat) {
      queryFilter += ` and upper(etat) like(upper('%${filter.etat}%'))`;
    }

    console.log(queryFilter);

    const pool = await getConnection();

    const result = await pool.request().query(
      `${logFactures.getLogFactures} ${queryFilter} Order by ${sort[0]} ${
        sort[1]
      }
      OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );

    console.log(req.count);
    res.set(
      "Content-Range",
      `logfacture ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};
