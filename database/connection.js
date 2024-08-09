const sql = require("mssql");
// const sql2 = require("mssql/msnodesqlv8");
// const dbSettings2 = {
//   database: "ATNER_DW",
//   server: "YIHRAI-JJ53ODN\\LOCALHOST_TEST",
//   driver: "msnodesqlv8",
//   pool: {
//     max: 10,
//     min: 0,
//     idleTimeoutMillis: 30000,
//   },
//   options: {
//     trustedConnection: true,
//     requestTimeout: 2000000, // Augmenter le délai d'attente
//   },
// };

const dbSettings = {
  user: "saisie.erp",
  password: "Sage123+",
  server: "10.111.1.68",
  database: "APP_COMPTA",
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
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
