
# MAQUINAS

## METODOS

- Leer ( modo, id, grupoID )

Seleccionas por ID o por el clienteID en función del modo.
Devuelve una maquina o un array de maquinas.
Modos:
    - cliente
      - Devuelve todas las maquinas del cliente selecciona.
    - id
      - Devuelve la maquina que corresponde al id.
    - linea
      - Devulve las maquinas de la linea seleccionada.
    - clienteTipo
      - Devuleve las maquinas en funcion del cliente y de su grupo/tipo
    - default
      - Devuelve todas las maquinas.

- Nuevo (nombre, nombreLinea, clienteID, grupoID,  lineaID)
  
Se inserta una maquina a partir del nombre, el nombre y el id de la Linea, el id del cliente, el grupo/tipo.
Se insertarn las relaciones de las variables con la Maquina y se configura la adquisición.
    - VARIABLE_ADQUISICIONES
    - VARIABLES_BD
    - VARIABLES_OPCUA

- Actualizar (id, activa)

Se actualiza el estado de la maquina seleccionada.
