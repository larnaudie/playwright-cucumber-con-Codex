Feature: Carrito con cantidades
# ## Etapa 4 — Scenario Outline de cantidades
# Casos válidos independientes para Mouse: 1 -> USD 25; 5 -> USD 125.
# Casos inválidos: 0, -1, 6 y 1.5.
# Decidir si usar dos Outlines para representar comportamientos distintos.
# Cada fila empieza con carrito vacío por su nuevo contexto/página.
# Comprobar mensaje y que no se agregó nada en los casos rechazados.
# Usar strings para fill, incluso si el dato representa un número.
# No pases inválidos por un helper que los corrija automáticamente.

  Scenario Outline: Verificamos Valores Validos
    Given Estoy en la pagina de inicio
    When Decido agregar "<cantidad>" elementos del tipo "<producto>"
    Then Verifico el subtotal "<subtotal>" para un producto "<producto>" con una cantidad "<cantidad>"
    Examples:
      | producto | cantidad | subtotal |
      | Mouse    |        1 |       25 |
      | Mouse    |        4 |      100 |

  # Scenario Outline: Verificamos Valores Invalidos
  #   Given Estoy en la pagina de inicio
  #   When Decido agregar "<cantidad>" elementos del tipo "<producto>"
  #   Then Verifico datos invalidos para el subtotal "<subtotal>" para un producto "<producto>" con una cantidad "<cantidad>"
  #   Examples:
  #     | producto | cantidad | subtotal |
  #     | Mouse    |        1 |       10 |
  #     | Mouse    |        4 |        5 |
