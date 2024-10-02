const { faNotPayed } = require("../../database/charts/sumFA");
const { getConnection, getSql } = require("../../database/connection");

exports.getChartSumFA = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`${faNotPayed.chart}`);

    res.set("Content-Range", `sumFAchart 0-1/2`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.getTableSumFA = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`${faNotPayed.tableSum}`);

    res.set("Content-Range", `sumFATable 0-1/2`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
exports.getSituationFournisseur = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .query(`${faNotPayed.situationFournisseur}`);

    res.set("Content-Range", `SitFour 0-99/100`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.getFacturebyFournisseur = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("id", getSql().Int, req.params.id)
      .query(`${faNotPayed.factureSaisieByFour}`);

    res.set("Content-Range", `SumForMonth 0-50/50`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
