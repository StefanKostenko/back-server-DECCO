const { conectarBD, consultas } = require("../bd");
module.exports = {
  leer: async (req, res) => {
    const { modo, id, grupoID } = req.params;
    let consulta = "";
    try {
      if (id) {
        switch (modo) {
          case "cliente":
            consulta = consultas.maquinas.leerCliente(id);
            break;
          case "id":
            consulta = consultas.maquinas.leer(id);
            break;
          case "linea":
            consulta = consultas.maquinas.leerLinea(id);
            break;
          case "clienteTipo":
            consulta = consultas.maquinas.leerClienteTipo(id, grupoID);
            break;
          case "lineaTipo":
            consulta = consultas.maquinas.leerLineaGrupo(id, grupoID);
            break;
          default:
            consulta = consultas.configuracion.maquinas;
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
  nuevo: async (req) => {
    const { nombre, nombreLinea, clienteID, grupoID, lineaID } = req.body;
    try {
      const pool2 = await conectarBD();
      const consultaMaquina = null;
      nombreLinea = nombreLinea.trim();
      consultaMaquina = consultas.maquinas.nuevo(
        nombre,
        clienteID + "-" + nombre + "-" + nombreLinea,
        clienteID + "-" + nombre + "-" + nombreLinea,
        1,
        clienteID,
        lineaID,
        grupoID
      );
      // consultaMaquina = consultas.maquinas.nuevo(nombre, clienteID+"-"+nombreLinea+"-"+nombre,  clienteID+"-"+nombreLinea+"-"+nombre, 1, clienteID, null,grupoID);
      const maquinaID = (await pool2.request().query(consultaMaquina))
        .recordset[0].id;
      //MODELO
      const insertarModelo = consultas.configuracionMaquinas.insertModelo(
        maquinaID,
        grupoID
      );
      await pool2.request().query(insertarModelo);
      //GRUPO
      const consultaG1 = consultas.variables.variablesMaquinaGrupo(
        maquinaID,
        grupoID
      );
      const variableArray = (await pool2.request().query(consultaG1)).recordset;
      //ADQUISICION
      let trigger = 0;
      switch (grupoID) {
        case 1:
          trigger = variableArray[0].id;
          break;
        case 2:
          trigger = variableArray[0].id;
          break;
        case 3:
          trigger = variableArray[0].id;
          break;
        default:
          break;
      }
      const adquisicionConsulta = consultas.adquisiciones.nuevo(
        "ADQUISICION",
        clienteID + "-" + nombre + "-" + nombreLinea,
        trigger
      );
      const adquisicionID = (await pool2.request().query(adquisicionConsulta))
        .recordset[0].id;
      const plcConsulta = consultas.plcs.leerCliente(clienteID);
      const plc = (await pool2.request().query(plcConsulta)).recordset[0].id;
      for (let index = 0; index < variableArray.length; index++) {
        const element = variableArray[index];
        let varAdqValues =
          "INSERT [CONFIGURACION].[dbo].[VARIABLES_ADQUISICIONES] ([variableID], [adquisicionID]) VALUES";
        let varBD =
          "INSERT [CONFIGURACION].[dbo].[VARIABLES_BD] ([BD],[variableID], [tabla], [columna]) VALUES";
        let varOPCUA =
          "INSERT [CONFIGURACION].[dbo].[VARIABLES_OPCUA] ([variableID], [plcOpcuaID], [nodeID], [tipoDatoOpcuaID], [ruta]) VALUES";
        varAdqValues += " (" + element.id + ", " + adquisicionID + ")";
        varBD +=
          " ( 'ADQUISICION', " +
          element.id +
          ", '" +
          clienteID +
          "-" +
          nombreLinea +
          "-" +
          nombre +
          "', '" +
          element.columnaAdquisicion +
          "')";
        let grupoID = 0;
        switch (element.tipoDatoSQL) {
          case "bit":
            grupoID = 0;
            break;
          case "float":
            grupoID = 10;
            break;
          default:
            grupoID = 12;
            break;
        }
        // const grupoID = element.tipoDatoSQL.includes("bit") ? 0 : 10;
        varOPCUA +=
          " (" +
          element.id +
          ", " +
          plc +
          ", NULL," +
          grupoID +
          ", '/Objects/3:ServerInterfaces/4:Server-Decco/4:" +
          nombre +
          "-" +
          nombreLinea +
          element.ruta +
          "')";
        await pool2.request().query(varAdqValues);
        await pool2.request().query(varBD);
        await pool2.request().query(varOPCUA);
      }
    } catch (error) {
      console.log(error);
    }
  },
  actualizar: async (req) => {
    const { id, activo } = req.body;
    try {
      const pool2 = await conectarBD();
      const consulta = consultas.maquinas.actualizar(id, activo);
      await pool2.request().query(consulta);
    } catch (error) {
      console.log(error);
    }
  },
  borrar: async (req) => {
    const { id, modelo } = req.body;
    try {
      const pool2 = await conectarBD();
      const consulta = consultas.maquinas.borrar(id);
      const consultaBD = consultas.variables.borrarVariablesBD(id);
      const consultaOPCUA = consultas.variables.borrarVariablesOPCUA(id);
      const consultadquisicionId = consultas.adquisiciones.porMaquinaID(
        id,
        modelo
      );
      const adquisicionId = await pool2.request().query(consultadquisicionId);
      const consultaVAarADQ =
        consultas.adquisiciones.borrarVariablesAdquisiciones(adquisicionId);
      const consultaADQ = consultas.variables.borrarPorMaquinaID(id);
      const consultaVar = consultas.variables.borrar(id);

      await pool2.request().query(consulta);
      await pool2.request().query(consultaBD);
      await pool2.request().query(consultaOPCUA);
      await pool2.request().query(consultaVAarADQ);
      await pool2.request().query(consultaADQ);
      await pool2.request().query(consultaVar);
    } catch (error) {
      console.log(error);
    }
  },
};
