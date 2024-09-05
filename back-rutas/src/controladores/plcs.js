const { conectarBD, consultas } = require("../bd");
module.exports = {
  leer: async (req, res) => {
    const { id } = req.params;
    let consulta = "";
    try {
      if (id) {
        consulta = consultas.plcs.leer(id);
      } else {
        consulta = consultas.plcs.todos();
      }
      const pool2 = await conectarBD();
      const registros = (await pool2.request().query(consulta)).recordset;
      res.send(registros);
    } catch (error) {
      console.log(error);
    }
  },
  leerCliente: async (req, res) => {
    const { id } = req.params;
    let consulta = "";
    try {
      if (id) {
        consulta = consultas.plcs.leerCliente(id);
      } else {
        consulta = consultas.plcs.todos();
      }
      const pool2 = await conectarBD();
      const registros = (await pool2.request().query(consulta)).recordset;
      res.send(registros);
    } catch (error) {
      console.log(error);
    }
  },
  nuevo: async (req, res) => {
    const { ip, puerto, usuario, password, descripcion, clienteID } = req.body;
    try {
      if (ip && puerto && usuario && password && descripcion) {
        const consulta = consultas.plcs.nuevo(
          ip,
          puerto,
          usuario,
          password,
          descripcion,
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
        const consulta = consultas.plcs.borrar(id);
        const pool2 = await conectarBD();
        (await pool2.request().query(consulta)).recordset;
      }
    } catch (error) {
      console.log(error);
    }
  },
  actualizar: async (req) => {
    const { id, ip, puerto, usuario, password, descripcion, clienteID } =
      req.body;
    try {
      if (
        id &&
        ip &&
        puerto &&
        usuario &&
        password &&
        descripcion &&
        clienteID
      ) {
        const consulta = consultas.plcs.actualizar(
          id,
          ip,
          puerto,
          usuario,
          password,
          descripcion,
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
