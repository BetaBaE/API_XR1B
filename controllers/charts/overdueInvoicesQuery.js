const {
  overdueInvoicesQuery,
} = require("../../database/charts/overdueInvoicesQuery");
const { getConnection } = require("../../database/connection");

exports.getOverdueInvoicesr = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`${overdueInvoicesQuery.query}`);

    res.set("Content-Range", `overdueInvoices 0-3/4`);

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
    res.status(500);
  }
};
