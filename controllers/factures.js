const { getConnection, getSql } = require("../database/connection");
const { factures } = require("../database/querys");

exports.getFacturesCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(factures.getCount);
    req.count = result.recordset[0].count;
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};

exports.getFactures = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["nom" , "ASC"]';
    let filter = req.query.filter || "{}";
    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);
    console.log(filter);
    let queryFilter = "";
    if (filter.id) {
      queryFilter += ` and upper(id) like(upper('%${filter.id}%'))`;
    }
    if (filter.nom) {
      queryFilter += ` and upper(nom) like(upper('%${filter.nom}%'))`;
    }
    if (filter.datedoc) {
      queryFilter += ` and datedoc like('%${filter.datedoc}%')`;
    }
    if (filter.netapayer) {
      queryFilter += ` and netapayer like('%${filter.netapayer}%')`;
    }
    console.log(queryFilter);
    const pool = await getConnection();
    // const result = await pool.request().query(Fournisseurs.getAllFournisseurs);

    const result = await pool.request().query(
      `${factures.getAll} ${queryFilter} Order by ${sort[0]} ${sort[1]}
      OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );

    console.log(req.count);
    res.set(
      "Content-Range",
      `factures ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.getFacturesById = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().VarChar, req.params.id)
      .query(factures.getOne);

    res.set("Content-Range", `factures 0-1/1`);

    res.json(result.recordset[0]);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.getAllFactures = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(factures.getAllFactures);

    res.set("Content-Range", `factures 0 - ${req.count}/${req.count}`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.getfacturebyfournisseurid = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .query(factures.getfacturebyfournisseurid);

    res.set("Content-Range", `factures 0-1/1`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
