const { AideRestitAvance } = require("../../database/charts/aideRestitAvance");
const { getConnection } = require("../../database/connection");

exports.RestitFactureMontantExcte = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .query(`${AideRestitAvance.restitFactureMontantExcte}`);

    res.set("Content-Range", `DFZ 0-99/100`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
exports.MontantAvanceAndFactureByFournisseur = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .query(`${AideRestitAvance.montantAvanceAndFactureByFournisseur}`);

    res.set("Content-Range", `ABC 0-99/100`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
exports.MontantAvanceNonRestitueByFournisseur = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .query(`${AideRestitAvance.montantAvanceNonRestitueByFournisseur}`);

    res.set("Content-Range", `ABC 0-99/100`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
