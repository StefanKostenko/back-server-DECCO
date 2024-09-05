const moment = require("moment");
module.exports = {
  fechaHaceXDias: (dias) => {
    let ahora = new Date();
    let haceXDias = new Date(ahora.setDate(ahora.getDate() - dias));
    return haceXDias;
  },

  fechaFormatoSQL: (fecha) => {
    let locale = fecha.toLocaleString().split(" ");
    locale[0] = locale[0].split("/").reverse().join("-");
    return locale.join(" ");
  },

  filtrarRepetidos: (registros) => {
    if (registros.length) {
      return registros
        .filter((e, i, a) => {
          let prev = a[i - 1];
          let next = a[i + 1];
          if (!prev || !next || e.y !== prev.y || e.y !== next.y) return e;
        })
        .map((e) => {
          return {
            x: e.x.toISOString().slice(0, -1),
            y: e.y,
          };
        });
    } else {
      return registros;
    }
  },

  filtrarCambios: (registros) => {
    if (registros.length) {
      let conjuntoFiltrado = new Array();
      for (let index = 1; index < registros.length; index++) {
        if (registros[index].y !== registros[index - 1].y) {
          conjuntoFiltrado.push({
            x: registros[index].x.toISOString().slice(0, -1),
            y: registros[index].y,
          });
        }
      }
      return conjuntoFiltrado;
    } else {
      return registros;
    }
  },

  filtrarPorRangos: (data) => {
    if (!data) return [];

    let ranges = [];
    let start = data[0];
    let end = null;

    for (let i = 1; i < data.length; i++) {
      if (data[i].y !== start.y) {
        end = data[i];
        ranges.push({
          x: start.x,
          y: end.x,
          z: start.y,
        });
        end = null;
        start = data[i];
      }
    }

    if (start && !end) {
      end = data[data.length - 1];
      ranges.push({
        x: start.x,
        y: end.x,
        z: start.y,
      });
    }

    return ranges;
  },

  filtrarPorRangosValor: (data) => {
    if (!data) return [];

    let ranges = [];
    let start = data[0];
    let end = null;

    for (let i = 1; i < data.length; i++) {
      if (data[i].y !== start.y) {
        end = data[i - 1];
        ranges.push({
          x: start.x,
          y: end.x,
          z: start.y,
          value: end.z - start.z,
        });
        start = data[i];
      }
    }

    if (start && !end) {
      end = data[data.length - 1];
    }

    ranges.push({
      x: start.x,
      y: end.x,
      z: start.y,
      value: end.z - start.z,
    });

    return ranges;
  },

  formatearFotocelula: (registros) => {
    if (registros.length) {
      registros = registros.filter((e, i, a) => {
        let prev = a[i - 1];
        let next = a[i + 1];
        if (!prev || !next || e.y !== prev.y || e.y !== next.y) return e;
      });
      let estados = [-1, 0, 1, 2];
      let registrosFormateados = new Array();
      for (let estado of estados) {
        registrosFormateados[estado + 1] = new Array();
        let registrosFiltradosPorEstado = registros.map((r) => {
          if (r.y === estado)
            return { x: r.x.toISOString().slice(0, -1), y: 1 };
          else return { x: r.x.toISOString().slice(0, -1), y: 0 };
        });
        registrosFormateados[estado + 1] = registrosFiltradosPorEstado;
      }
      return registrosFormateados;
    } else {
      return [[], [], [], []];
    }
  },

  inicioTurnoYActual: (registros) => {
    let filtrados = new Array();
    filtrados.push({
      x: registros[0].x.toISOString().slice(0, -1),
      y: registros[0].y,
    });
    filtrados.push({
      x: registros[registros.length - 1].x.toISOString().slice(0, -1),
      y: registros[registros.length - 1].y,
    });
    return filtrados;
  },

  formatoLoteCliente: (registros) => {
    let loteActual = null;
    let inicio = null;
    let registrosFormateados = [];

    registros.forEach((row) => {
      const { x, y } = row;
      if (y !== loteActual) {
        // Se ha detectado un lote diferente, registrarlo y reiniciar el tiempo
        if (loteActual !== null) {
          registrosFormateados.push({
            x: `Lote Fruta: ${loteActual}`,
            y: [inicio, new Date(x).getTime()],
            fillColor: generarColorAleatorio(loteActual),
          });
        }
        loteActual = y;
        inicio = new Date(x).getTime();
      }
    });
    // Asegurarse de agregar el último lote detectado
    if (loteActual !== null) {
      registrosFormateados.push({
        x: `Lote Fruta: ${loteActual}`,
        y: [inicio, new Date(registros[registros.length - 1].x).getTime()],
        fillColor: generarColorAleatorio(loteActual),
      });
    }
    return registrosFormateados;
  },

  formatoUsuario: (registros) => {
    let usuarioActual = null;
    let inicio = null;
    let registrosFormateados = [];

    registros.forEach((row) => {
      const { x, y } = row;
      if (y !== usuarioActual) {
        // Se ha detectado un lote diferente, registrarlo y reiniciar el tiempo
        if (usuarioActual !== null) {
          registrosFormateados.push({
            x: `Usuario: ${usuarioActual}`,
            y: [inicio, new Date(x).getTime()],
            fillColor: generarColorAleatorio(usuarioActual),
          });
        }
        usuarioActual = y;
        inicio = new Date(x).getTime();
      }
    });
    // Asegurarse de agregar el último lote detectado
    if (usuarioActual !== null) {
      registrosFormateados.push({
        x: `Usuario: ${usuarioActual}`,
        y: [inicio, new Date(registros[registros.length - 1].x).getTime()],
        fillColor: generarColorAleatorio(usuarioActual),
      });
    }
    return registrosFormateados;
  },

  formatoLoteDesinf: (registros) => {
    let loteActual = null;
    let productoActual = null;
    let inicio = null;
    let registrosFormateados = [];

    registros.forEach((row) => {
      const { x, loteDeccoDesinfectante, nombreProductoDesinfectante } = row;
      if (loteDeccoDesinfectante !== loteActual) {
        // Se ha detectado un lote diferente, registrarlo y reiniciar el tiempo
        if (loteActual !== null) {
          registrosFormateados.push({
            x: `Desinfectante ${productoActual} (Lote: ${loteActual})`,
            y: [inicio, new Date(x).getTime()],
            fillColor: generarColorAleatorio(
              `Desinfectante ${productoActual} (Lote: ${loteActual})`
            ),
          });
        }
        loteActual = loteDeccoDesinfectante;
        productoActual = nombreProductoDesinfectante;
        inicio = new Date(x).getTime();
      }
    });
    // Asegurarse de agregar el último lote detectado
    if (loteActual !== null) {
      registrosFormateados.push({
        x: `Desinfectante ${productoActual} (Lote: ${loteActual})`,
        y: [inicio, new Date(registros[registros.length - 1].x).getTime()],
        fillColor: generarColorAleatorio(
          `Desinfectante ${productoActual} (Lote: ${loteActual})`
        ),
      });
    }
    return registrosFormateados;
  },

  formatoLoteJabon: (registros) => {
    let loteActual = null;
    let productoActual = null;
    let inicio = null;
    let registrosFormateados = [];

    registros.forEach((row) => {
      const { x, loteDeccoJabon, nombreProductoJabon } = row;
      if (loteDeccoJabon !== loteActual) {
        // Se ha detectado un lote diferente, registrarlo y reiniciar el tiempo
        if (loteActual !== null) {
          registrosFormateados.push({
            x: `Jabón ${productoActual} (Lote: ${loteActual})`,
            y: [inicio, new Date(x).getTime()],
            fillColor: generarColorAleatorio(
              `Jabón ${productoActual} (Lote: ${loteActual})`
            ),
          });
        }
        loteActual = loteDeccoJabon;
        productoActual = nombreProductoJabon;
        inicio = new Date(x).getTime();
      }
    });
    // Asegurarse de agregar el último lote detectado
    if (loteActual !== null) {
      registrosFormateados.push({
        x: `Jabón ${productoActual} (Lote: ${loteActual})`,
        y: [inicio, new Date(registros[registros.length - 1].x).getTime()],
        fillColor: generarColorAleatorio(
          `Jabón ${productoActual} (Lote: ${loteActual})`
        ),
      });
    }
    return registrosFormateados;
  },

  formatoLoteFungicida: (registros, variables) => {
    let lote = variables.find((variable) =>
      variable.columna.includes("lote")
    ).columna;
    let varProducto = variables.find((variable) =>
      variable.columna.includes("nombre")
    );
    let producto = varProducto.columna;
    let descripcion = varProducto.descripcion.split(" ")[2];

    let loteActual = null;
    let productoActual = null;
    let inicio = null;
    let registrosFormateados = [];

    registros.forEach((row) => {
      const x = row.x;
      const loteFungicida = row[lote];
      const nombreFungicida = row[producto];

      if (loteFungicida !== loteActual) {
        // Se ha detectado un lote diferente, registrarlo y reiniciar el tiempo
        if (loteActual !== null) {
          registrosFormateados.push({
            x: `P${descripcion}: ${productoActual} (Lote: ${loteActual})`,
            y: [inicio, new Date(x).getTime()],
            fillColor: generarColorAleatorio(
              `P${descripcion}: ${productoActual} (Lote: ${loteActual})`
            ),
          });
        }
        loteActual = loteFungicida;
        productoActual = nombreFungicida;
        inicio = new Date(x).getTime();
      }
    });
    // Asegurarse de agregar el último lote detectado
    if (loteActual !== null) {
      registrosFormateados.push({
        x: `P${descripcion}: ${productoActual} (Lote: ${loteActual})`,
        y: [inicio, new Date(registros[registros.length - 1].x).getTime()],
        fillColor: generarColorAleatorio(
          `P${descripcion}: ${productoActual} (Lote: ${loteActual})`
        ),
      });
    }
    return registrosFormateados;
  },

  formatoLoteCera: (registros, variables) => {
    let lote = variables.find((variable) =>
      variable.columna.includes("lote")
    ).columna;
    let varProducto = variables.find((variable) =>
      variable.columna.includes("producto")
    );
    let producto = varProducto.columna;
    let descripcion = `${[
      varProducto.descripcion.split(" ")[1],
      parseInt(varProducto.descripcion.split(" ")[2]) + 1,
    ].join(" ")}D`;

    let loteActual = null;
    let productoActual = null;
    let inicio = null;
    let registrosFormateados = [];

    registros.forEach((row) => {
      const x = row.x;
      const loteCera = row[lote];
      const nombreProducto = row[producto];

      if (loteCera !== loteActual) {
        // Se ha detectado un lote diferente, registrarlo y reiniciar el tiempo
        if (loteActual !== null) {
          registrosFormateados.push({
            x: `${descripcion}: ${productoActual} (Lote: ${loteActual})`,
            y: [inicio, new Date(x).getTime()],
            fillColor: generarColorAleatorio(
              `${descripcion}: ${productoActual} (Lote: ${loteActual})`
            ),
          });
        }
        loteActual = loteCera;
        productoActual = nombreProducto;
        inicio = new Date(x).getTime();
      }
    });
    // Asegurarse de agregar el último lote detectado
    if (loteActual !== null) {
      registrosFormateados.push({
        x: `${descripcion}: ${productoActual} (Lote: ${loteActual})`,
        y: [inicio, new Date(registros[registros.length - 1].x).getTime()],
        fillColor: generarColorAleatorio(
          `${descripcion}: ${productoActual} (Lote: ${loteActual})`
        ),
      });
    }
    return registrosFormateados;
  },

  formatoRangos: (registros, name) => {
    const todos = [];
    const apagado = [];
    const encendido = [];
    for (let index = 0; index < registros.length; index++) {
      const element = registros[index];
      const startR = new Date(element.x).getTime();
      const endR = new Date(element.y).getTime();
      const obj = { x: name, y: [startR, endR] };
      if (element.z === 0) apagado.push(obj);
      else encendido.push(obj);
    }

    todos.push({ name: "Apagado", data: apagado });
    todos.push({ name: "Encedido", data: encendido });
    return todos;
  },
  formatoMultipleRangos: (registros, name, estados) => {
    const todos = [];
    const apagado = [];
    const encendido = [];
    for (let i = 0; i < registros.length; i++) {
      for (let index = 0; index < registros[i].length; index++) {
        const element = registros[i][index];
        const startR = new Date(element.x).getTime();
        const endR = new Date(element.y).getTime();
        const obj = { x: name[i], y: [startR, endR] };
        if (element.z === 0) apagado.push(obj);
        else encendido.push(obj);
      }
    }
    todos.push({ name: estados[0], data: apagado });
    todos.push({ name: estados[1], data: encendido });
    return todos;
  },
  formatoLinea: (registros, name) => {
    return [
      {
        name: name,
        data: registros.map(({ x, y }) => ({
          x: new Date(x).getTime(),
          y: y,
        })),
      },
    ];
  },
  formatoMultipleLinea: (registros, name) => {
    const todos = [];
    for (let i = 0; i < registros.length; i++) {
      const data = registros[i].map(({ x, y }) => ({
        x: new Date(x).getTime(),
        y,
      }));
      todos.push({ name: name[i], data });
    }
    return todos;
  },
  formatoMultipleAcumuladores: (registros, name) => {
    const todos = [];
    for (let i = 0; i < registros.length; i++) {
      const data = registros[i].map((variable) => ({
        x: new Date(variable.x).getTime(),
        y: (variable.y - registros[i][0].y) / 1000,
      }));
      todos.push({ name: name[i], data });
    }
    return todos;
  },
  marcha: (registro) => {
    if (!registro || !registro.activo) {
      return "Apagado";
    }
    if (
      Object.values(registro)
        .slice(2)
        .some((value) => value === true)
    ) {
      return "Paro";
    }
    return "Marcha";
  },
  marchaValor: (registro) => {
    const registrosA = Object.values(registro);
    if (registro.activo && registrosA[2]) {
      if (registrosA.slice(3).includes(true)) {
        return "Paro";
      }
      return "Marcha";
    } else {
      return "Apagado";
    }
  },
  rangoMarchaParoValor: (registros) => {
    if (!registros) return registros;

    const conjuntoFiltrado = [];
    let start = registros[0];
    let end = null;
    let valueRango = module.exports.marchaValor(registros[0]);

    for (let index = 0; index < registros.length; index++) {
      const currentRango = module.exports.marchaValor(registros[index]);

      if (!end) {
        if (currentRango === valueRango) {
          end = registros[index];
          if (index === registros.length - 1) {
            conjuntoFiltrado.push({
              x: new Date(start.x).toISOString(),
              y: new Date(end.x).toISOString(),
              z: valueRango,
            });
          }
        } else {
          end = registros[index];
          conjuntoFiltrado.push({
            x: new Date(start.x).toISOString(),
            y: new Date(end.x).toISOString(),
            z: valueRango,
          });
          start = registros[index];
          valueRango = currentRango;
          if (index === registros.length - 1) {
            conjuntoFiltrado.push({
              x: new Date(start.x).toISOString(),
              y: new Date(start.x).toISOString(),
              z: valueRango,
            });
          }
          end = null;
        }
      } else {
        if (registros[index].y === valueRango) {
          end = registros[index];
          if (index === registros.length - 1) {
            conjuntoFiltrado.push({
              x: new Date(start.x).toISOString(),
              y: new Date(end.x).toISOString(),
              z: valueRango,
            });
          }
        } else {
          end = registros[index];
          conjuntoFiltrado.push({
            x: new Date(start.x).toISOString(),
            y: new Date(end.x).toISOString(),
            z: valueRango,
          });
          start = registros[index];
          valueRango = currentRango;
          end = null;
        }
      }
    }
    return conjuntoFiltrado;
  },
  rangoMarchaparo: (registros) => {
    if (!registros) return registros;

    const conjuntoFiltrado = [];
    let start = registros[0];
    let end = null;
    let valueRango = module.exports.marcha(registros[0]);

    for (let index = 0; index < registros.length; index++) {
      const currentRango = module.exports.marcha(registros[index]);

      if (!end) {
        if (currentRango === valueRango) {
          end = registros[index];
          if (index === registros.length - 1) {
            conjuntoFiltrado.push({
              x: new Date(start.x).toISOString(),
              y: new Date(end.x).toISOString(),
              z: valueRango,
            });
          }
        } else {
          end = registros[index];
          conjuntoFiltrado.push({
            x: new Date(start.x).toISOString(),
            y: new Date(end.x).toISOString(),
            z: valueRango,
          });
          start = registros[index];
          valueRango = currentRango;
          if (index === registros.length - 1) {
            conjuntoFiltrado.push({
              x: new Date(start.x).toISOString(),
              y: new Date(start.x).toISOString(),
              z: valueRango,
            });
          }
          end = null;
        }
      } else {
        if (registros[index].y === valueRango) {
          end = registros[index];
          if (index === registros.length - 1) {
            conjuntoFiltrado.push({
              x: new Date(start.x).toISOString(),
              y: new Date(end.x).toISOString(),
              z: valueRango,
            });
          }
        } else {
          end = registros[index];
          conjuntoFiltrado.push({
            x: new Date(start.x).toISOString(),
            y: new Date(end.x).toISOString(),
            z: valueRango,
          });
          start = registros[index];
          valueRango = currentRango;
          end = null;
        }
      }
    }
    return conjuntoFiltrado;
  },
  formatoMarcha: (registros) => {
    const todos = [
      { name: "Paro", data: [] },
      { name: "Marcha", data: [] },
    ];
    let lastMarchaEnd = null;
    let lastParoEnd = null;
    for (const variable of registros) {
      const start = new Date(variable.x).getTime();
      const end = new Date(variable.y).getTime();
      const data = { x: "MarchaParo", y: [start, end] };
      if (variable.z === "Paro") {
        if (
          lastParoEnd !== null &&
          lastParoEnd.x === start &&
          lastParoEnd.z === variable.z
        ) {
          todos[0].data[todos[0].data.length - 1].y[1] = end;
          lastParoEnd.x = end;
        } else {
          todos[0].data.push(data);
          lastParoEnd = { z: variable.z, x: end };
        }
        lastMarchaEnd = null;
      } else if (variable.z === "Marcha") {
        if (
          lastMarchaEnd !== null &&
          lastMarchaEnd.x === start &&
          lastMarchaEnd.z === variable.z
        ) {
          todos[1].data[todos[1].data.length - 1].y[1] = end;
          lastMarchaEnd.x = end;
        } else {
          todos[1].data.push(data);
          lastMarchaEnd = { z: variable.z, x: end };
        }
        lastParoEnd = null;
      }
    }
    return todos;
  },
  filtroTurnos: (registroFormateado, turnos) => {
    const totalArray = [0, 0, 0, 0];
    const horaInicio1 = moment()
      .hours(turnos[1].horaInicio.split(":")[0])
      .minutes(turnos[1].horaInicio.split(":")[1])
      .startOf("minute");
    const horaFin1 = moment()
      .hours(turnos[1].horaFin.split(":")[0])
      .minutes(turnos[1].horaFin.split(":")[1])
      .startOf("minute");
    const horaInicio0 = moment()
      .hours(turnos[0].horaInicio.split(":")[0])
      .minutes(turnos[0].horaInicio.split(":")[1])
      .startOf("minute");
    const horaFin0 = moment()
      .hours(turnos[0].horaFin.split(":")[0])
      .minutes(turnos[0].horaFin.split(":")[1])
      .startOf("minute");

    for (const element of registroFormateado[1].data) {
      const horaInicio = moment(element.y[0]);
      const horaFin = moment(element.y[1]);

      if (horaInicio.isBetween(horaInicio1, horaFin1)) {
        totalArray[1] += horaFin.diff(horaInicio, "seconds");
      } else if (horaInicio.isBetween(horaInicio0, horaFin0)) {
        totalArray[0] += horaFin.diff(horaInicio, "seconds");
      } else {
        totalArray[2] += moment(element.y[2]).diff(horaInicio, "seconds");
      }

      totalArray[3] += horaFin.diff(horaInicio, "seconds");
    }

    return { unidad: "s", total: totalArray };
  },
  sumValuesByZ: (objects) => {
    const sumsByZ = {};
    if (!objects) return objects;
    for (const obj of objects) {
      const { z, value } = obj;
      sumsByZ[z] = (sumsByZ[z] || 0) + value;
    }
    const summedObjects = Object.entries(sumsByZ).map(([name, total]) => ({
      name,
      total,
    }));
    return summedObjects;
  },
};

let coloresGenerados = [];
// Temporizador para reiniciar el arreglo cada 24 horas (86400000 milisegundos)
setInterval(() => {
  coloresGenerados = [];
}, 86400000);

function generarColorAleatorio(lote) {
  // Busca si la cadena ya está mapeada en el arreglo
  const mapping = coloresGenerados.find((color) => {
    return color.lote === lote;
  });

  if (mapping) {
    // Si la cadena ya está mapeada, devuelve el color correspondiente
    return mapping.color;
  } else {
    // Si no está mapeada, genera un color aleatorio
    let color;
    do {
      // Genera un color aleatorio en formato hexadecimal
      const red = Math.floor(Math.random() * 256)
        .toString(16)
        .padStart(2, "0");
      const green = Math.floor(Math.random() * 256)
        .toString(16)
        .padStart(2, "0");
      const blue = Math.floor(Math.random() * 256)
        .toString(16)
        .padStart(2, "0");
      color = `#${red}${green}${blue}`;
    } while (coloresGenerados.includes({ lote, color }));
    // Almacena la cadena y el color en el arreglo
    coloresGenerados.push({ lote, color });
    return color;
  }
}
