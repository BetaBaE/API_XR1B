const sql = require("mssql");

const dbSettings = {
  user: "saisie.erp",
  password: "Sage123+",
  server: "192.168.1.202",
 database: "ATNER_DW",
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 100000,
  },
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

exports.getConnection = async () => {
  try {
    const pool = await sql.connect(dbSettings);
    return pool;
  } catch (error) {
    console.error(error);
  }
};

exports.getSql = () => {
  return sql;
};
