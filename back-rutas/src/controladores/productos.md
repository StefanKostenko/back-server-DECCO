
# Productos

## METODOS

- Leer (modo, id )
  - Modo maquina: El id recibido es el de la maquina y devuelve todos los productos de la maquina
  - Modo id: El id recibido es su id y devuelve su row.
  - Modo todos: devuelve todos los productos

- Nuevo (nombre, maquinaID)

Crea un nuevo producto en funcion del nombre y maquinaID. Por defecto activo esta NULL

- Actualizar (id, nombre, activo )

Actualiza un producto en funcion de su id, modificando el nombre y activo (INT activo)
  
- ActualizarMultiple (productos )
  
Actualiza una lista de productos en funcion de su id, modificando el nombre y activo (INT activo)

- Borrar (id)

Borra un producto en funcion de su id
