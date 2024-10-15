const { getConnection, getSql } = require("../database/connection");
const { Alerts } = require("../database/alerts");

exports.getAlertAttestationRegFisc = async (req, res) => {
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
      queryFilter += ` and nom like('%${filter.nom}%')`;
    }
    if (filter.rib) {
      queryFilter += ` and rib like('%${filter.rib}%')`;
    }

    const pool = await getConnection();
    const result = await pool.request().query(
      `${Alerts.expirationAttestationFisc} ${queryFilter} Order by ${sort[0]} ${
        sort[1]
      }
      OFFSET ${range[0]} ROWS FETCH NEXT ${
        range[1] + 1 - range[0]
      } ROWS ONLY     
      `
    );
    /*
      To FIX : 
     
           OFFSET ${range[0]} ROWS FETCH NEXT ${
        range[1] + 1 - range[0]
      } ROWS ONLY
    */
    res.set(
      "Content-Range",
      `alert1 ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.getAlertAttestationRegFiscCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query(Alerts.expirationAttestationFiscCount);

    req.count = result.recordset[0].count;
    console.log(req.count);
    // res.json({ count: res.conut });
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};
exports.getRasTva = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["id" , "ASC"]';
    let filter = req.query.filter || "{}";

    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);

    let queryFilter = "";
    if (filter.DateOperation2) {
      queryFilter += ` and format(lf.DateOperation,'yyyy-MMMM') = '${filter.DateOperation2}' `;
    }

    const pool = await getConnection();
    const result = await pool
      .request()
      .query(`${Alerts.rasTva} ${queryFilter} Order by ${sort[0]} ${sort[1]}`);

    res.set("Content-Range", `rastva ${req.count}`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
exports.getRasTvaFilter = async (req, res) => {
  try {
    let sort = req.query.sort || '["id" , "ASC"]';

    sort = JSON.parse(sort);

    const pool = await getConnection();
    console.log(`${Alerts.FilterRASTva} Order by ${sort[0]} ${sort[1]}`);

    const result = await pool
      .request()
      .query(`${Alerts.FilterRASTva} Order by ${sort[0]} ${sort[1]}`);

    res.set("Content-Range", `rastvafilter 1000`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
exports.getRasTvaCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(Alerts.countRasTVA);

    req.count = result.recordset[0].count;
    console.log(req.count);
    // res.json({ count: res.conut });
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};

exports.getFactureAyantFNSage = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["id" , "ASC"]';
    let filter = req.query.filter || "{}";
    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);

    let queryFilter = "";

    if (filter.nom) {
      queryFilter += ` and upper(fou.nom) like(upper('%${filter.nom}%'))`;
    }

    const pool = await getConnection();
    console.log(`${Alerts.FactureAyantFN} Order by ${sort[0]} ${sort[1]}`);

    const result = await pool.request().query(`${
      Alerts.FactureAyantFN
    } ${queryFilter} Order by ${sort[0]} ${sort[1]}
        OFFSET ${range[0]} ROWS FETCH NEXT ${
      range[1] + 1 - range[0]
    } ROWS ONLY`);

    res.set(
      "Content-Range",
      `faayantfn ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.getFactureAyantFNSageCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(Alerts.FactureAyantFNCount);

    req.count = result.recordset[0].count;
    console.log(req.count);
    // res.json({ count: res.conut });
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};
