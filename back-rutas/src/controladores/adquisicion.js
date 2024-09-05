const { conectarBD, consultas } = require("../bd");
module.exports = {
  leer: async (req, res) => {
    const { id } = req.params;
    try {
      if (id) {
        const consulta = consultas.adquisiciones.leer(id);
        const pool2 = await conectarBD();
        const registros = (await pool2.request().query(consulta)).recordset;
        res.send(registros);
      }
    } catch (error) {
      console.log(error);
    }
  },
  nuevo: async (req, res) => {
    const { nombreBD, nombre, triggerID } = req.body;
    try {
      if (nombreBD && nombre) {
        const consulta = consultas.adquisiciones.nuevo(
          nombreBD,
          nombre,
          triggerID
        );
        const pool2 = await conectarBD();
        const registros = (await pool2.request().query(consulta)).recordset;
        res.send(registros);
      }
    } catch (error) {
      console.log(error);
    }
  },
  borrar: async (req) => {
    const { id } = req.body;
    try {
      if (id) {
        const consulta = consultas.adquisiciones.borrar(id);
        const pool2 = await conectarBD();
        (await pool2.request().query(consulta)).recordset;
      }
    } catch (error) {}
  },
  actualizar: async (req) => {
    const { id, nombreBD, nombre, triggerID, activa } = req.body;
    try {
      if (id && nombre && nombreBD && triggerID && activa) {
        const consulta = consultas.adquisiciones.actualizar(
          id,
          nombreBD,
          nombre,
          triggerID,
          activa
        );
        const pool2 = await conectarBD();
        (await pool2.request().query(consulta)).recordset;
      }
    } catch (error) {}
  },
};
