Feature: Carrito con cantidades
# ## Etapa 3 — Data Table de resultados
# Un Then recibe columnas producto, cantidad y subtotal.
# Recorrer las expectativas usando filas del carrito acotadas por producto.
# Comprobar número de filas de datos, sin contar cabecera.
# Los valores esperados deben ser independientes del cálculo de la aplicación.
# No leer el total de la app para usar ese mismo valor como esperado.

  Scenario: Data Table de entrada
    Given Estoy en la pagina de inicio
    When Recibiendo una tabla decido agregar elementos del tipo
      | producto | cantidad |
      | Mouse    |        2 |
      | Teclado  |        1 |
    Then Verifico que el subtotal para un producto con una cantidad
      | producto | cantidad | subtotal |
      | Mouse    |        2 |       50 |
      | Teclado  |        1 |       80 |
