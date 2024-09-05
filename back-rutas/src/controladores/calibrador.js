const { conectarBD, consultas } = require("../bd");
const moment = require("moment");

module.exports = {
  parametros: {
    leer: async (req, res) => {
      const { clienteID, lineaID } = req.params;
      const { inicio, fin } = req.body;
      const fechaDesde = inicio
        ? inicio
        : moment().startOf("day").format("YYYY-MM-DDTHH:mm:ss");
      const fechaHasta = fin ? fin : moment().format("YYYY-MM-DDTHH:mm:ss.SSS");
      const consultaSQL = consultas.calibrador.parametros.leer(
        clienteID,
        lineaID,
        fechaDesde,
        fechaHasta
      );
      const pool = await conectarBD();
      let variacionesParametro = (
        await pool.request().query(consultaSQL)
      ).recordset.map((registro) => {
        return {
          // eslint-disable-next-line node/no-unsupported-features/es-syntax
          ...registro,
          fecha: registro.fecha.getTime(),
        };
      });
      res.send({ error: false, datos: variacionesParametro });
    },
    guardar: async (req, res) => {
      const { clienteID, lineaID } = req.params;
      const { tolerancia } = req.body;
      const consultaSQL = consultas.calibrador.parametros.guardar(
        clienteID,
        lineaID,
        tolerancia
      );
      const pool = await conectarBD();
      await pool.request().query(consultaSQL);
      res.send({ error: false, message: "Parámetro guardado" });
    },
  },
  // alarmas: {
  //   leer: async (req, res) => {
  //     const { clienteID, lineaID } = req.params;
  //     const { inicio, fin } = req.body;
  //     const fechaDesde = inicio
  //       ? inicio
  //       : moment().startOf("day").format("YYYY-MM-DDTHH:mm:ss");
  //     const fechaHasta = fin ? fin : moment().format("YYYY-MM-DDTHH:mm:ss.SSS");
  //     const consultaSQL = consultas.calibrador.alarmas.leer(
  //       clienteID,
  //       lineaID,
  //       fechaDesde,
  //       fechaHasta
  //     );
  //     const pool = await conectarBD();
  //     let alarmas = (await pool.request().query(consultaSQL)).recordset;
  //     for (let alarma of alarmas) {
  //       alarma.duracion = null;
  //       if (alarma.inicio && alarma.fin) {
  //         let milisegundos = alarma.fin.getTime() - alarma.inicio.getTime();
  //         const horas = Math.floor(milisegundos / 3600000);
  //         const minutos = Math.floor((milisegundos % 3600000) / 60000);
  //         const segundos = Math.floor((milisegundos % 60000) / 1000);
  //         alarma.duracion = `${String(horas).padStart(2, "0")}:${String(
  //           minutos
  //         ).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
  //       }
  //       alarma.inicio = moment(alarma.inicio.toISOString().slice(0, -1)).format(
  //         "DD/MM/YYYY HH:mm:ss"
  //       );
  //       alarma.fin = alarma.fin
  //         ? moment(alarma.fin.toISOString().slice(0, -1)).format(
  //             "DD/MM/YYYY HH:mm:ss"
  //           )
  //         : null;
  //     }
  //     res.send({ error: false, datos: alarmas });
  //   },
  //   iniciar: async (req, res) => {
  //     const { clienteID, lineaID } = req.params;
  //     const consultaSQL = consultas.calibrador.alarmas.iniciar(
  //       clienteID,
  //       lineaID
  //     );
  //     const pool = await conectarBD();
  //     await pool.request().query(consultaSQL);
  //     res.send({ error: false, message: "Alarma iniciada" });
  //   },
  //   finalizar: async (req, res) => {
  //     const { clienteID, lineaID } = req.params;
  //     const consultaSQL = consultas.calibrador.alarmas.iniciar(
  //       clienteID,
  //       lineaID
  //     );
  //     const pool = await conectarBD();
  //     await pool.request().query(consultaSQL);
  //     res.send({ error: false, message: "Alarma finalizada" });
  //   },
  // },
};
