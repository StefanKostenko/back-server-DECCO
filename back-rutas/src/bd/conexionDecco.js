// const envConfig = require("../configuracion/entorno");
// const sql = require("mssql");
// const EventLogger = require("node-windows").EventLogger;
// let log = new EventLogger("Adquisicion");
// const config = {
//   user: envConfig.usuarioSQL_Lineas,
//   password: envConfig.passwordSQL_Lineas,
//   server: envConfig.servidorSQL_Lineas,
//   database: envConfig.baseDatosSQL_Lineas,
//   options: {
//     encrypt: true,
//     trustServerCertificate: true,
//   },
// };
// module.exports = async () => {
//   try {
//     return new sql.ConnectionPool(config).connect();
//   } catch (e) {
//     console.error(e);
//     log.error(e);
//   }
// };
