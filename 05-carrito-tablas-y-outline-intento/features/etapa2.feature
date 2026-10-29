Feature: Carrito con cantidades
# ## Etapa 2 — Data Table de entrada
# Un step recibe columnas producto y cantidad para:
# Mouse 2, Teclado 1.
# Usar hashes y acciones secuenciales.
# Comprobar ambas filas y total USD 130.
# Leer celdas como strings; convertir/validar cuando corresponda.
# Si solo verificás el último producto, la cobertura es insuficiente.

  Scenario: Data Table de entrada
    Given Estoy en la pagina de inicio
    When Recibiendo una tabla decido agregar elementos del tipo
      | producto | cantidad |
      | Mouse    |        2 |
      | Teclado  |        1 |
    Then Verifico que el total sea "130"
