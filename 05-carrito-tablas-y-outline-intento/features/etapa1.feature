Feature: Carrito con cantidades

#  Crear un escenario que agregue 2 Mouse y compruebe:
#- Fila Mouse con cantidad 2, precio USD 25 y subtotal USD 50.
#- Total USD 50.
#Construir CartPage e integrarlo en World con una instancia por escenario.
#Diferenciar locator del producto en catálogo y locator de fila del carrito.
#Primero escribir el feature propio; después construir los métodos necesarios.

  Scenario: Vamos a agregar 2 mouse y comprobarlos
    Given Estoy en la pagina de inicio
    When Decido agregar "2" elementos del tipo "Mouse"
    Then Verifico que el total sea "50"
    And Verifico que el subtotal del producto "Mouse" sea "25"
