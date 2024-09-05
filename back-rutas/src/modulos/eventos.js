const { conectarBD, consultas } = require("../bd");

module.exports = class Eventos {
  static nombreBD = "SCADA_HISTORICO";

  static nombreTabla = "EVENTOS";

  static columnas = [
    // { nombreColumna: 'id', tipoDatoSQL: 'int', autoincremento: true, clavePrimaria: true},
    {
      nombreColumna: "variableID",
      tipoDatoSQL: "int",
      autoincremento: false,
      clavePrimaria: false,
    },
    {
      nombreColumna: "usuario",
      tipoDatoSQL: "nvarchar(50)",
      autoincremento: false,
      clavePrimaria: false,
    },
    {
      nombreColumna: "ip",
      tipoDatoSQL: "nvarchar(15)",
      autoincremento: false,
      clavePrimaria: false,
    },
    {
      nombreColumna: "horaInicio",
      tipoDatoSQL: "datetime",
      autoincremento: false,
      clavePrimaria: false,
    },
    {
      nombreColumna: "descripcion",
      tipoDatoSQL: "nvarchar(100)",
      autoincremento: false,
      clavePrimaria: false,
    },
    {
      nombreColumna: "estado",
      tipoDatoSQL: "bit",
      autoincremento: false,
      clavePrimaria: false,
    },
  ];

  static async _inicializar() {
    await this.validarTablaHistoricoEventos();
  }

  static async validarTablaHistoricoEventos() {
    const pool = await conectarBD();

    // Evalua la existencia de la Base de Datos HISTORICO
    let existenciaBD = (
      await pool.request().query(consultas.bd.existeBD(this.nombreBD))
    ).recordset[0];
    console.log(typeof existenciaBD, existenciaBD);
    if (typeof existenciaBD === "undefined") {
      console.log(this.nombreBD, "NO EXISTE");
      await pool.request().query(consultas.bd.nuevaBD(this.nombreBD));
    }

    //Evalua la existencia de la tabla ALARMAS dentro de la Base de Datos HISTORICO
    let existenciaTabla = (
      await pool
        .request()
        .query(consultas.bd.existeTabla(this.nombreBD, this.nombreTabla))
    ).recordset[0];
    console.log(typeof existenciaTabla, existenciaTabla);
    if (typeof existenciaTabla === "undefined") {
      // Si la tabla NO EXISTE
      console.log(this.nombreTabla, "NO EXISTE");
      // la crea, junto con las columnas configuradas en esta Clase
      await pool
        .request()
        .query(
          consultas.bd.nuevaTablaAlarmas(
            this.nombreBD,
            this.nombreTabla,
            this.columnas
          )
        );
    } else {
      // Si la tabla EXISTE
      console.log(`${existenciaTabla.TABLE_NAME}, CORRECTO`);

      // En función de las columnas configuradas,
      for (let col of this.columnas) {
        // comprueba la existencia de cada columna necesaria para el registro del histórico.
        let existenciaColumna = (
          await pool
            .request()
            .query(
              consultas.bd.existeColumna(
                this.nombreBD,
                this.nombreTabla,
                col.nombreColumna
              )
            )
        ).recordset[0];
        console.log(typeof existenciaColumna, existenciaColumna);
        if (typeof existenciaColumna === "undefined") {
          // Si NO EXISTE la columna
          console.log(
            `${col.nombreColumna} (${col.tipoDatoSQL}) NO EXISTE EN ${this.nombreBD}.dbo.${this.nombreTabla}`
          );
          // la añade
          await pool
            .request()
            .query(
              consultas.bd.nuevaColumna(
                this.nombreBD,
                this.nombreTabla,
                col.nombreColumna,
                col.tipoDatoSQL
              )
            );
        }
      }
    }
  }

  // Hay que habilitar el websocket
  static async registroEnBD(req /* , res */) {
    if (!req.body.ip) req.body.ip = req.ip;
    let consultaSQL = consultas.eventos.crearRegistro(req.body);
    const pool = await conectarBD();
    await pool.request().query(consultaSQL);
    //planta.websocket.emit("evento", req.body);
    // res.send({ status: 'ok' });
  }

  static getNombre() {
    return "Eventos";
  }
};
