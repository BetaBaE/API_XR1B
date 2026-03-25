const { getConnection, getSql } = require("../database/connection");
const { FactureDesignation } = require("../database/factureDesignation_queries");

exports.getAvailableYears = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query(`${FactureDesignation.availableYears}`);

    res.set("Content-Range", `availableYears 0-20/20`);
    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.getByDesignation = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("yearParam", getSql().Int, parseInt(req.params.year))
      .query(`${FactureDesignation.byDesignation}`);

    res.set("Content-Range", `byDesignation 0-199/200`);
    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.getByChantier = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("yearParam", getSql().Int, parseInt(req.params.year))
      .input("designationId", getSql().Int, parseInt(req.params.designationId))
      .query(`${FactureDesignation.byChantier}`);

    res.set("Content-Range", `byChantier 0-299/300`);
    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.getByFournisseur = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("yearParam", getSql().Int, parseInt(req.params.year))
      .input("designationId", getSql().Int, parseInt(req.params.designationId))
      .query(`${FactureDesignation.byFournisseur}`);

    res.set("Content-Range", `byFournisseur 0-299/300`);
    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
