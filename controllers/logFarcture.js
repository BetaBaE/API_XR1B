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
    if (filter.Bcommande) {
      queryFilter += ` and upper(fn.Bcommande) like(upper('%${filter.Bcommande}%'))`;
    }
    if (filter.CodeFournisseur) {
      queryFilter += ` and upper(fou.CodeFournisseur) like(upper('%${filter.CodeFournisseur}%'))`;
    }
    if (filter.nom) {
      queryFilter += ` and upper(fou.nom) like(upper('%${filter.nom}%'))`;
    }
    if (filter.ficheNavette) {
      queryFilter += ` and upper(fn.ficheNavette) like(upper('%${filter.ficheNavette}%'))`;
    }
    
    if (filter.LIBELLE) {
      queryFilter += ` and upper(ch.LIBELLE) like(upper('%${filter.LIBELLE}%'))`;
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
