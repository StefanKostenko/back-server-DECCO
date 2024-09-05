const { conectarBD, consultas } = require("../bd");
module.exports = {
  leer: async (req, res) => {
    let { modo, id } = req.params;
    let consulta = "";
    if (id) {
      switch (modo) {
        case "maquina":
          consulta = consultas.alarmas.leerMaquina(id);
          break;
        case "id":
          consulta = consultas.alarmas.leer(id);
          break;
        case "todos":
          consulta = consultas.alarmas.todos;
          break;
        default:
          break;
      }
      let pool2 = await conectarBD();
      let registros = new Array();
      registros = (await pool2.request().query(consulta)).recordset;
      res.send(registros);
    }
  },
  nuevo: async (req, res) => {
    let { nombre, maquinaID } = req.body;
    try {
      if (nombre) {
        let consulta = consultas.alarmas.nuevo(nombre, maquinaID);
        let pool2 = await conectarBD();
        let registros = new Array();
        registros = (await pool2.request().query(consulta)).recordset;
        res.send(registros);
      }
    } catch (error) {
      console.log();
    }
  },
  actualizar: async (req) => {
    let { id, nombre } = req.body;
    try {
      if (id && nombre) {
        let consulta = consultas.alarmas.actualizar(id, nombre);
        let pool2 = await conectarBD();
        (await pool2.request().query(consulta)).recordset;
      }
    } catch (error) {
      console.log(error);
    }
  },
  borrar: async (req) => {
    let { id } = req.body;
    try {
      if (id) {
        let consulta = consultas.alarmas.borrar(id);
        let pool2 = await conectarBD();
        (await pool2.request().query(consulta)).recordset;
      }
    } catch (error) {
      console.log(error);
    }
  },
};
