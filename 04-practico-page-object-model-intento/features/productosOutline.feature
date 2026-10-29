Feature: Agregar productos individualmente

  Scenario Outline: Agregar el producto <producto>
    Given que abro el portal
    When ingreso con el correo "senior@example.test" y la contraseña "Correcta123!"
    Then veo el saludo "Bienvenido, Alex"
    When hago click en el boton agregar en el "<producto>" producto
    Then confirmo que el ultimo producto sea "<producto>"

    Examples:
      | producto |
      | Mouse    |
      | Teclado  |
      | Monitor  |