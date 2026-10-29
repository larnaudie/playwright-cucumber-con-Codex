Feature: Agregar productos usando una tabla

  Scenario: Agregar varios productos consecutivamente
    Given que abro el portal
    When ingreso con el correo "senior@example.test" y la contraseña "Correcta123!"
    Then veo el saludo "Bienvenido, Alex"
    And agrego los siguientes productos
      | producto |
      | Mouse    |
      | Teclado  |
    Then confirmo que el ultimo producto sea "Teclado"