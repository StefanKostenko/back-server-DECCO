const { conectarBD, consultas } = require("../bd");
module.exports = {
  leer: async (req, res) => {
    const { id } = req.params;
    let consulta = "";
    try {
      if (id) {
        consulta = consultas.clientes.leer(id);
      } else {
        consulta = consultas.clientes.todos();
      }
      const pool2 = await conectarBD();
      const registros = (await pool2.request().query(consulta)).recordset;
      res.send(registros);
    } catch (error) {
      console.log(error);
    }
  },
  nuevo: async (req, res) => {
    const { nombre, src } = req.body;
    try {
      if (nombre) {
        const consulta = consultas.clientes.nuevo(nombre, src);
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
        const consulta = consultas.clientes.borrar(id);
        const pool2 = await conectarBD();
        (await pool2.request().query(consulta)).recordset;
      }
    } catch (error) {
      console.log(error);
    }
  },
  actualizar: async (req) => {
    const { id, nombre, src } = req.body;
    try {
      if (id && nombre && src) {
        const consulta = consultas.clientes.actualizar(id, nombre, src);
        const pool2 = await conectarBD();
        (await pool2.request().query(consulta)).recordset;
      }
    } catch (error) {
      console.log(error);
    }
  },
};
