Feature: Carrito con cantidades
# ## Etapa 5 — Acumulación y límite
# Agregar Mouse 2 y luego Mouse 1:
# una sola fila, cantidad 3, subtotal y total USD 75.
# Después intentar agregar Mouse 3:
# mensaje de máximo, cantidad todavía 3 y total todavía USD 75.

  Scenario: Etapa5 - Acumulacion y limite
    Given Estoy en la pagina de inicio
    When Recibiendo una tabla decido agregar elementos del tipo
      | producto | cantidad |
      | Mouse    |        2 |
      | Mouse    |        1 |
    And Verifico cantidad, subtotal y total
      | producto | cantidad | total | subtotal |
      | Mouse    |        3 |    75 |       75 |
    When Recibiendo una tabla decido agregar elementos del tipo
      | producto | cantidad |
      | Mouse    |        1 |
      | Mouse    |        1 |
      | Mouse    |        1 |
    Then Verifico mensaje de error
