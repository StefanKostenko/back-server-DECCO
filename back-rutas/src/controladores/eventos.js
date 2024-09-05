const { conectarBD, consultas } = require("../bd");
let Eventos = require("../modulos/eventos");
let moment = require("moment");

module.exports = {
  periodo: async (req, res) => {
    try {
      let { desde, hasta } = req.body;
      let pool = await conectarBD();
      let consultaSQL = consultas.eventos.periodo(desde, hasta);
      let datosConsulta = (await pool.request().query(consultaSQL)).recordset;
      for (let reg of datosConsulta) {
        reg.horaInicio = reg.horaInicio
          ? moment(reg.horaInicio).utc().format("DD-MM-YYYY HH:mm:ss")
          : null;
      }
      res.send(datosConsulta);
    } catch (e) {
      res.send([]);
    }
  },
  crear: Eventos.registroEnBD,
};
