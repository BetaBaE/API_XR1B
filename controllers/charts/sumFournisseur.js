const {
  sumFournisseur,
  sumChantier,
} = require("../../database/charts/sumFournisseur");
const { getConnection } = require("../../database/connection");

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
