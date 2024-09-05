const { config } = require("dotenv");
config();

module.exports = {
  usuarioSQL: process.env.SQLUSER,
  passwordSQL: process.env.SQLPASS,
  servidorSQL: process.env.SQLSERVER,
  baseDatosSQL: process.env.SQLDB,

  // usuarioSQL_Lineas: process.env.SQLUSER_Lineas,
  // passwordSQL_Lineas: process.env.SQLPASS_Lineas,
  // servidorSQL_Lineas: process.env.SQLSERVER_Lineas,
  // baseDatosSQL_Lineas: process.env.SQLDB_Lineas,
};
