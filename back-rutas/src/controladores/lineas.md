
# LINEAS

## METODOS

- Leer ( id, clienteID )

Seleccionas por ID. Si no existe el ID se selecciona todas las lineas del cliente.

- Nuevo (nombre, src, maquinas[])
  
Se inserta una linea, a partir de su nombre y el id del cliente.
A partir de las maquinas indicadas, se crean las maquinas en relacion a la linea.
Se insertarn las relaciones de las variables con la Maquina y se configura la adquisición.
    - VARIABLE_ADQUISICIONES
    - VARIABLES_BD
    - VARIABLES_OPCUA

- Borrar ( id )

Se borra en función del ID

- Actualizar (id, nombre, src)

Se actualiza el nombre de la linea y el estado de las maquinas de las lineas.
