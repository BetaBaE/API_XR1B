const { getConnection, getSql } = require("../database/connection");
const { EcheanceFourniseur } = require("../database/EcheanceFournisseur");

exports.getEcheanceCount = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(EcheanceFourniseur.getCount);

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

exports.getEcheances = async (req, res) => {
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

    const pool = await getConnection();
    console.log(`${EcheanceFourniseur.getAll} ${queryFilter} Order by ${
      sort[0]
    } ${sort[1]}
        OFFSET ${range[0]} ROWS FETCH NEXT ${
      range[1] + 1 - range[0]
    } ROWS ONLY`);
    const result = await pool.request().query(
      `${EcheanceFourniseur.getAll} ${queryFilter} Order by ${sort[0]} ${
        sort[1]
      }
        OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
    );
    res.set(
      "Content-Range",
      `Echeance ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
    );

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.getEcheanceById = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .query(EcheanceFourniseur.getOne);

    res.set("Content-Range", `Echeance 0-1/1`);

    res.json(result.recordset[0]);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.createEcheance = async (req, res) => {
  const { idFournisseur, EcheanceJR, ConvJR } = req.body;

  try {
    const pool = await getConnection();

    await pool
      .request()
      .input("idFournisseur", getSql().Int, idFournisseur)
      .input("EcheanceJR", getSql().Int, EcheanceJR)
      .input("ConvJR", getSql().Int, ConvJR)
      .query(EcheanceFourniseur.create);
    console.log("errour");
    res.json({
      id: "",
      idFournisseur,
      EcheanceJR,
      ConvJR,
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.updateEcheance = async (req, res) => {
  const { idFournisseur, EcheanceJR, ConvJR } = req.body;
  if (EcheanceJR == null || ConvJR == null) {
    return res.status(400).json({ error: "all field is required" });
  }
  try {
    const pool = await getConnection();

    await pool
      .request()
      .input("EcheanceJR", getSql().Int, EcheanceJR)
      .input("ConvJR", getSql().Int, ConvJR)
      .input("id", getSql().Int, req.params.id)
      .query(EcheanceFourniseur.update);

    res.json({
      id: req.params.id,
      idFournisseur,
      EcheanceJR,
      ConvJR,
    });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

exports.getEcheanceByFouId = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("i", getSql().Int, req.params.id)
      .query(EcheanceFourniseur.getOneByFournisseur);

    res.set("Content-Range", `Echeance 0-1/1`);

    res.json(result.recordset[0]);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
