const { getConnection, getSql } = require("../database/connection");
const { ribAtner } = require("../database/querys");

exports.getRibCountAtner = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(ribAtner.getCount);

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

exports.getRibsAtner = async (req, res) => {
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
    console.log(`${ribAtner.getAll} ${queryFilter} Order by ${sort[0]} ${
      sort[1]
    }
        OFFSET ${range[0]} ROWS FETCH NEXT ${
      range[1] + 1 - range[0]
    } ROWS ONLY`);
    const result = await pool.request().query(
      `${ribAtner.getAll} ${queryFilter} Order by ${sort[0]} ${sort[1]}
        OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );
    res.set(
      "Content-Range",
      `ribAtner ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.createRibsAtner = async (req, res) => {
  const { nom, rib ,Redacteur } = req.body;

  try {
    const pool = await getConnection();

    await pool
      .request()
      .input("nom", getSql().VarChar, nom)
      .input("rib", getSql().VarChar, rib)
      .input("Redacteur", getSql().VarChar, Redacteur)
      
      .query(ribAtner.create);
    console.log("errour");
    res.json({
      id: "",
      nom,
      rib,
      Redacteur
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.updateRibsAtner = async (req, res) => {
  const { nom, rib ,ModifierPar } = req.body;
  if (nom == null || rib == null || ModifierPar == null)  {
    return res.status(400).json({ error: "all field is required" });
  }
  try {
    const pool = await getConnection();

    await pool
      .request()
      .input("nom", getSql().VarChar,nom)
      .input("rib", getSql().VarChar,rib)
      .input("ModifierPar", getSql().VarChar,ModifierPar)
      .input("id", getSql().Int, req.params.id)
      .query(ribAtner.update);

    res.json({
      nom,
      rib,
      ModifierPar,
      id: req.params.id,
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.getOneRibAtnerById = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .query(ribAtner.getOne);

    res.set("Content-Range", `ribAtner 0-1/1`);

    res.json(result.recordset[0]);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};


exports.getRibAtnerValid = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().VarChar, req.params.id)
      .query(ribAtner.getRibAtnerValid);

    res.set("Content-Range", `ordervirementsFond 0-1/1`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};