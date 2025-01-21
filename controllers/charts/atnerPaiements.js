const { AtnerPaiement } = require("../../database/charts/atnerPaiements");
const { getConnection, getSql } = require("../../database/connection");

exports.getPaiementByMonth = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .query(`${AtnerPaiement.paiementByMonth}`);

    res.set("Content-Range", `sumFAchart 0-23/24`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.getPaiementByMonthDetailFournisseur = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("mois", getSql().VarChar, req.params.id)
      .query(`${AtnerPaiement.paiementByMonthDetailFournisseur}`);

    res.set("Content-Range", `MonthDetailFournisseur 0-299/300`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
exports.getPaiementByMonthDetailBank = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("mois", getSql().VarChar, req.params.id)
      .query(`${AtnerPaiement.paiementByMonthDetailBank}`);

    res.set("Content-Range", `MonthDetailBank 0-50/50`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};

exports.getChequeDetail = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`${AtnerPaiement.chequeDetail}`);

    res.set("Content-Range", `chequeDetail 0-50/50`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
