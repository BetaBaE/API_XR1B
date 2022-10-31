const { getConnection, getSql } = require("../database/connection");
const { ordervirements } = require("../database/querys");

const getOrderCountbyYear = async () => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(ordervirements.getCountByYear);
    // req.countyear = result.recordset[0].count;
    console.log(ordervirements.getCountByYear);
    // console.log(req.countyear);
    return result.recordset[0].count;
  } catch (error) {
    // res.status(500);
    console.log(error.message);
    // res.send(error.message);
  }
};
exports.getOrderCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(ordervirements.getCount);
    req.count = result.recordset[0].count;
    // console.log(req.count);
    next();
  } catch (error) {
    res.status(500);
    console.log(error.message);
    res.send(error.message);
  }
};

const generateOvID = (id) => {
  return `OV${id}-${new Date().getDate()}-${
    new Date().getMonth() + 1
  }-${new Date().getFullYear()}`;
};

exports.createOrderVirements = async (req, res) => {
  const { ribAtner } = req.body;
  console.log(getOrderCountbyYear());
  try {
    const pool = await getConnection();

    await pool
      .request()
      .input("id", getSql().VarChar, generateOvID(await getOrderCountbyYear()))
      .input("ribAtner", getSql().Int, ribAtner)

      .query(ordervirements.create);
    console.log("errour");
    res.json({
      id: "",
      ribAtner,
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.getorderVirements = async (req, res) => {
  try {
    let range = req.query.range || "[0,9]";
    let sort = req.query.sort || '["id" , "ASC"]';
    let filter = req.query.filter || "{}";

    range = JSON.parse(range);
    sort = JSON.parse(sort);
    filter = JSON.parse(filter);

    console.log(filter);

    let queryFilter = "";

    if (filter.id) {
      queryFilter += ` and ov.id like('%${filter.id}%')`;
    }
    if (filter.rib) {
      queryFilter += ` and rib like('%${filter.rib}%')`;
    }
    if (filter.nom) {
      queryFilter += ` and nom like('%${filter.nom}%')`;
    }
    if (filter.etat) {
      queryFilter += ` and etat like('%${filter.etat}%')`;
    }

    console.log(queryFilter);

    const pool = await getConnection();
    console.log(`${ordervirements.getAll} ${queryFilter} Order by ${sort[0]} ${
      sort[1]
    }
        OFFSET ${range[0]} ROWS FETCH NEXT ${
      range[1] + 1 - range[0]
    } ROWS ONLY`);
    const result = await pool.request().query(
      `${ordervirements.getAll} ${queryFilter} Order by ${sort[0]} ${sort[1]}
        OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );
    res.set(
      "Content-Range",
      `ordervirements ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.updateOrderVirements = async (req, res) => {
  const { ribAtner, etat } = req.body;
  if (ribAtner == null || etat == null) {
    return res.status(400).json({ error: "all field is required" });
  }
  try {
    const pool = await getConnection();

    await pool
      .request()
      .input("ribAtner", getSql().Int, ribAtner)
      .input("etat", getSql().VarChar, etat)
      .input("id", getSql().VarChar, req.params.id)
      .query(ordervirements.update);

    res.json({
      ribAtner,
      etat,
      id: req.params.id,
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.getOneOrderById = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().VarChar, req.params.id)
      .query(ordervirements.getOne);

    res.set("Content-Range", `ordervirements 0-1/1`);

    res.json(result.recordset[0]);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.orderVirementsEnCours = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .query(ordervirements.orderVirementsEnCours);

    res.set("Content-Range", `ordervirements 0 - ${req.count}/${req.count}`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
