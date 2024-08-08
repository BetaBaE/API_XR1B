const sql = require("mssql");

const dbSettings = {
  user: "saisie.erp",
  password: "NouveauM0tDeP@ss!",
  server: "10.111.1.68", // Adresse IP et port
  database: "ATNER_DW",
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
    console.log("Connected to SQL Server");
    return pool;
  } catch (error) {
    console.error("Error connecting to SQL Server:", error);
  }
};

exports.getSql = () => {
  return sql;
};

// Test the connection
exports.getConnection();
