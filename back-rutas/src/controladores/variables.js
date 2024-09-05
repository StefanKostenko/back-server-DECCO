const { conectarBD, consultas } = require("../bd");

const moment = require("moment");
const {
  formatoMultipleRangos,
  filtrarPorRangos,
  rangoMarchaparo,
  formatoMarcha,
  formatoMultipleLinea,
  formatoLoteCliente,
  formatoLoteDesinf,
  formatoLoteJabon,
  formatoLoteFungicida,
  formatoLoteCera,
  formatoUsuario,
  filtroTurnos,
  rangoMarchaParoValor,
  formatoMultipleAcumuladores,
  filtrarPorRangosValor,
  sumValuesByZ,
} = require("../auxiliares");

module.exports = {
  all: async (req, res) => {
    const variablesPlanta = (
      await pool2.request().query(consultas.configuracion.variablesOPCUA)
    ).recordset;

    res.send(variablesPlanta);
  },

  leer: async (req, res) => {
    const { variables, inicio, fin, clienteID, maquinaID, otrasVariables } =
      req.body;
    const { modo, operacion, consulta, filtrado } = req.params;
    try {
      let fecha = null;
      let fechaF = null;
      const pool2 = await conectarBD();
      const variablesPlanta = (
        await pool2.request().query(consultas.configuracion.variablesOPCUA)
      ).recordset;
      const turnos = (
        await pool2.request().query(consultas.turnos.todos(clienteID))
      ).recordset;
      switch (modo) {
        case "8H":
          fecha = moment().subtract(8, "hours").format("YYYY-MM-DDTHH:mm:ss");
          break;
        case "24H-Turno":
          if (turnos[0] && turnos[2]) {
            const startTime = turnos[0].horaInicio.split(":");
            const endTime = turnos[2].horaFin.split(":");

            const startMoment = moment()
              .hours(startTime[0])
              .minutes(startTime[1])
              .startOf("minute");

            let endMoment = moment()
              .hours(endTime[0])
              .minutes(endTime[1])
              .startOf("minute");

            if (endTime[0] < 12) {
              endMoment.add(1, "days");
            }
            fecha = startMoment.format("YYYY-MM-DDTHH:mm:ss");
            fechaF = endMoment.format("YYYY-MM-DDTHH:mm:ss");
          } else {
            fecha = moment().startOf("day").format("YYYY-MM-DDTHH:mm:ss");
            fechaF = moment().endOf("day").format("YYYY-MM-DDTHH:mm:ss");
          }
          break;
        case "24H":
          fecha = moment().startOf("day").format("YYYY-MM-DDTHH:mm:ss");
          fechaF = moment().endOf("day").format("YYYY-MM-DDTHH:mm:ss");
          break;
        case "ultimaHora":
          fecha = moment().subtract(1, "hours").format("YYYY-MM-DDTHH:mm:ss");
          fechaF = moment().format("YYYY-MM-DDTHH:mm:ss");
          break;
        case "historico":
          fecha = inicio;
          fechaF = fin;
          break;
        case "todo":
          break;
      }
      let names = [];
      const variablesL = variablesPlanta.filter(
        (v) => variables.includes(v.modelo) && v.maquinaID == maquinaID
      );
      switch (consulta) {
        case "individual":
          for (let index = 0; index < variablesL.length; index++) {
            const { BD, tabla, columna, tipoDatoSQL } = variablesL[index];
            let sentencia = null;
            switch (operacion) {
              case "registros":
                if (fechaF == null) {
                  if (tipoDatoSQL.includes("nvarchar")) {
                    sentencia = consultas.variables.periodoString(
                      BD,
                      tabla,
                      columna,
                      fecha
                    );
                  } else {
                    sentencia = consultas.variables.periodo(
                      BD,
                      tabla,
                      columna,
                      fecha
                    );
                  }
                } else {
                  if (tipoDatoSQL.includes("nvarchar")) {
                    sentencia = consultas.variables.historicoString(
                      BD,
                      tabla,
                      columna,
                      fecha,
                      fechaF
                    );
                  } else {
                    sentencia = consultas.variables.historico(
                      BD,
                      tabla,
                      columna,
                      fecha,
                      fechaF
                    );
                  }
                }
                break;
              case "totales":
                if (fechaF == null)
                  sentencia = consultas.variables.totalHistorico(
                    BD,
                    tabla,
                    columna,
                    fecha,
                    moment().format("YYYY-MM-DDTHH:mm:ss")
                  );
                else
                  sentencia = consultas.variables.totalHistorico(
                    BD,
                    tabla,
                    columna,
                    fecha,
                    fechaF
                  );
                break;
              case "ultimo":
                if (fechaF == null) {
                  if (tipoDatoSQL.includes("nvarchar")) {
                    sentencia = consultas.variables.ultimoDisponibleString(
                      BD,
                      tabla,
                      columna,
                      fecha
                    );
                  } else {
                    sentencia = consultas.variables.ultimoDisponible(
                      BD,
                      tabla,
                      columna,
                      fecha
                    );
                  }
                } else {
                  if (tipoDatoSQL.includes("nvarchar")) {
                    sentencia =
                      consultas.variables.ultimoDisponibleHistoricaString(
                        BD,
                        tabla,
                        columna,
                        fecha,
                        fechaF
                      );
                  } else {
                    sentencia = consultas.variables.ultimoDisponibleHistorica(
                      BD,
                      tabla,
                      columna,
                      fecha,
                      fechaF
                    );
                  }
                }
                break;
              case "primero":
                if (fechaF == null)
                  sentencia = consultas.variables.primeroDisponible(
                    BD,
                    tabla,
                    columna,
                    fecha
                  );
                else
                  sentencia = consultas.variables.primeroDisponibleHistorica(
                    BD,
                    tabla,
                    columna,
                    fecha,
                    fechaF
                  );
                break;
              case "valores":
                sentencia = consultas.variables.distintos(BD, tabla, columna);
                break;
              case "registrosYZ":
                const variablesZ = variablesPlanta.filter(
                  (v) =>
                    otrasVariables.includes(v.modelo) &&
                    v.maquinaID == maquinaID
                );
                const columnas =
                  columna +
                  " as y," +
                  variablesZ[index].columnaAdquisicion +
                  " as z";
                if (fechaF == null)
                  sentencia = consultas.variables.periodoVariables(
                    BD,
                    tabla,
                    columnas,
                    fecha
                  );
                else
                  sentencia = consultas.variables.periodoHistoricoVariables(
                    BD,
                    tabla,
                    columnas,
                    fecha,
                    fechaF
                  );
                break;
            }
            const registros = (await pool2.request().query(sentencia))
              .recordset;
            variablesL[index].registros = registros;
          }
          switch (filtrado) {
            case "sinfiltro":
              res.send(variablesL);
              break;

            case "formatoLotesCliente":
              const registrosLoteCliente = variablesL.map((v) =>
                formatoLoteCliente(v.registros)
              );
              res.send(registrosLoteCliente[0]);
              break;

            case "formatoUsuarios":
              const registrosUsuario = variablesL.map((v) =>
                formatoUsuario(v.registros)
              );
              res.send(registrosUsuario[0]);
              break;

            case "formatoRangos":
              const registrosRangos = variablesL.map((v) =>
                filtrarPorRangos(v.registros)
              );
              names = variablesL.map((v) => {
                if (v.unidadMedida === "I/0") {
                  return v.nombreCorto;
                } else {
                  return v.nombreCorto + " ( " + v.unidadMedida + " )";
                }
              });
              const estados = otrasVariables || ["Paro", "Marcha"];
              res.send(formatoMultipleRangos(registrosRangos, names, estados));
              break;
            case "formatoLinea":
              const registrosLinea = variablesL.map((v) => v.registros);
              names = variablesL.map((v) =>
                v.unidadMedida === "I/0"
                  ? v.nombreCorto
                  : v.nombreCorto + " ( " + v.unidadMedida + " )"
              );

              res.send(formatoMultipleLinea(registrosLinea, names));
              break;
            case "formatoAcumuladores":
              const registrosAcc = variablesL.map((v) => v.registros);
              names = variablesL.map((v) =>
                v.unidadMedida === "I/0"
                  ? v.nombreCorto
                  : v.nombreCorto + " ( " + v.unidadMedida + " )"
              );
              res.send(formatoMultipleAcumuladores(registrosAcc, names));
              break;
            case "totalRangos":
              for (let index = 0; index < variablesL.length; index++) {
                const v = variablesL[index];
                const rangos = filtrarPorRangos(v.registros);
                let acc0 = 0;
                let acc1 = 0;
                for (let i = 0; i < rangos.length; i++) {
                  const rango = rangos[i];
                  const diffSeconds = moment(rango.y).diff(
                    moment(rango.x),
                    "seconds"
                  );
                  if (rango.z === 0) {
                    acc0 += diffSeconds;
                  } else {
                    acc1 += diffSeconds;
                  }
                }
                variablesL[index].registros = {
                  unidad: "s",
                  total0: acc0,
                  total1: acc1,
                };
              }
              res.send(variablesL);
              break;
            case "unidadTiempo":
              const unidadesMinuto = [];
              for (let index = 0; index < variablesL.length; index++) {
                const unidad = [];
                if (variablesL[index].registros)
                  for (
                    let i = 0;
                    i < variablesL[index].registros.length - 1;
                    i++
                  ) {
                    const n = variablesL[index].registros[i];
                    const n1 = variablesL[index].registros[i + 1];
                    const num =
                      (n1.y - n.y) / moment(n1.x).diff(moment(n.x), "seconds");
                    const yValue = (
                      (Math.round((num + Number.EPSILON) * 100) / 100) *
                      60
                    ).toFixed(2);
                    unidad.push({ x: n.x, y: yValue });
                  }
                unidadesMinuto[index] = unidad;
                names.push(otrasVariables);
              }
              res.send(formatoMultipleLinea(unidadesMinuto, names));
              break;
            case "kilosHora":
              const unidadesHora = [];
              for (let index = 0; index < variablesL.length; index++) {
                const unidad = [];
                if (variablesL[index].registros)
                  for (
                    let i = 0;
                    i < variablesL[index].registros.length - 1;
                    i++
                  ) {
                    const n = variablesL[index].registros[i];
                    const n1 = variablesL[index].registros[i + 1];
                    const num =
                      (n.y - n1.y) / moment(n.x).diff(moment(n1.x), "seconds");
                    const yValue = (
                      (Math.round((num + Number.EPSILON) * 100) / 100) *
                      3600
                    ).toFixed(2);
                    unidad[i] = { x: n.x, y: yValue };
                  }
                unidadesHora[index] = unidad;
                names.push(otrasVariables);
              }
              res.send(formatoMultipleLinea(unidadesMinuto, names));
              break;
            case "tiempoTurnos":
              for (let index = 0; index < variablesL.length; index++) {
                const v = variablesL[index];
                const rangos = filtrarPorRangos(v.registros);
                if (v.unidadMedida != "I/0") {
                  names.push(v.nombreCorto + " ( " + v.unidadMedida + " )");
                } else {
                  names.push(v.nombreCorto);
                }
                variablesL[index].registros = filtroTurnos(rangos, turnos);
              }
              res.send(variablesL);
              break;
            case "totalZValor":
              for (let index = 0; index < variablesL.length; index++) {
                variablesL[index].registros = [
                  {
                    unidad: "s",
                    total: sumValuesByZ(
                      filtrarPorRangosValor(variablesL[index].registros)
                    ),
                  },
                ];
              }
              res.send(variablesL);
              break;
          }
          break;
        case "multiple":
          const columnasA = variablesL
            .slice(0, -1)
            .map((variable) => `[${variable.columnaAdquisicion}]`)
            .join(",");
          const lastColumna = `[${
            variablesL[variablesL.length - 1].columnaAdquisicion
          }]`;
          const { BD, tabla } = variablesL[0];
          let columnas = "";
          switch (operacion) {
            case "registros":
              columnas = columnasA + "," + lastColumna;
              if (fechaF == null)
                sentencia = consultas.variables.periodoVariables(
                  BD,
                  tabla,
                  columnas,
                  fecha
                );
              else
                sentencia = consultas.variables.periodoHistoricoVariables(
                  BD,
                  tabla,
                  columnas,
                  fecha,
                  fechaF
                );
              break;
            case "registrosY":
              columnas = columnasA + "," + lastColumna + " as y";
              if (fechaF == null)
                sentencia = consultas.variables.periodoVariables(
                  BD,
                  tabla,
                  columnas,
                  fecha
                );
              else
                sentencia = consultas.variables.periodoHistoricoVariables(
                  BD,
                  tabla,
                  columnas,
                  fecha,
                  fechaF
                );
              break;
          }
          const registros = (await pool2.request().query(sentencia)).recordset;
          let registroFormateado = null;
          switch (filtrado) {
            case "sinfiltro":
              res.send(registros);
              break;
            case "marchaFormatoRangos":
              res.send(formatoMarcha(rangoMarchaparo(registros)));
              break;

            case "formatoLotesDesinf":
              res.send(formatoLoteDesinf(registros));
              break;

            case "formatoLotesJabon":
              res.send(formatoLoteJabon(registros));
              break;

            case "formatoLotesFungicida":
              res.send(formatoLoteFungicida(registros, variablesL));
              break;

            case "formatoLotesCera":
              res.send(formatoLoteCera(registros, variablesL));
              break;

            case "totalMarcha":
              registroFormateado = formatoMarcha(rangoMarchaparo(registros));
              const total = registroFormateado[1].data.reduce((acc, t) => {
                return acc + moment(t.y[1]).diff(moment(t.y[0]), "seconds");
              }, 0);
              res.send({ unidad: "s", total: total });
              break;
            case "turnosMarcha":
              registroFormateado = formatoMarcha(rangoMarchaparo(registros));
              res.send(filtroTurnos(registroFormateado, turnos));
              break;
            case "turnosMarchaValor":
              registroFormateado = formatoMarcha(
                rangoMarchaParoValor(registros)
              );
              res.send(filtroTurnos(registroFormateado, turnos));
              break;
            case "totalAutoManual":
              let totalAuto = 0;
              let totalManual = 0;

              for (let i = 1; i < registros.length; i++) {
                const diff = registros[i].y - registros[i - 1].y;
                if (curr.auto) {
                  totalAuto += diff;
                } else {
                  totalManual += diff;
                }
              }
              variablesL[0].registros = {
                auto: totalAuto,
                manual: totalManual,
                total: totalAuto + totalManual,
              };
              res.send(variablesL[0]);
              break;
            case "turnosAutoManual":
              const totalManualATurno = [0, 0, 0, 0];
              const totalAutoATurno = [0, 0, 0, 0];
              let totalT = 0;

              for (let j = 0; j < registros.length - 1; j++) {
                const pos = j;
                const registro = registros[j + 1];
                const currentMoment = moment(registro.x).startOf("minute");

                const checkTurno1 = currentMoment.isBetween(
                  moment()
                    .hours(turnos[1].horaInicio.split(":")[0])
                    .minutes(turnos[1].horaInicio.split(":")[1])
                    .startOf("minute"),
                  moment()
                    .hours(turnos[1].horaFin.split(":")[0])
                    .minutes(turnos[1].horaFin.split(":")[1])
                    .startOf("minute")
                );

                const checkTurno0 = currentMoment.isBetween(
                  moment()
                    .hours(turnos[0].horaInicio.split(":")[0])
                    .minutes(turnos[0].horaInicio.split(":")[1])
                    .startOf("minute"),
                  moment()
                    .hours(turnos[0].horaFin.split(":")[0])
                    .minutes(turnos[0].horaFin.split(":")[1])
                    .startOf("minute")
                );

                if (checkTurno1) {
                  if (registro.auto) {
                    totalAutoATurno[1] += registros[pos].y - registro.y;
                  } else {
                    totalManualATurno[1] += registros[pos].y - registro.y;
                  }
                } else if (checkTurno0) {
                  if (registro.auto) {
                    totalAutoATurno[0] += registro.y - registros[pos].y;
                  } else {
                    totalManualATurno[0] += registro.y - registros[pos].y;
                  }
                } else {
                  if (registro.auto) {
                    totalAutoATurno[2] += registro.y - registros[pos].y;
                  } else {
                    totalManualATurno[2] += registro.y - registros[pos].y;
                  }
                }

                if (registro.auto) {
                  totalAutoATurno[3] += registro.y - registros[pos].y;
                } else {
                  totalManualATurno[3] += registro.y - registros[pos].y;
                }

                totalT += registro.y - registros[pos].y;
              }
              variablesL[0].registros = {
                unidad: "s",
                auto: totalAutoATurno,
                manual: totalManualATurno,
                total: totalT,
              };
              res.send(variablesL[0]);
              break;
          }
          break;
        case "multipleConsulta":
          for (let index = 0; index < variablesL.length; index++) {
            const { BD, tabla, columna } = variablesL[index];
            const total = [];
            switch (operacion) {
              case "turnosTotales":
                {
                  for (let index = 0; index < turnos.length; index++) {
                    const horaInicio = turnos[index].horaInicio.split(":");
                    const horaFin = turnos[index].horaFin.split(":");
                    const fechaI = moment()
                      .hours(horaInicio[0])
                      .minutes(horaInicio[1])
                      .startOf("minute")
                      .format("YYYY-MM-DDTHH:mm:ss");

                    let fechaFin = moment()
                      .hours(horaFin[0])
                      .minutes(horaFin[1])
                      .startOf("minute")
                      .format("YYYY-MM-DDTHH:mm:ss");

                    if (index === 3 && horaFin[0] < 12) {
                      fechaFin = moment()
                        .add(1, "day")
                        .hours(horaFin[0])
                        .minutes(horaFin[1])
                        .startOf("minute")
                        .format("YYYY-MM-DDTHH:mm:ss");
                    }

                    const consulta2 = consultas.variables.totalHistorico(
                      BD,
                      tabla,
                      columna,
                      fechaI,
                      fechaFin
                    );
                    total.push(
                      (await pool2.request().query(consulta2)).recordset
                    );
                  }
                  consulta = consultas.variables.totalHistorico(
                    BD,
                    tabla,
                    columna,
                    fecha,
                    fechaF
                  );
                  total.push((await pool2.request().query(consulta)).recordset);
                  variablesL[index].registros = total;
                }
                break;
              case "turnosTotalHistorico":
              //TODO Plantear caso donde se pasa Fecha
            }
          }
          switch (filtrado) {
            case "sinfiltro":
              res.send(variablesL);
              break;
          }
          break;
      }
    } catch (error) {
      console.log(error);
    }
  },
  inicioFin: async (req, res) => {
    const { modeloID, maquinaID, valor } = req.body;
    try {
      const variable = variablesPlanta.filter(
        (v) => v.modelo == modeloID && v.maquinaID == maquinaID
      );
      const { BD, tabla, columna } = variable[0];

      let consultaFechas = consultas.variables.inicioFin(
        BD,
        tabla,
        columna,
        valor
      );
      console.log("Consulta Fechas", consultaFechas)
      const pool2 = await conectarBD();
      const fechas = (await pool2.request().query(consultaFechas)).recordset;
      console.log("Fechas", fechas);
      let consultaRegistros = consultas.variables.historicoString(
        BD,
        tabla,
        columna,
        moment(fechas[0].fecha.toISOString().slice(0, -1)).format(
          "YYYY-MM-DDTHH:mm:ss.SSS"
        ),
        moment(fechas[1].fecha.toISOString().slice(0, -1)).format(
          "YYYY-MM-DDTHH:mm:ss.SSS"
        )
      );
      const registros = (await pool2.request().query(consultaRegistros))
        .recordset;
      const rangos = filtrarPorRangos(registros);
      const rangoValor = rangos
        .filter((e) => e.z == valor)
        .map((r, index) => {
          return {
            id: index,
            name: `${moment(r.x.toISOString().slice(0, -1)).format(
              "DD/MM/YYYY HH:mm:ss"
            )} - ${moment(r.y.toISOString().slice(0, -1)).format(
              "DD/MM/YYYY HH:mm:ss"
            )}`,
            x: r.x.toISOString().slice(0, 19),
            y: r.y.toISOString().slice(0, 19),
            z: r.z,
          };
        });
      res.send(rangoValor);
    } catch (error) {
      console.log(error);
    }
  },
};
