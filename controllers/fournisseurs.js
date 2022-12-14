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

exports.getAllFournissuers = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(Fournisseurs.getAllFournisseurs);

    res.set("Content-Range", `fournisseurs 0-${req.count - 1}/${req.count}`);
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.getRibsFournisseurValid = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .query(Fournisseurs.RibsFournisseurValid);

    console.log(req.count);
    res.set(
      "Content-Range",
      `fournisseurs 0-${req.count - 1}/${req.count - 1}`
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.FournisseursRibValid = async (req, res) => {
  let filter = req.query.ordervirment || "{}";
  filter = JSON.parse(filter);

  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("ovId", getSql().VarChar, filter.id)
      .query(Fournisseurs.FournisseursRibValid);
    res.set("Content-Range", `fournisseurs 0 - ${req.count}/${req.count}`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.PrintOrderVirement = async (req, res) => {
  let printData = {
    header: {},
    body: [],
  };
  let filter = req.query.ordervirment || "{}";
  filter = JSON.parse(filter);

  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("ovId", getSql().VarChar, filter.id)
      .query(Fournisseurs.FournisseursRibValid);
    res.set("Content-Range", `fournisseurs 0 - ${req.count}/${req.count}`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
