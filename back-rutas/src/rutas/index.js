const { Router } = require("express");
const rutas = Router();

const userController = require("../controladores/usuarios");
const variableController = require("../controladores/variables");
const maquinasController = require("../controladores/maquinas");
const lineasController = require("../controladores/lineas");
const clientesController = require("../controladores/clientes");
const plcsController = require("../controladores/plcs");
const turnosController = require("../controladores/turnos");
const productosController = require("../controladores/productos");
const eventosController = require("../controladores/eventos");
const calibradorController = require("../controladores/calibrador");

// Ruta para login de usuarios
rutas.get("/ping", (req, res) => res.send(true));
rutas.post("/login", userController.login);
rutas.get("/usuarios", userController.getClientes);
rutas.get("/usuarios/:clienteID", userController.getCliente);
rutas.post("/usuarios/nuevo", userController.nuevo);
rutas.post("/usuarios/actualizar", userController.actualizar);
rutas.post("/usuarios/eliminar", userController.eliminar);
rutas.post("/usuarios/permisos/:maquina", userController.permisosUsuario);
rutas.post(
  "/usuarios/permisos/:maquina/actualizar",
  userController.actualizarPermisosUsuario
);
rutas.get("/variable/all", variableController.all);
rutas.post(
  "/variable/:modo/:operacion/:consulta/:filtrado",
  variableController.leer
);
rutas.post("/variable/filtroIF", variableController.inicioFin);
rutas.get("/:clienteID/lineas/all", lineasController.leer);
rutas.get("/lineas/:id", lineasController.leer);
rutas.post("/lineas/nuevo", lineasController.nuevo);
rutas.post("/lineas/borrar", lineasController.borrar);
rutas.post("/lineas/actualizar", lineasController.actualizar);
rutas.get("/maquinas/:modo/:id/:grupoID", maquinasController.leer);
rutas.post("/maquinas/nuevo", maquinasController.nuevo);
rutas.post("/maquinas/actualizar", maquinasController.actualizar);
rutas.get("/clientes/all", clientesController.leer);
rutas.get("/clientes/:id", clientesController.leer);
rutas.post("/clientes/nuevo", clientesController.nuevo);
rutas.post("/clientes/borrar", clientesController.borrar);
rutas.post("/clientes/actualizar", clientesController.actualizar);
rutas.get("/plcs/all", plcsController.leer);
rutas.post("/plcs/nuevo", plcsController.nuevo);
rutas.post("/plcs/borrar", plcsController.borrar);
rutas.get("/plcs/cliente/:id", plcsController.leerCliente);
rutas.get("/plcs/:id", plcsController.leer);
rutas.post("/plcs/actualizar", plcsController.actualizar);
rutas.get("/plcs/all", plcsController.leer);
rutas.get("/plcs/:id", plcsController.leer);
rutas.post("/plcs/nuevo", plcsController.nuevo);
rutas.post("/plcs/borrar", plcsController.borrar);
rutas.post("/plcs/actualizar", plcsController.actualizar);
rutas.get("/turnos/cliente/:id", turnosController.leerC);
rutas.post("/turnos/nuevo", turnosController.nuevo);
rutas.post("/turnos/borrar", turnosController.borrar);
rutas.post("/turnos/actualizar", turnosController.actualizar);
rutas.get("/turnos/:modo/:id", turnosController.leer);
rutas.get("/productos/:modo/:id", productosController.leer);
rutas.post("/productos/nuevo", productosController.nuevo);
rutas.post("/productos/actualizar", productosController.actualizar);
rutas.post(
  "/productos/actualizar/multiple",
  productosController.actualizarMultiple
);
rutas.post("/eventos/periodo", eventosController.periodo);
rutas.post("/eventos/crear", eventosController.crear);

rutas.post(
  "/calibrador/parametros/leer/:clienteID/:lineaID",
  calibradorController.parametros.leer
);
rutas.post(
  "/calibrador/parametros/guardar/:clienteID/:lineaID",
  calibradorController.parametros.guardar
);
// rutas.post(
//   "/calibrador/alarmas/leer/:clienteID/:lineaID",
//   calibradorController.alarmas.leer
// );
// rutas.post(
//   "/calibrador/alarmas/iniciar/:clienteID/:lineaID",
//   calibradorController.alarmas.iniciar
// );
// rutas.post(
//   "/calibrador/alarmas/finalizar/:clienteID/:lineaID",
//   calibradorController.alarmas.finalizar
// );
// rutas.get('/variable/:modo/:operacion/:filtrado/:maquina/:id', variableController.leer)

module.exports = rutas;
