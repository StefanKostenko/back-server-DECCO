const sql = require("mssql");
// const CryptoJS = require('crypto-js')
const envConfig = require("../configuracion/entorno");
const EventLogger = require("node-windows").EventLogger;
let log = new EventLogger("Adquisicion");

// const passDesencriptada = () => {
//     let decrypted = CryptoJS.AES.decrypt(envConfig.passwordSQL, process.env.SECURE_KEY_SECRET);
//     return decrypted.toString(CryptoJS.enc.Utf8);
// }

const config = {
  user: envConfig.usuarioSQL,
  password: /* passDesencriptada(), */ envConfig.passwordSQL,
  server: envConfig.servidorSQL,
  database: envConfig.baseDatosSQL,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    requestTimeout: 300000,
  },
};

module.exports = async () => {
  try {
    return new sql.ConnectionPool(config).connect();
  } catch (e) {
    console.error(e);
    log.error(e);
  }
};
