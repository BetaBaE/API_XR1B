const { getConnection, getSql } = require("../database/connection");
const { Fournisseurs } = require("../database/querys");

exports.getFournisseursCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query(Fournisseurs.getFournisseursCount);
    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};

exports.getFournissuers = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["id" , "ASC"]';
    let filter = req.query.filter || "{}";
    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);
    console.log(filter);
    let queryFilter = "";
    if (filter.nom) {
      queryFilter += ` and upper(nom) like(upper('%${filter.nom}%'))`;
    }
    if (filter.codeFournisseur) {
      queryFilter += ` and codeFournisseur like('%${filter.codeFournisseur}%')`;
    }
    console.log(queryFilter);
    const pool = await getConnection();
    // const result = await pool.request().query(Fournisseurs.getAllFournisseurs);

    const result = await pool.request().query(
      `${Fournisseurs.getAllFournisseurs} ${queryFilter} Order by ${sort[0]} ${
        sort[1]
      }
      OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );

    console.log(req.count);
    res.set(
      "Content-Range",
      `fournisseurs ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};
