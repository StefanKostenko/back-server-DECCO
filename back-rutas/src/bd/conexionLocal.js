const sql = require("mssql");
const { config } = require("dotenv");
config();

const configuracion = {
  user: process.env.SQLUSER,
  password: process.env.SQLPASS,
  server: process.env.SQLSERVER,
  database: process.env.SQLDB,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    requestTimeout: 300000,
  },
};

module.exports = async () => {
  try {
    return new sql.ConnectionPool(configuracion).connect();
  } catch (e) {
    console.error(e);
    log.error(e);
  }
};
