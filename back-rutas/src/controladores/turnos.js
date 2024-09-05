const { conectarBD, consultas } = require("../bd");
module.exports = {
  leer: async (req, res) => {
    const { id } = req.params;
    try {
      if (id) {
        const consulta = consultas.turnos.leer(id);
        const pool2 = await conectarBD();
        const registros = (await pool2.request().query(consulta)).recordset;
        res.send(registros);
      }
    } catch (error) {
      console.log(error);
    }
  },
  leerC: async (req, res) => {
    const { id } = req.params;
    try {
      if (id) {
        const consulta = consultas.turnos.todos(id);
        const pool2 = await conectarBD();
        const registros = (await pool2.request().query(consulta)).recordset;
        res.send(registros);
      }
    } catch (error) {
      console.log(error);
    }
  },
  nuevo: async (req, res) => {
    const { turno, horaInicio, horaFin, clienteID } = req.body;
    try {
      if (turno && horaInicio && horaFin && clienteID) {
        const consulta = consultas.turnos.nuevo(
          turno,
          horaInicio,
          horaFin,
          clienteID
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
        const consulta = consultas.turnos.borrar(id);
        const pool2 = await conectarBD();
        (await pool2.request().query(consulta)).recordset;
      }
    } catch (error) {
      console.log(error);
    }
  },
  actualizar: async (req) => {
    const { nombre, horaInicio, horaFin, clienteID } = req.body;
    try {
      if (nombre && horaInicio && horaFin && clienteID) {
        const consulta = consultas.turnos.actualizar(
          nombre,
          horaInicio,
          horaFin,
          clienteID
        );
        const pool2 = await conectarBD();
        (await pool2.request().query(consulta)).recordset;
      }
    } catch (error) {
      console.log(error);
    }
  },
};
