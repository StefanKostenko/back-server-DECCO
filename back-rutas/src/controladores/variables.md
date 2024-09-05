# VARIABLES

## METODOS

- Leer ( id, modo, operacion, filtrado, maquinaID )

A partir de las variables disponibles de las plantes, seleccionamos en funcion de la maquina y del modelo la variable requerida.

- Modo
  - 8H: Selecciona los datos de las ultimas 8h.
  - 24H-Turno: Selecciona los datos de las ultimas 24H.
  - 24H: Selecciona los datos de las ultimas 24H.
  - Historico: Selecciona los datos entre el periodo seleccionado.
- Consulta
  - Individual: Consulta una columna.
    - Operacion:
      - totales: devuelvela la acumulacion de los registros de una columna mediante.
      - registros: devuleve todos los registros disponible.
      - ultimo: devuelve el último registro.
      - primero: devuelve el primer registro.
    - FILTRADO:
      - totalRangos: devuelve el total en s de rangos de fechas de valores booleanos.
      - unidadMinuto: devuelve las unidades/min de valores numericos.
      - sinfiltro: sin filtros aplicados.
      - formatoRangos: devuelve rangos de fechas para valores booleanos formateados para ApexCharts.
      - formatoLinea: devuelve valores formateados para graficas de ApexCharts.
  - Multiple: Consulta multiple columnas.
    - Operacion:
      - registros: devuleve todos los registros disponible de varias columnas.
      - registrosY: devuleve todos los registros disponible e varias columnas, la ultima columna se generaliza el nombre a "y".
    - FILTRADO:
      - sinfiltro: sin filtros aplicados.
      - marchaFormatoRangos: devuelve rangos de fechas para el valor calculado de marcha formateados para ApexCharts.
      - totalMarcha: devuelve el total en s de rangos de fechas del valor calculado de marcha.
      - turnosMarcha: devuelve el total en s de rangos de fechas del valor calculado de marcha filtrado por los turnos.
      - turnosMarchaValor: devuelve el total en s de rangos de fechas del valor calculado de marcha filtrado por los turnos y un Valor.
      - totalAutoManual: devuelve el total en s de valores filtrado por Auto y Manual.
      - turnosAutoManual: devuelve el total en s de valores filtrado por Auto y Manual filtrado por los turnos

  - MultipleConsulta: Realiza una conulta de una columna multiples veces.
    - OPERACION:
      - turnosTotales: Calcula el tiempo en funcion de los turnos
    - FILTRADO:
      - sinfiltro: sin filtros aplicados.
