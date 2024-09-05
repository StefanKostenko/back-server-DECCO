const { conectarBD, consultas } = require("../bd");
module.exports = {
  leer: async (req, res) => {
    const { id, clienteID } = req.params;
    const consulta = id
      ? consultas.lineas.leer(id)
      : consultas.lineas.todos(clienteID);
    try {
      const pool2 = await conectarBD();
      const registros = await pool2.request().query(consulta);
      res.send(registros.recordset);
    } catch (error) {
      console.log(error);
    }
  },
  nuevo: async (req, res) => {
    const { nombre, clienteID, maquinas } = req.body;
    try {
      if (nombre) {
        //TODO CREAR UNA MAQUINA
        //INSERT ADQUISICIONES
        const pool2 = await conectarBD();
        const consultaLinea = consultas.lineas.nuevo(nombre, clienteID);
        const registros = await pool2.request().query(consultaLinea);
        const lineaID = registros.recordset[0].id;
        for (let i = 0; i < maquinas.length; i++) {
          //MAQUINA
          const consultaMaquina = consultas.maquinas.nuevo(
            maquinas[i].nombre,
            clienteID + "-" + nombre + "-" + maquinas[i].nombre,
            clienteID + "-" + nombre + "-" + maquinas[i].nombre,
            1,
            clienteID,
            lineaID,
            maquinas[i].tipo
          );
          // consultaMaquina = consultas.maquinas.nuevo(maquinas[i].nombre, clienteID+"-"+nombre+"-"+maquinas[i].nombre,  clienteID+"-"+nombre+"-"+maquinas[i].nombre, 1, clienteID, null, maquinas[i].tipo);
          const maquinaID = (await pool2.request().query(consultaMaquina))
            .recordset[0].id;
          //MODELO
          const insertarModelo = consultas.configuracionMaquinas.insertModelo(
            maquinaID,
            maquinas[i].tipo
          );
          await pool2.request().query(insertarModelo);
          //GRUPO
          const consultaG1 = consultas.variables.variablesMaquinaGrupo(
            maquinaID,
            maquinas[i].tipo
          );
          const variableArray = (await pool2.request().query(consultaG1))
            .recordset;
          //ADQUISICION
          let trigger = 0;
          switch (maquinas[i].tipo) {
            case 1:
            case 2:
            case 3:
              trigger = variableArray[0].id;
              break;
            default:
              break;
          }

          const adquisicionConsulta = consultas.adquisiciones.nuevo(
            "ADQUISICION",
            clienteID + "-" + maquinas[i].nombre + "-" + nombre,
            trigger
          );
          const adquisicionID = (
            await pool2.request().query(adquisicionConsulta)
          ).recordset[0].id;
          const plcConsulta = consultas.plcs.leerCliente(clienteID);
          const plc = (await pool2.request().query(plcConsulta)).recordset[0]
            .id;
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
              maquinas[i].nombre +
              "-" +
              nombre +
              "', '" +
              element.columnaAdquisicion +
              "')";
            const grupoID = element.tipoDatoSQL.includes("bit") ? 0 : 10;
            varOPCUA +=
              " (" +
              element.id +
              ", " +
              plc +
              ", NULL," +
              grupoID +
              ", '/Objects/3:ServerInterfaces/4:Server-Decco/4:" +
              maquinas[i].nombre +
              "-" +
              nombre +
              element.ruta +
              "')";
            await pool2.request().query(varAdqValues);
            await pool2.request().query(varBD);
            await pool2.request().query(varOPCUA);
          }
        }
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
        const consulta = consultas.lineas.borrar(id);
        const pool2 = await conectarBD();
        (await pool2.request().query(consulta)).recordset;
      }
    } catch (error) {
      console.log(error);
    }
  },
  actualizar: async (req) => {
    const { id, nombre, maquinas } = req.body;
    try {
      if (id && nombre) {
        const consulta = consultas.lineas.actualizar(id, nombre);
        const pool2 = await conectarBD();
        await pool2.request().query(consulta);
        if (maquinas) {
          const lineaConsulta = consultas.maquinas.leerLinea(id);
          const lineas = (await pool2.request().query(lineaConsulta)).recordset;
          for (const index = 0; index < maquinas.length; index++) {
            const element = maquinas[index];
            const maquina = lineas.find((v) => v.grupoID == element.tipo);
            if (maquina) {
              const consulta = consultas.maquinas.actualizar(
                maquina.id,
                element.activo
              );
              await pool2.request().query(consulta);
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  },
};
