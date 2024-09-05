const { conectarBD, consultas } = require("../bd");
module.exports = {
  leer: async (req, res) => {
    const { modo, id } = req.params;
    let consulta = "";
    try {
      if (id) {
        switch (modo) {
          case "maquina":
            consulta = consultas.productos.leerMaquina(id);
            break;
          case "id":
            consulta = consultas.productos.leer(id);
            break;
          case "todos":
            consulta = consultas.productos.todos;
            break;
          default:
            break;
        }
        const pool2 = await conectarBD();
        const registros = (await pool2.request().query(consulta)).recordset;
        res.send(registros);
      }
    } catch (error) {
      console.log(error);
    }
  },
  nuevo: async (req, res) => {
    const { nombre, maquinaID } = req.body;
    try {
      if (nombre) {
        const consulta = consultas.productos.nuevo(nombre, maquinaID);
        const pool2 = await conectarBD();
        const registros = (await pool2.request().query(consulta)).recordset;
        res.send(registros);
      }
    } catch (error) {
      console.log(error);
    }
  },
  actualizar: async (req) => {
    const { id, nombre, activo } = req.body;
    try {
      const consulta = consultas.productos.actualizar(id, nombre, activo);
      const pool2 = await conectarBD();
      await pool2.request().query(consulta);
    } catch (error) {
      console.log(error);
    }
  },
  actualizarMultiple: async (req) => {
    const { productos } = req.body;
    try {
      const pool2 = await conectarBD();
      for (let index = 0; index < productos.length; index++) {
        const element = productos[index];
        const consulta = consultas.productos.actualizar(
          element.id,
          element.nombre,
          element.activo
        );
        await pool2.request().query(consulta);
      }
    } catch (error) {
      console.log(error);
    }
  },
  borrar: async (req) => {
    const { id } = req.body;
    try {
      if (id) {
        const consulta = consultas.productos.borrar(id);
        const pool2 = await conectarBD();
        (await pool2.request().query(consulta)).recordset;
      }
    } catch (error) {
      console.log(error);
    }
  },
};
