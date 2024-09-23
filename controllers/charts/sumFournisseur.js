const {
  sumFournisseur,
  sumChantier,
  sumMensuel,
  SumForMonth,
} = require("../../database/charts/sumFournisseur");
const { getConnection, getSql } = require("../../database/connection");

exports.getSumFournisseur = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`${sumFournisseur.query}`);

    res.set("Content-Range", `sumfournisseur 0-850/851`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
exports.getSumChantier = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`${sumChantier.query}`);

    res.set("Content-Range", `sumChantier 0-80/80`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.getSumMensuel = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`${sumMensuel.query}`);

    res.set("Content-Range", `sumMensuel 0-50/50`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
exports.getSumForMonth = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("date", getSql().VarChar, req.params.id)
      .query(`${SumForMonth.query}`);

    res.set("Content-Range", `SumForMonth 0-50/50`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
