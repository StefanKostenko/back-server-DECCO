const { conectarBD, consultas } = require("../bd");
const sql = require("mssql");
// var CryptoJS = require("crypto-js");

// const jwt = require('jsonwebtoken');

module.exports = {
  login: async (req, res) => {
    try {
      const { usuario, password } = req.body;
      console.log(req.body);
      const pool = await conectarBD();
      
      // Obtén la consulta con los placeholders
      const consultaUsuario = consultas.usuarios.login();
  
      // Ejecuta la consulta usando parámetros en lugar de concatenar
      const datosUsuario = await pool.request()
        .input('usuario', sql.VarChar, usuario)  // Asignar el valor del parámetro 'usuario'
        .input('password', sql.VarChar, password)  // Asignar el valor del parámetro 'password'
        .query(consultaUsuario);  // Ejecuta la consulta
  
      if (datosUsuario.recordset.length > 0) {
        let clienteIDs = datosUsuario.recordset.map((row) => row.clienteID);
        let usuarioData = { ...datosUsuario.recordset[0], clienteID: clienteIDs };
        console.log(usuarioData);
        res.send(usuarioData);
      } else {
        res.send({
          error: true,
          mensaje: "El usuario o la contraseña son incorrectos",
        });
      }
    } catch (e) {
      console.log(e);
      res.send({ error: true, mensaje: "El usuario no existe" });
    }
  },
  nuevo: async (req, res) => {
    const { usuario, nombre, password, rol, clienteID } = req.body;
    try {
      if (usuario && nombre && password && rol) {
        const pool2 = await conectarBD();
        const consulta = consultas.usuarios.nuevo(
          usuario,
          nombre,
          password,
          rol
        );
        // Al crear un usuario nuevo nos devuleve su usuarioID.
        let usuarioID = (await pool2.request().query(consulta)).recordset;
        if (clienteID !== null) {
          // Listamos todos los clientes que tiene permisos el usuario para ver y los insertamos en la BBDD.
          for (const cliente of clienteID) {
            const consulta2 = consultas.usuarios.usuarioCliente(
              usuarioID[0].id,
              cliente
            );
            await pool2.request().query(consulta2);
            // Si el rol del usuario es Cliente le insertaremos los permisos de las graficas por defecto todas a true.
            if (rol === "Cliente") {
              console.log(usuarioID[0].id);
              const consulta3 =
                consultas.usuarios.insertarPermisosUsuarioDefault(
                  usuarioID[0].id
                );
              await pool2.request().query(consulta3);
            }
          }
        } else {
          const consulta2 = consultas.usuarios.usuarioCliente(usuarioID[0].id);
          await pool2.request().query(consulta2);
        }
        res.send({ success: true });
      }
    } catch (error) {
      console.log(error);
    }
  },
  actualizar: async (req) => {
    const { id, usuario, nombre, password, rol, clienteID } = req.body;
    try {
      if (usuario && nombre && password) {
        const pool2 = await conectarBD();
        let cliente = [];
        if (!Array.isArray(clienteID)) {
          cliente = (
            await pool2.request().query(consultas.usuarios.clienteID(clienteID))
          ).recordset;
        }
        if (cliente.length > 0) {
          const consulta = consultas.usuarios.actualizar(
            cliente[0].id,
            nombre,
            usuario,
            password,
            cliente[0].rol
          );
          await pool2.request().query(consulta);
        } else {
          const consulta = consultas.usuarios.actualizar(
            id,
            nombre,
            usuario,
            password,
            rol
          );
          await pool2.request().query(consulta);
          let clientes = await pool2
            .request()
            .query(consultas.usuarios.comprobarUsuarioClieteID(id));
          // Suponiendo que borrarUsuarioCliente y usuarioCliente son funciones que ya tienes definidas
          let clienteIDExistentes = clientes.recordset.map(
            (cliente) => cliente.clienteID
          );

          for (const clienteIDSelecionado of clienteID) {
            if (!clienteIDExistentes.includes(clienteIDSelecionado)) {
              await pool2
                .request()
                .query(
                  consultas.usuarios.usuarioCliente(id, clienteIDSelecionado)
                );
            }
          }

          for (const clienteIDExistente of clientes.recordset) {
            if (!clienteID.includes(clienteIDExistente.clienteID)) {
              await pool2
                .request()
                .query(
                  consultas.usuarios.borrarClienteUsuario(
                    id,
                    clienteIDExistente.clienteID
                  )
                );
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  },
  eliminar: async (req) => {
    const { id } = req.body;
    try {
      const pool2 = await conectarBD();
      // Consulta para borrar datos del usuario
      const consulta = consultas.usuarios.borrarUsuario(id);
      // Consulta para borrar los clientes que puede visualizar el usuario
      const consulta2 = consultas.usuarios.borrarUsuarioClientes(id);
      // Consulta para borrar los permisos de las graficas del usuario
      const consulta3 = consultas.usuarios.borrarPermisosUsuarioCliente(id);
      await pool2.request().query(consulta);
      await pool2.request().query(consulta2);
      await pool2.request().query(consulta3);
    } catch (error) {
      console.log(error);
    }
  },
  permisosUsuario: async (req, res) => {
    const { maquina } = req.params;
    const { usuarioID } = req.body;
    const pool = await conectarBD();
    let consulta = null;
    if (maquina === "Deccowasher") {
      consulta = consultas.usuarios.leerPermisosUsuarioDECCOWASHER(usuarioID);
    } else if (maquina === "Deccodaf") {
      consulta = consultas.usuarios.leerPermisosUsuarioDECCODAF(usuarioID);
    } else if (maquina === "Deccodos") {
      consulta = consultas.usuarios.leerPermisosUsuarioDECCODOS(usuarioID);
    }
    const datos = (await pool.request().query(consulta)).recordset;
    res.send(datos);
  },
  actualizarPermisosUsuario: async (req, res) => {
    try {
      const { maquina } = req.params;
      const { usuarioID, graficas } = req.body;
      const pool = await conectarBD();
      let consulta = null;
      if (maquina === "Deccowasher") {
        let loteJabon,
          loteDesinfectante,
          estado,
          alarmas,
          usuario,
          dosis,
          kilosCalibrador,
          estadoBombas;

        graficas.forEach((grafica) => {
          switch (grafica.nombre) {
            case "Lote Jabon":
              loteJabon = grafica.visualizar ? 1 : 0;
              break;
            case "Lote Desinfectante":
              loteDesinfectante = grafica.visualizar ? 1 : 0;
              break;
            case "Estado":
              estado = grafica.visualizar ? 1 : 0;
              break;
            case "Alarmas":
              alarmas = grafica.visualizar ? 1 : 0;
              break;
            case "Usuario":
              usuario = grafica.visualizar ? 1 : 0;
              break;
            case "Dosis de desinfectante y jabon":
              dosis = grafica.visualizar ? 1 : 0;
              break;
            case "Kilos calibrador":
              kilosCalibrador = grafica.visualizar ? 1 : 0;
              break;
            case "Estado de las bombas":
              estadoBombas = grafica.visualizar ? 1 : 0;
              break;
          }
        });

        consulta = consultas.usuarios.actualizarPermisosUsuarioDECCOWASHER(
          usuarioID,
          loteJabon,
          loteDesinfectante,
          estado,
          alarmas,
          usuario,
          dosis,
          kilosCalibrador,
          estadoBombas
        );
      } else if (maquina === "Deccodaf") {
        let loteFungicida,
          estado,
          alarmas,
          estadoNivelGarrafas,
          usuario,
          reposiciones,
          dosis,
          kilosCalibrador;

        graficas.forEach((grafica) => {
          switch (grafica.nombre) {
            case "Lote Fungicida":
              loteFungicida = grafica.visualizar ? 1 : 0;
              break;
            case "Estado":
              estado = grafica.visualizar ? 1 : 0;
              break;
            case "Alarmas":
              alarmas = grafica.visualizar ? 1 : 0;
              break;
            case "Estado de los niveles de las garrafas (Falta de producto)":
              estadoNivelGarrafas = grafica.visualizar ? 1 : 0;
              break;
            case "Usuario":
              usuario = grafica.visualizar ? 1 : 0;
              break;
            case "Reposiciones":
              reposiciones = grafica.visualizar ? 1 : 0;
              break;
            case "Dosis de fungicida":
              dosis = grafica.visualizar ? 1 : 0;
              break;
            case "Kilos calibrador":
              kilosCalibrador = grafica.visualizar ? 1 : 0;
              break;
          }
        });

        consulta = consultas.usuarios.actualizarPermisosUsuarioDECCODAF(
          usuarioID,
          loteFungicida,
          estado,
          alarmas,
          estadoNivelGarrafas,
          usuario,
          reposiciones,
          dosis,
          kilosCalibrador
        );
      } else if (maquina === "Deccodos") {
        let lotesFungicida,
          estado,
          usuario,
          dosis,
          kilosCalibrador,
          activacionCepillos;

        graficas.forEach((grafica) => {
          switch (grafica.nombre) {
            case "Lotes Fungicida":
              lotesFungicida = grafica.visualizar ? 1 : 0;
              break;
            case "Estado":
              estado = grafica.visualizar ? 1 : 0;
              break;
            case "Usuario":
              usuario = grafica.visualizar ? 1 : 0;
              break;
            case "Dosis":
              dosis = grafica.visualizar ? 1 : 0;
              break;
            case "Kilos calibrador":
              kilosCalibrador = grafica.visualizar ? 1 : 0;
              break;
            case "Activacion limpieza cepillos":
              activacionCepillos = grafica.visualizar ? 1 : 0;
              break;
          }
        });

        consulta = consultas.usuarios.actualizarPermisosUsuarioDECCODOS(
          usuarioID,
          lotesFungicida,
          estado,
          usuario,
          dosis,
          kilosCalibrador,
          activacionCepillos
        );
      }
      await pool.request().query(consulta);
      res.send({ success: true });
    } catch (error) {
      console.log(error);
    }
  },
  getCliente: async (req, res) => {
    const { clienteID } = req.params;
    const pool = await conectarBD();
    const consulta = consultas.usuarios.clienteID(clienteID);
    const datosUsuario = (await pool.request().query(consulta)).recordset;
    res.send(datosUsuario);
  },
  getClientes: async (req, res) => {
    const pool = await conectarBD();
    const consulta = consultas.usuarios.leerTodos();
    const datosUsuarios = (await pool.request().query(consulta)).recordset;
    // Agrupar los clienteID por id de usuario
    let agrupados = {};
    datosUsuarios.forEach((usuario) => {
      if (!agrupados[usuario.id]) {
        agrupados[usuario.id] = {
          // eslint-disable-next-line node/no-unsupported-features/es-syntax
          ...usuario,
          clienteID: [usuario.clienteID],
        };
      } else {
        agrupados[usuario.id].clienteID.push(usuario.clienteID);
      }
    });

    // Convertir el objeto agrupados en un array
    let usuariosAgrupados = Object.values(agrupados);

    res.send(usuariosAgrupados);
  },
};
