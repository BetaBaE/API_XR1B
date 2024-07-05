const sql = require("mssql");
const sql2 = require("mssql/msnodesqlv8");

// const dbSettings2 = {
//   database: "ATNER_DW",
//   server: "YIHRAI-JJ53ODN\\LOCALHOST",
//   driver: "msnodesqlv8",
//   pool: {
//     max: 10,
//     min: 0,
//     idleTimeoutMillis: 30000
//   },
//   options: {
//     trustedConnection: true,
//     requestTimeout: 300000 // délai d'attente de requête en millisecondes (par exemple 5 minutes)
//   }
// };


const dbSettings = {
  user: "saisie.erp",
  password: "Sage123+",
  server: "192.168.1.202",
  database: "ATNER_DW",
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
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
