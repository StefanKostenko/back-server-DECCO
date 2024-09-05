// eslint-disable-next-line node/no-unsupported-features/node-builtins
const fsp = require("fs").promises;
const path = require("path");

module.exports = async (directorio) => {
  let libreria = new Array();
  libreria[directorio] = new Array();
  let archivos = await fsp.readdir(path.join(__dirname, "..", directorio));
  for (const archivo of archivos) {
    let rutaArchivo = path.join(__dirname, "..", directorio, archivo);
    let modulo = require(rutaArchivo);
    libreria[directorio][modulo.getNombre()] = modulo;
  }
  return libreria[directorio];
};
