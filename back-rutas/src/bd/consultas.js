const { isNullorUndefined } = require("../auxiliares/utils");

module.exports = {
  configuracion: {
    servidoresOPCUA: `SELECT 
                id, 
                ip, 
                puerto, 
                usuario, 
                password, 
                tipo, 
                descripcion 
            FROM [CONFIGURACION].[dbo].[PLC_OPCUA] 
            WHERE activo = 1`,

    maquinas: `SELECT
                [id]
                ,[codigo]
                ,[nombre]
                ,[descripcion]
                ,[activa]
                ,[clienteID]
                ,[lineaID]
                ,[grupoID]
            FROM [CONFIGURACION].[dbo].[MAQUINAS]
            WHERE [activa] = 1
            `,

    adquisiciones: `SELECT 
                id, 
                [nombreBD], 
                [nombreTabla], 
                frecuenciaRegistro, 
                valorInicio, 
                valorFin, 
                valorRespuesta, 
                diasRetenidos, 
                triggerID 
            FROM [CONFIGURACION].[dbo].[ADQUISICIONES]
            WHERE activa = 1`,

    variablesAdquisiciones: `SELECT 
                VA.id, 
                VA.variableID, 
                VA.adquisicionID 
            FROM [CONFIGURACION].[dbo].[VARIABLES_ADQUISICIONES] as VA
            INNER JOIN [CONFIGURACION].[dbo].[ADQUISICIONES] as A
                ON A.id = VA.adquisicionID
            WHERE A.activa = 1`,

    variablesOPCUA: `SELECT 
                V.id,  
                V.tipoDatoSQL, 
                V.operacionID, 
                V.unidadMedida,
                V.columnaAdquisicion, 
                V.factorConversion,
                V.nombreCorto,
                V.descripcion, 
                GV.descripcion as grupo,
                V.tiempoReal,
                V.visualizar,
                V.maquinaID,
                V.modelo,
                VBD.BD, 
                VBD.tabla, 
                VBD.columna,
                VUA.plcOpcuaID, 
                VUA.nodeID, 
                VUA.tipoDatoOpcuaID,
                VUA.ruta
            FROM [CONFIGURACION].[dbo].[VARIABLES] AS V
            RIGHT JOIN [CONFIGURACION].[dbo].[VARIABLES_OPCUA] AS VUA
                ON V.id = VUA.variableID
            RIGHT JOIN [CONFIGURACION].[dbo].[VARIABLES_BD] AS VBD
                ON V.id = VBD.variableID   
            INNER JOIN [CONFIGURACION].[dbo].[GRUPOS_VARIABLES] AS GV
                ON V.grupoID = GV.id
            WHERE V.activo = 1`,

    insertarOPCUA: (variableOPCUA) => {
      return `INSERT INTO [CONFIGURACION].[dbo].[VARIABLES_OPCUA]
            ([id], [variableID], [plcOpcuaID], [nodeID], [tipoDatoOpcuaID])
            VALUES
            ('${variableOPCUA.id}', ${variableOPCUA.variableID},${variableOPCUA.plcID}, ${variableOPCUA.nodeID}, ${variableOPCUA.tipoID} )`;
    },

    insertarVariable: (variable) => {
      return `INSERT INTO [CONFIGURACION].[dbo].[VARIABLES]
            ( [id]
                ,[tipoDatoSQL]
                ,[operacionID]
                ,[unidadMedida]
                ,[factorConversion]
                ,[columnaAdquisicion]
                ,[nombreCorto]
                ,[descripcion]
                ,[grupoID]
                ,[tiempoReal]
                ,[visualizar]
                ,[activo])
            VALUES
            ('${variable.id}', ${variable.tipoDatoSQL},${variable.operacionID},${variable.unidadMedida}, ${variable.factorConversion}, ${variable.columnaAdquisicion},
             ${variable.nombreCorto}, ${variable.descripcion}, ${variable.grupoID}, ${variable.tiempoReal}, ${variable.visualizar}, ${variable.activo} )`;
    },
  },
  bd: {
    existeBD: (nombreBD) => {
      return `SELECT name FROM master.sys.databases WHERE name = N'${nombreBD}'`;
    },
    nuevaBD: (nombreBD) => {
      return `CREATE DATABASE ${nombreBD}`;
    },

    existeTabla: (nombreBD, nombreTabla) => {
      return `SELECT TABLE_NAME FROM ${nombreBD}.INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '${nombreTabla}'`;
    },
    nuevaTabla: (nombreBD, nombreTabla, variables) => {
      let base = `CREATE TABLE [${nombreBD}].dbo.[${nombreTabla}] (`;
      let columnas = `id int IDENTITY(1,1) PRIMARY KEY NOT NULL, fecha datetime default GETDATE() NOT NULL, `;
      for (let va of variables) {
        columnas += `${va.columnaAdquisicion} ${va.tipoDatoSQL} NULL, `;
      }
      let consulta = base + columnas.slice(0, -2) + " )";
      return consulta;
    },
    nuevaTablaAlarmas: (nombreBD, nombreTabla, columnasAlarmas) => {
      let base = `CREATE TABLE [${nombreBD}].dbo.[${nombreTabla}] (`;
      let columnas = `id int IDENTITY(1,1) PRIMARY KEY NOT NULL, `;
      for (let colAlarma of columnasAlarmas) {
        columnas += `${colAlarma.nombreColumna} ${colAlarma.tipoDatoSQL} NULL, `;
      }
      let consulta = base + columnas.slice(0, -2) + " )";
      return consulta;
    },
    existeColumna: (nombreBD, nombreTabla, nombreColumna) => {
      return `SELECT COLUMN_NAME FROM ${nombreBD}.INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${nombreTabla}' AND COLUMN_NAME = '${nombreColumna}'`;
    },
    nuevaColumna: (
      nombreBD,
      nombreTabla,
      nombreColumna,
      tipo,
      autoincremento = null,
      clavePrimaria = null,
      valorDefault = null
    ) => {
      let consulta = `ALTER TABLE ${nombreBD}.dbo.[${nombreTabla}] ADD ${nombreColumna} ${tipo} `;
      if (autoincremento !== null) {
        consulta += "IDENTITY(1,1) ";
      }
      if (clavePrimaria !== null) {
        consulta += "PRIMEARY KEY ";
      }
      if (valorDefault !== null) {
        consulta += `DEFAULT(${valorDefault}) `;
      }
      if (clavePrimaria === null && valorDefault === null) {
        consulta += "NULL";
      } else {
        consulta += "NOT NULL";
      }
      return consulta;
    },
  },
  configuracionMaquinas: {
    insertarVariablesAdquisiciones: (variableID, adquisicionID) => {
      return `INSERT INTO [CONFIGURACION].[dbo].[VARIABLES_AQUISICIONES]
                ([variableID], [adquisicionID])
                VALUES
                ('${variableID}','${adquisicionID}')`;
    },
    insertarVariablesBD: (variableID, BD, tabla, columna) => {
      return `INSERT INTO [CONFIGURACION].[dbo].[VARIABLES_BD]
                ([variableID]
                    ,[BD]
                    ,[tabla]
                    ,[columna])
                VALUES
                ('${variableID}','${BD}', '${tabla}', '${columna}')`;
    },
    insertModelo: (maquinaID, id) => {
      return `INSERT INTO [CONFIGURACION].[dbo].[VARIABLES] ([tipoDatoSQL]
              ,[operacionID]
              ,[unidadMedida]
              ,[factorConversion]
              ,[columnaAdquisicion]
              ,[nombreCorto]
              ,[descripcion]
              ,[grupoID]
              ,[tiempoReal]
              ,[visualizar]
              ,[maquinaID]
              ,[modelo]
              ,[activo]
              ,[ruta]) 
          SELECT [tipoDatoSQL]
              ,[operacionID]
              ,[unidadMedida]
              ,[factorConversion]
              ,[columnaAdquisicion]
              ,[nombreCorto]
              ,[descripcion]
              ,[grupoID]
              ,[tiempoReal]
              ,[visualizar]
              ,${maquinaID}
              ,[id]
              ,[activo]
              ,[ruta] FROM  [CONFIGURACION].[dbo].[MODELO_VARIABLES]
          WHERE [grupoID] = ${id}`; 
    },
  },
  adquisicion: {
    insertarRegistro: async (adquisicion, variables, conexionesPLC) => {
      let baseQuery = `INSERT INTO ${adquisicion.nombreBD}.dbo.[${adquisicion.nombreTabla}] `;
      let columnas = "(";
      let valores = "VALUES (";
      let consulta = "";

      if (variables.length > 0) {
        let trigger = variables.find((v) => v.id == adquisicion.triggerID);
        for (let va of variables) {
          let conexion = conexionesPLC.find((c) => c.id == va.plcOpcuaID);

          let valor = !isNullorUndefined(va.nodeID)
            ? await conexion.readSingleValue(va.nodeID)
            : await conexion.readSingleValue(
                await conexion.traducirRutaANodeID(va.ruta, conexion.session)
              );
          if (
            trigger &&
            va.id == trigger.id &&
            trigger.valorActual != adquisicion.valorInicio
          ) {
            return null;
          }
          columnas += va.columnaAdquisicion + ", ";
          let valorAdquirir = va.tipoDatoSQL.includes("nvarchar")
            ? `'${valor === "" ? 0 : valor}', `
            : Math.round(valor * va.factorConversion * 100) / 100 + ", ";
          valores += valorAdquirir;
        }
        columnas = columnas.slice(0, -2) + ") ";
        valores = valores.slice(0, -2) + ")";
        consulta = baseQuery + columnas + valores;
      }
      return consulta;
    },

    eliminarRegistros: (adquisicion) => {
      return `
                DELETE FROM [${adquisicion.nombreBD}].[dbo].[${adquisicion.nombreTabla}]
                WHERE [fecha] < DATEADD(DAY, -${adquisicion.diasRetenidos}, GETDATE())
            `;
    },

    periodo: (nombreTabla, nombreColumna, desde, hasta) => {
      return `
                SELECT [fecha], [${nombreColumna}]
                FROM [ADQUISICION].[dbo].[${nombreTabla}]
                WHERE [fecha] > '${desde}' AND [fecha] < '${hasta}'
            `;
    },

    ultimoRegistro: (tabla) => {
      return `
                SELECT TOP(1) *
                FROM [ADQUSICION].[dbo].[${tabla}]
                ORDER BY [fecha] DESC
                `;
    },
  },

  usuarios: {
    login: (usuario, password) => {
      return `
                SELECT 
                  U.id,
                  U.usuario,
                  U.nombre,
                  U.rol,
                  US.clienteID
                FROM [CONFIGURACION].[dbo].[USUARIOS] AS U
                INNER JOIN [CONFIGURACION].[dbo].[USUARIOS_CLIENTES] AS US
                  ON U.id = US.usuarioID
                WHERE U.usuario = @usuario AND U.password = @password
            `;
    },

    permisos: (usuarioID) => {
      let consulta = `
                SELECT
                    [ruta]
                FROM [CONFIGURACION].[dbo].[PERMISOS_USUARIOS]
                WHERE [userID] = ${usuarioID}
            `;
      return consulta;
    },

    nuevo: (usuario, nombre, password, rol) => {
      return `INSERT INTO [CONFIGURACION].[dbo].[USUARIOS] (
                    [usuario]
                    ,[password]
                    ,[nombre]
                    ,[rol])   
                OUTPUT INSERTED.id
                VALUES ('${usuario}','${password}','${nombre}','${rol}')
            `;
    },

    usuarioCliente: (usuarioID, clienteID) => {
      return `INSERT INTO [CONFIGURACION].[dbo].[USUARIOS_CLIENTES]
                      (usuarioID, clienteID)
                  VALUES (${usuarioID}, ${
        clienteID !== null && clienteID !== undefined ? `${clienteID}` : "NULL"
      })`;
    },

    actualizar: (id, nombre, usuario, password, rol) => {
      return `UPDATE [CONFIGURACION].[dbo].[USUARIOS]
                SET [nombre] = '${nombre}',
                    [usuario] = '${usuario}',
                    [password] = '${password}',
                    [rol] = '${rol}'
                    WHERE [id] = ${id}`;
    },
    borrarUsuario: (id) => {
      return `DELETE FROM [CONFIGURACION].[dbo].[USUARIOS]
                  WHERE [id] = ${id}`;
    },
    borrarClienteUsuario: (usuarioID, clienteID) => {
      return `DELETE FROM [CONFIGURACION].[dbo].[USUARIOS_CLIENTES]
                  WHERE [usuarioID] = ${usuarioID} AND [clienteID] = ${clienteID}`;
    },
    borrarUsuarioClientes: (id) => {
      return `DELETE FROM [CONFIGURACION].[dbo].[USUARIOS_CLIENTES]
                  WHERE [usuarioID] = ${id}`;
    },
    borrarPermisosUsuarioCliente: (id) => {
      return `BEGIN TRANSACTION;
      
              DELETE FROM [PERMISOS_USUARIOS_DECCOWASHER]
              WHERE usuarioID = ${id}
              
              DELETE FROM [PERMISOS_USUARIOS_DECCODAF]
              WHERE usuarioID = ${id}

              DELETE FROM [PERMISOS_USUARIOS_DECCODOS]
              WHERE usuarioID = ${id}

              COMMIT;`;
    },
    clienteID: (clienteID) => {
      return `SELECT 
                U.id,
                U.usuario,
                U.rol
                FROM [CONFIGURACION].[dbo].[USUARIOS] AS U
                INNER JOIN [CONFIGURACION].[dbo].[USUARIOS_CLIENTES] AS US
                  ON U.id = US.usuarioID
                WHERE US.clienteID = ${clienteID} AND U.rol = 'Cliente'`;
    },
    comprobarUsuarioClieteID: (usuarioID) => {
      return `SELECT 
                [clienteID]
                FROM [CONFIGURACION].[dbo].[USUARIOS_CLIENTES]
                WHERE [usuarioID] = ${usuarioID}`;
    },
    leerTodos: () => {
      return `SELECT 
                U.id,
                U.usuario,
                U.nombre,
                U.rol,
                US.clienteID
            FROM [CONFIGURACION].[dbo].[USUARIOS] AS U
            INNER JOIN [CONFIGURACION].[dbo].[USUARIOS_CLIENTES] AS US
              ON U.id = US.usuarioID
          `;
    },
    leerPermisosUsuarioDECCOWASHER: (usuarioID) => {
      return `SELECT *
              FROM [CONFIGURACION].[dbo].[PERMISOS_USUARIOS_DECCOWASHER]
              WHERE usuarioID = ${usuarioID}`;
    },
    leerPermisosUsuarioDECCODAF: (usuarioID) => {
      return `SELECT *
              FROM [CONFIGURACION].[dbo].[PERMISOS_USUARIOS_DECCODAF]
              WHERE usuarioID = ${usuarioID}`;
    },
    leerPermisosUsuarioDECCODOS: (usuarioID) => {
      return `SELECT *
              FROM [CONFIGURACION].[dbo].[PERMISOS_USUARIOS_DECCODOS]
              WHERE usuarioID = ${usuarioID}`;
    },
    insertarPermisosUsuarioDefault: (usuarioID) => {
      return `BEGIN TRANSACTION;
      
              INSERT INTO [CONFIGURACION].[dbo].[PERMISOS_USUARIOS_DECCOWASHER]
                (usuarioID, loteJabon, loteDesinfectante, estado, alarmas, usuario, dosis, kilosCalibrador, estadoBombas)
                VALUES (${usuarioID}, 1, 1, 1, 1, 1, 1, 1, 1)
              
              INSERT INTO [CONFIGURACION].[dbo].[PERMISOS_USUARIOS_DECCODAF]  
                (usuarioID, loteFungicida, estado, alarmas, estadoNivelGarrafas, usuario, reposiciones, dosis, kilosCalibrador)
                VALUES (${usuarioID}, 1, 1, 1, 1, 1, 1, 1, 1)

              INSERT INTO [CONFIGURACION].[dbo].[PERMISOS_USUARIOS_DECCODOS]
                (usuarioID, lotesFungicida, estado, usuario, dosis, kilosCalibrador, activacionCepillos)
                VALUES (${usuarioID}, 1, 1, 1, 1, 1, 1)

              COMMIT`;
    },
    actualizarPermisosUsuarioDECCOWASHER: (
      usuarioID,
      loteJabon,
      loteDesinfectante,
      estado,
      alarmas,
      usuario,
      dosis,
      kilosCalibrador,
      estadoBombas
    ) => {
      return `UPDATE [CONFIGURACION].[dbo].[PERMISOS_USUARIOS_DECCOWASHER]
                  SET loteJabon = ${loteJabon},
                      loteDesinfectante = ${loteDesinfectante},
                      estado = ${estado},
                      alarmas = ${alarmas},
                      usuario = ${usuario},
                      dosis = ${dosis},
                      kilosCalibrador = ${kilosCalibrador},
                      estadoBombas = ${estadoBombas}
                  WHERE usuarioID = ${usuarioID}`;
    },
    actualizarPermisosUsuarioDECCODAF: (
      usuarioID,
      loteFungicida,
      estado,
      alarmas,
      estadoNivelGarrafas,
      usuario,
      reposiciones,
      dosis,
      kilosCalibrador
    ) => {
      return `UPDATE [CONFIGURACION].[dbo].[PERMISOS_USUARIOS_DECCODAF]
                  SET loteFungicida = ${loteFungicida},
                      estado = ${estado},
                      alarmas = ${alarmas},
                      estadoNivelGarrafas = ${estadoNivelGarrafas},
                      usuario = ${usuario},
                      reposiciones = ${reposiciones},
                      dosis = ${dosis},
                      kilosCalibrador = ${kilosCalibrador}
                  WHERE usuarioID = ${usuarioID}`;
    },
    actualizarPermisosUsuarioDECCODOS: (
      usuarioID,
      lotesFungicida,
      estado,
      usuario,
      dosis,
      kilosCalibrador,
      activacionCepillos
    ) => {
      return `UPDATE [CONFIGURACION].[dbo].[PERMISOS_USUARIOS_DECCODOS]
                  SET lotesFungicida = ${lotesFungicida},
                      estado = ${estado},
                      usuario = ${usuario},
                      dosis = ${dosis},
                      kilosCalibrador = ${kilosCalibrador},
                      activacionCepillos = ${activacionCepillos}
                  WHERE usuarioID = ${usuarioID}`;
    },
  },

  variables: {
    variablesGrupo: (grupoID) => {
      return `SELECT * FROM [CONFIGURACION].[dbo].[VARIABLES] WHERE [grupoID] = '${grupoID}' `;
    },
    variablesMaquinaGrupo: (maquinaID, grupoID) => {
      return `SELECT * FROM [CONFIGURACION].[dbo].[VARIABLES] WHERE [grupoID] = '${grupoID}' AND [maquinaID] = '${maquinaID}'`;
    },
    periodo: (bd, tabla, columna, inicio) => {
      let consulta = `
                SELECT
                    [fecha] as x
                    ,ROUND([${columna}], 2) as y
                FROM [${bd}].[dbo].[${tabla}]
                WHERE [fecha] > '${inicio}' 
                ORDER BY [fecha] ASC
            `;

      return consulta;
    },

    periodoString: (bd, tabla, columna, inicio) => {
      let consulta = `
                SELECT
                    [fecha] as x
                    ,[${columna}] as y
                FROM [${bd}].[dbo].[${tabla}]
                WHERE [fecha] > '${inicio}' 
                ORDER BY [fecha] ASC
            `;

      return consulta;
    },

    periodoVariables: (bd, tabla, columna, inicio) => {
      let consulta = `
                SELECT
                    [fecha] as x
                    ,${columna}
                FROM [${bd}].[dbo].[${tabla}]
                WHERE [fecha] > '${inicio}' 
                ORDER BY [fecha] ASC
            `;

      return consulta;
    },

    periodoHistoricoVariables: (bd, tabla, columna, inicio, fin) => {
      let consulta = `
                SELECT
                    [fecha] as x
                    ,${columna}
                FROM [${bd}].[dbo].[${tabla}]
                WHERE [fecha] > '${inicio}' AND [fecha] < '${fin}'
            `;

      return consulta;
    },

    ultimoDisponible: (bd, tabla, columna, inicio) => {
      let consulta = `
                SELECT TOP (1)
                    [fecha] as x
                    ,ROUND([${columna}], 2) as y
                FROM [${bd}].[dbo].[${tabla}]
                WHERE [fecha] > '${inicio}'
                ORDER BY [fecha] DESC
            `;
      return consulta;
    },
    ultimoDisponibleString: (bd, tabla, columna, inicio) => {
      let consulta = `
                SELECT TOP (1)
                    [fecha] as x
                    ,[${columna}] as y
                FROM [${bd}].[dbo].[${tabla}]
                WHERE [fecha] > '${inicio}'
                ORDER BY [fecha] DESC
            `;
      return consulta;
    },
    primeroDisponible: (bd, tabla, columna, inicio) => {
      let consulta = `
                SELECT TOP (1)
                    [fecha] as x
                    ,ROUND([${columna}], 2) as y
                FROM [${bd}].[dbo].[${tabla}]
                WHERE [fecha] > '${inicio}'
                ORDER BY [fecha] ASC
            `;
      return consulta;
    },

    historico: (bd, tabla, columna, inicio, fin) => {
      let consulta = `
                SELECT
                    [fecha] as x
                    ,ROUND([${columna}], 2) as y
                FROM [${bd}].[dbo].[${tabla}]
                WHERE [fecha] > '${inicio}' AND [fecha] < '${fin}'
                ORDER BY [fecha] ASC
            `;
      return consulta;
    },

    historicoString: (bd, tabla, columna, inicio, fin) => {
      let consulta = `
                SELECT
                    [fecha] as x
                    ,[${columna}] as y
                FROM [${bd}].[dbo].[${tabla}]
                WHERE [fecha] > '${inicio}' AND [fecha] < '${fin}'
                ORDER BY [fecha] ASC
            `;
      return consulta;
    },

    media: (bd, tabla, columna, inicio) => {
      let consulta = `
                SELECT
                    AVG([${columna}]) as media
                FROM [${bd}].[dbo].[${tabla}]
                WHERE [fecha] > '${inicio}'
            `;
      return consulta;
    },
    count: (bd, tabla, columna, inicio, value) => {
      let consulta = `
                SELECT
                    COUNT(*) as count
                FROM [${bd}].[dbo].[${tabla}]
                WHERE [fecha] > '${inicio}' AND [${columna}] = ${value}
            `;
      return consulta;
    },
    suma: (bd, tabla, columna, inicio) => {
      let consulta = `
                SELECT
                    SUM([${columna}]) as total
                FROM [${bd}].[dbo].[${tabla}]
                WHERE [fecha] > '${inicio}'
            `;
      return consulta;
    },
    // select:(bd,select,tabla, where) =>{
    //     let consulta = `
    //         SELECT
    //             ${select}
    //         FROM [${bd}].[dbo].[${tabla}]
    //         WHERE '${where}'
    //     `;
    //     return consulta;
    // }
    mediaHistorica: (bd, tabla, columna, inicio, fin) => {
      let consulta = `
                SELECT
                    AVG([${columna}]) as media
                FROM [${bd}].[dbo].[${tabla}]
                WHERE [fecha] > '${inicio}' AND [fecha] < '${fin}'
            `;
      return consulta;
    },
    countHistorica: (bd, tabla, columna, inicio, fin, value) => {
      let consulta = `
                SELECT
                    COUNT(*) as count
                FROM [${bd}].[dbo].[${tabla}]
                WHERE [fecha] > '${inicio}'  AND [fecha] < '${fin} AND [${columna}] = ${value}
            `;
      return consulta;
    },
    totalHistorica: (bd, tabla, columna, inicio, fin) => {
      let consulta = `
                SELECT
                    SUM([${columna}]) as total
                FROM [${bd}].[dbo].[${tabla}]
                WHERE [fecha] > '${inicio}' AND [fecha] < '${fin}'
            `;
      return consulta;
    },
    ultimoDisponibleHistorica: (bd, tabla, columna, inicio, fin) => {
      let consulta = `
                SELECT TOP (1)
                    [fecha] as x
                    ,ROUND([${columna}], 2) as y
                FROM [${bd}].[dbo].[${tabla}]
                WHERE [fecha] > '${inicio}' AND [fecha] < '${fin}'
                ORDER BY [fecha] DESC
            `;
      return consulta;
    },
    ultimoDisponibleHistoricaString: (bd, tabla, columna, inicio, fin) => {
      let consulta = `
                SELECT TOP (1)
                    [fecha] as x
                    ,[${columna}] as y
                FROM [${bd}].[dbo].[${tabla}]
                WHERE [fecha] > '${inicio}' AND [fecha] < '${fin}'
                ORDER BY [fecha] DESC
            `;
      return consulta;
    },
    primeroDisponibleHistorica: (bd, tabla, columna, inicio, fin) => {
      let consulta = `
                SELECT TOP (1)
                    [fecha] as x
                    ,ROUND([${columna}], 2) as y
                FROM [${bd}].[dbo].[${tabla}]
                WHERE [fecha] > '${inicio}' AND [fecha] < '${fin}'
                ORDER BY [fecha] ASC
            `;
      return consulta;
    },
    totalHistorico: (bd, tabla, columna, inicio, fin) => {
      return `SELECT (
                SELECT TOP(1) [${columna}] FROM [${bd}].[dbo].[${tabla}] 
                WHERE [fecha] > '${inicio}' AND [fecha] < '${fin}'
                ORDER BY [fecha] DESC) - (
                    SELECT TOP(1) [${columna}] FROM [${bd}].[dbo].[${tabla}] 
                    WHERE [fecha] > '${inicio}' ORDER BY [fecha])  AS total`;
    },
    totalAcc: (bd, tabla, columna, inicio) => {
      return `SELECT (
                SELECT TOP(1) [${columna}] FROM [${bd}].[dbo].[${tabla}] 
                ORDER BY [fecha] DESC) - (
                    SELECT TOP(1) [${columna}] FROM [${bd}].[dbo].[${tabla}] 
                    WHERE [fecha] > '${inicio}' ORDER BY [fecha])  AS total`;
    },
    modeloVariables: (id) => {
      return `SELECT [id]
                    ,[tipoDatoSQL]
                    ,[operacionID]
                    ,[unidadMedida]
                    ,[factorConversion]
                    ,[columnaAdquisicion]
                    ,[nombreCorto]
                    ,[descripcion]
                    ,[grupoID]
                    ,[tiempoReal]
                    ,[visualizar]
                    ,[activo]
                    ,[ruta]
            FROM [CONFIGURACION].[dbo].[MODELO_VARIABLES]
            WHERE [grupoID] = ${id}`;
    },
    borrarVariablesOPCUA: (maquinaID) => {
      return `DELETE FROM [CONFIGURACION].[dbo].[VARIABLES_OPCUA]
                WHERE [variableID] IN 
                ( SELECT id
                  FROM [CONFIGURACION].[dbo].[VARIABLES]
                  WHERE [maquinaID] = ${maquinaID})`;
    },
    borrar: (id) => {
      return `DELETE FROM [CONFIGURACION].[dbo].[VARIABLES]
                WHERE [maquinaID] = ${id}`;
    },
    borrarVariablesBD: (maquinaID) => {
      return `DELETE FROM [CONFIGURACION].[dbo].[VARIABLES_BD]
                WHERE [variableID] IN 
                ( SELECT id
                  FROM [CONFIGURACION].[dbo].[VARIABLES]
                  WHERE [maquinaID] = ${maquinaID})`;
    },
    // distincts: (bd, tabla, columna) => {
    //   return `SELECT DISTINCT ${columna} FROM [${bd}].[dbo].[${tabla}]`;
    // },
    distintos: (bd, tabla, columna) => {
      let consulta = `SELECT DISTINCT [${columna}] FROM [${bd}].[dbo].[${tabla}] WHERE [${columna}] IS NOT NULL`;
      return consulta;
    },
    distinctsDate: (bd, tabla, columna, inicio, fin) => {
      return `SELECT DISTINCT ${columna}
          FROM [${bd}].[dbo].[${tabla}]
          WHERE [fecha] > '${inicio}' AND [fecha] < '${fin}'`;
    },
    inicioFin: (bd, tabla, columna, valor) => {
      return `
        SELECT [clienteID]
          ,[maquinaID]
          ,[kilos]
          ,[tolerancia]
          ,[fecha]
        FROM (
            SELECT TOP 1 *
            FROM [${bd}].[dbo].[${tabla}]
            WHERE ${columna} LIKE '${valor}'
            ORDER BY fecha ASC
        ) AS first_record
        UNION ALL
        SELECT *
        FROM (
            SELECT TOP 1 *
            FROM [${bd}].[dbo].[${tabla}]
            WHERE ${columna} LIKE '${valor}'
            ORDER BY fecha DESC
        ) AS last_record;
      `;
    },
  },
  maquinas: {
    leer: (id) => {
      return `SELECT
                [id]
                ,[codigo]
                ,[nombre]
                ,[descripcion]
                ,[clienteID]
                ,[lineaID]
                ,[grupoID]
                ,[activa]
            FROM [CONFIGURACION].[dbo].[MAQUINAS]
            WHERE [id] = ${id}
            `;
    },
    leerCliente: (clienteID) => {
      return `SELECT
                [id]
                ,[codigo]
                ,[nombre]
                ,[descripcion]
                ,[activa]
                ,[clienteID]
                ,[lineaID]
                ,[grupoID]
        FROM [CONFIGURACION].[dbo].[MAQUINAS]
        WHERE [clienteID] = ${clienteID}
        `;
    },
    leerLinea: (id) => {
      return `SELECT
                [id]
                ,[codigo]
                ,[nombre]
                ,[descripcion]
                ,[clienteID]
                ,[lineaID]
                ,[grupoID]
                ,[activa]
            FROM [CONFIGURACION].[dbo].[MAQUINAS]
            WHERE [lineaID] = ${id}
            `;
    },
    leerLineaGrupo: (id, grupoID) => {
      return `SELECT
            [id]
            ,[codigo]
            ,[nombre]
            ,[descripcion]
            ,[clienteID]
            ,[lineaID]
            ,[grupoID]
            ,[activa]
        FROM [CONFIGURACION].[dbo].[MAQUINAS]
        WHERE [lineaID] = ${id} AND [grupoID] = ${grupoID}
        `;
    },
    leerClienteTipo: (clienteID, grupoID) => {
      return `SELECT
            [id]
            ,[codigo]
            ,[nombre]
            ,[descripcion]
            ,[clienteID]
            ,[lineaID]
            ,[grupoID]
            ,[activa]
        FROM [CONFIGURACION].[dbo].[MAQUINAS]
        WHERE [clienteID] = ${clienteID} 
            AND [grupoID] = ${grupoID}`;
    },
    nuevo: (
      codigo,
      nombre,
      descripcion,
      activa,
      clienteID,
      lineaID,
      grupoID
    ) => {
      return `INSERT INTO [CONFIGURACION].[dbo].[MAQUINAS]
            ([codigo],[nombre],[descripcion],[activa],[clienteID],[lineaID],[grupoID])
            OUTPUT Inserted.id
            VALUES('${codigo}', '${nombre}','${descripcion}', ${activa}, ${clienteID}, ${lineaID}, ${grupoID})
        `;
    },
    actualizar: (id, activo) => {
      return `UPDATE [CONFIGURACION].[dbo].[MAQUINAS]
                SET [activa] = '${activo}'
                    WHERE [id] = ${id}`;
    },
    borrar: (id) => {
      return `DELETE FROM [CONFIGURACION].[dbo].[MAQUINAS]
                WHERE [id] = ${id}`;
    },
  },

  clientes: {
    leer: (id) => {
      return `SELECT *
            FROM [CONFIGURACION].[dbo].[CLIENTES]
            WHERE id = ${id}
            `;
    },
    todos: () => {
      return `SELECT *
            FROM [CONFIGURACION].[dbo].[CLIENTES]
            WHERE activo = 1
        `;
    },
    nuevo: (nombre, src) => {
      return `INSERT INTO [CONFIGURACION].[dbo].[CLIENTES]
                ([nombre],
                [img],
                [activo])
            OUTPUT Inserted.id
            VALUES('${nombre}', '${src}', 1)
                `;
    },
    borrar: (id) => {
      return `DELETE FROM [CONFIGURACION].[dbo].[CLIENTES]
                WHERE [id] = ${id}`;
    },
    actualizar: (id, nombre, src) => {
      return `UPDATE [CONFIGURACION].[dbo].[CLIENTES]
                SET [nombre] = '${nombre}',
                    [img] = '${src}'
                  WHERE [id] = ${id}`;
    },
  },
  plcs: {
    leer: (id) => {
      return `SELECT
                [id],
                 [ip]
                ,[puerto]
                ,[usuario]
                ,[password]
                ,[descripcion]
                ,[clienteID]
            FROM [CONFIGURACION].[dbo].[PLC_OPCUA]
            WHERE id = ${id}
        `;
    },
    leerCliente: (id) => {
      return `SELECT
                [id],
                [ip]
                ,[puerto]
                ,[usuario]
                ,[password]
                ,[descripcion]
            FROM [CONFIGURACION].[dbo].[PLC_OPCUA]
            WHERE [clienteID] = ${id}
        `;
    },
    nuevo: (ip, puerto, usuario, password, descripcion, clienteID) => {
      //TODO CAMBIAR EN PROD A 1
      return `INSERT INTO [CONFIGURACION].[dbo].[PLC_OPCUA]
                ([ip]
                    ,[puerto]
                    ,[usuario]
                    ,[password]
                    ,[tipo]
                    ,[descripcion]
                    ,[activo]
                    ,[clienteID])
            OUTPUT Inserted.id
            VALUES('${ip}', '${puerto}', '${usuario}','${password}', 1,'${descripcion}', 0, ${clienteID})
            `;
    },
    borrar: (id) => {
      return `DELETE FROM [CONFIGURACION].[dbo].[PLC_OPCUA]
            WHERE [id] = ${id}`;
    },
    actualizar: (id, ip, puerto, usuario, password, descripcion) => {
      return `UPDATE [CONFIGURACION].[dbo].[PLC_OPCUA]
            SET [ip] = '${ip}',
                [puerto] = '${puerto}',
                [usario] = '${usuario}',
                [password] = '${password}',
                [descripcion] = '${descripcion}'
                WHERE id = ${id}`;
    },
    todos: () => {
      return `SELECT
                [id],
                 [ip]
                ,[puerto]
                ,[usuario]
                ,[password]
                ,[descripcion]
                ,[clienteID]
            FROM [CONFIGURACION].[dbo].[PLC_OPCUA]
        `;
    },
  },
  lineas: {
    leer: (id) => {
      return `SELECT *
            FROM [CONFIGURACION].[dbo].[LINEAS]
            WHERE id = ${id}
            `;
    },
    todos: (clienteID) => {
      return `SELECT *
            FROM [CONFIGURACION].[dbo].[LINEAS]
            WHERE [clienteID] = ${clienteID} 
        `;
    },
    nuevo: (nombre, clienteID) => {
      return `INSERT INTO [CONFIGURACION].[dbo].[LINEAS]
                ([nombre],
                [clienteID])
            OUTPUT Inserted.id
            VALUES('${nombre}', ${clienteID})
                `;
    },
    borrar: (id) => {
      return `DELETE FROM [CONFIGURACION].[dbo].[LINEAS]
                WHERE [id] = ${id}`;
    },
    actualizar: (id, nombre) => {
      return `UPDATE [CONFIGURACION].[dbo].[LINEAS]
                SET [nombre] = '${nombre}'
                    WHERE [id] = ${id}`;
    },
  },
  adquisiciones: {
    nuevo: (nombre, nombreTabla, triggerID) => {
      return `INSERT INTO [CONFIGURACION].[dbo].[ADQUISICIONES]
                ([nombreBD],
                [nombreTabla],
                [frecuenciaRegistro]
                ,[valorInicio]
                ,[valorFin]
                ,[valorRespuesta]
                ,[diasRetenidos]
                ,[triggerID]
                ,[activa])
            OUTPUT Inserted.id
            VALUES('${nombre}', '${nombreTabla}', 60, 1, 0, NULL, NULL, ${triggerID}, 1)
                `;
    },
    leer: (id) => {
      return `SELECT *
            FROM [CONFIGURACION].[dbo].[ADQUISICIONES]
            WHERE id = ${id}
            `;
    },
    porMaquinaID: (maquinaID, modelo) => {
      `SELECT id
      FROM [CONFIGURACION].[dbo].[ADQUISICIONES]
      WHERE [triggerID] IN 
      ( SELECT id
        FROM [CONFIGURACION].[dbo].[VARIABLES]
        WHERE [maquinaID] = ${maquinaID} AND [modelo] = ${modelo})`;
    },
    borrar: (id) => {
      return `DELETE FROM [CONFIGURACION].[dbo].[ADQUISICIONES]
                WHERE [id] = ${id}`;
    },
    borrarVariablesAdquisiciones: (id) => {
      return `DELETE FROM [CONFIGURACION].[dbo].[VARIABLES_ADQUISICIONES]
                WHERE [adquisicionID] = ${id}`;
    },
    borrarPorMaquinaID: (maquinaID) => {
      return `DELETE FROM [CONFIGURACION].[dbo].[ADQUISICIONES]
                WHERE [triggerID] IN 
                ( SELECT id
                  FROM [CONFIGURACION].[dbo].[VARIABLES]
                  WHERE [maquinaID] = ${maquinaID} AND [modelo] = 1)`;
    },
    actualizar: (id, nombre, nombreTabla, triggerID, activa) => {
      return `UPDATE [CONFIGURACION].[dbo].[ADQUISICIONES]
                SET [nombreBD] = '${nombre}',
                    [nombreTabla] = '${nombreTabla}',
                    [triggerID] = ${triggerID},
                    [activa] = ${activa}
                    WHERE id = ${id}`;
    },
  },
  turnos: {
    nuevo: (nombre, horaInicio, horaFin, clienteID) => {
      return `INSERT INTO [CONFIGURACION].[dbo].[TURNOS]
                ([turno]
                    ,[horaInicio]
                    ,[horaFin]
                    ,[clienteID])
            OUTPUT Inserted.id
            VALUES('${nombre}', '${horaInicio}', '${horaFin}', ${clienteID})
                `;
    },
    leer: (id) => {
      return `SELECT *
            FROM [CONFIGURACION].[dbo].[TURNOS]
            WHERE id = ${id}
            `;
    },
    todos: (clienteID) => {
      return `SELECT *
            FROM [CONFIGURACION].[dbo].[TURNOS]
            WHERE [clienteID] = ${clienteID} 
        `;
    },
    borrar: (id) => {
      return `DELETE FROM [CONFIGURACION].[dbo].[TURNOS]
                WHERE [id] = ${id}`;
    },
    actualizar: (nombre, horaInicio, horaFin, clienteID) => {
      return `UPDATE [CONFIGURACION].[dbo].[TURNOS]
                SET  [horaInicio] = '${horaInicio}',
                    [horaFin] = '${horaFin}'
                    WHERE [turno] = '${nombre}' AND [clienteID] = '${clienteID}'`;
    },
  },
  productos: {
    leer: (id) => {
      return `SELECT *
            FROM [CONFIGURACION].[dbo].[PRODUCTOS]
            WHERE id = ${id}
            `;
    },
    leerMaquina: (id) => {
      return `SELECT *
            FROM [CONFIGURACION].[dbo].[PRODUCTOS]
            WHERE [maquinaID] = ${id}
            `;
    },
    todos: () => {
      return `SELECT *
            FROM [CONFIGURACION].[dbo].[PRODUCTOS]
        `;
    },
    nuevo: (nombre, maquinaID) => {
      return `INSERT INTO [CONFIGURACION].[dbo].[PRODUCTOS]
                ([nombre],
                [maquinaID])
            OUTPUT Inserted.id
            VALUES('${nombre}', '${maquinaID}')
                `;
    },
    borrar: (id) => {
      return `DELETE FROM [CONFIGURACION].[dbo].[PRODUCTOS]
                WHERE [id] = ${id}`;
    },
    actualizar: (id, nombre, activo) => {
      return `UPDATE [CONFIGURACION].[dbo].[PRODUCTOS]
                SET [nombre] = '${nombre}',
                    [activo] = ${activo}
                    WHERE id = ${id}`;
    },
  },
  eventos: {
    crearRegistro: (infoEvento) => {
      return `
        INSERT INTO [SCADA_HISTORICO].[dbo].[EVENTOS] 
        ([variableID], [usuario], [ip], [horaInicio], [descripcion]) 
        VALUES 
        (${infoEvento.variableID}, '${infoEvento.usuario}', '${infoEvento.ip}', '${infoEvento.horaInicio}', '${infoEvento.descripcion}')
      `;
    },
    periodo: (desde, hasta) => {
      return `
        SELECT [variableID], [usuario], [ip], [horaInicio], [descripcion], [estado]
        FROM [SCADA_HISTORICO].[dbo].[EVENTOS]
        WHERE [horaInicio] > '${desde}' AND [horaInicio] < '${hasta}'
      `;
    },
  },
  calibrador: {
    parametros: {
      leer: (clienteID, lineaID, desde, hasta) => {
        return `
          SELECT *
          FROM [SCADA_HISTORICO].[dbo].[PARAMETROS_CALIBRADOR]
          WHERE [fecha] >= (
            SELECT MAX([fecha])
            FROM [SCADA_HISTORICO].[dbo].[PARAMETROS_CALIBRADOR]
            WHERE [fecha] < '${desde}' AND [clienteID] = ${clienteID} AND [lineaID] = ${lineaID}
          )
          AND fecha <= (
            SELECT MAX(fecha)
            FROM [SCADA_HISTORICO].[dbo].[PARAMETROS_CALIBRADOR]
            WHERE [fecha] < '${hasta}' AND [clienteID] = ${clienteID} AND [lineaID] = ${lineaID}
          )
          AND [clienteID] = ${clienteID}
          AND [lineaID] = ${lineaID}
          ORDER BY [fecha];
        `;
      },
      leerUltimo: (clienteID, lineaID) => {
        return `
          SELECT TOP 1 *
          FROM [SCADA_HISTORICO].[dbo].[PARAMETROS_CALIBRADOR]
          WHERE [clienteID] = ${clienteID}
          AND [lineaID] = ${lineaID}
          ORDER BY [fecha] DESC;
        `;
      },
      guardar: (clienteID, lineaID, tolerancia) => {
        return `
          INSERT INTO [SCADA_HISTORICO].[dbo].[PARAMETROS_CALIBRADOR]
          (clienteID, lineaID, tolerancia, fecha)
          VALUES
          (${clienteID}, ${lineaID}, ${tolerancia}, GETDATE())
        `;
      },
    },
    // alarmas: {
    //   leer: (clienteID, lineaID, desde, hasta) => {
    //     return `
    //       SELECT *
    //       FROM [SCADA_HISTORICO].[dbo].[ALARMAS_CALIBRADOR]
    //       WHERE [clienteID] = ${clienteID}
    //         AND [lineaID] = ${lineaID}
    //         AND ([inicio] BETWEEN '${desde}' AND '${hasta}' OR [fin] BETWEEN '${desde}' AND '${hasta}' OR [fin] IS NULL)
    //     `;
    //   },
    //   iniciar: (clienteID, lineaID) => {
    //     return `
    //       INSERT INTO [SCADA_HISTORICO].[dbo].[ALARMAS_CALIBRADOR]
    //       (clienteID, lineaID, inicio)
    //       VALUES
    //       (${clienteID}, ${lineaID}, GETDATE())
    //     `;
    //   },
    //   finalizar: (id) => {
    //     return `
    //       UPDATE [SCADA_HISTORICO].[dbo].[ALARMAS_CALIBRADOR]
    //       SET [fin] = GETDATE()
    //       WHERE [id] = ${id}
    //     `;
    //   },
    //   existeAlarmaIniciada: (clienteID, lineaID) => {
    //     return `
    //       SELECT TOP 1 *
    //       FROM [SCADA_HISTORICO].[dbo].[ALARMAS_CALIBRADOR]
    //       WHERE [clienteID] = ${clienteID} AND [lineaID] = ${lineaID} AND [fin] IS NULL
    //       ORDER BY [id] DESC
  
    //     `;
    //   },
    // },
  },
};
