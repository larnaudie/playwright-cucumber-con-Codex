Feature: Homepage sesion iniciada
  Scenario: Accedemos a la pagina y cerramos sesion
    Given que abro el portal
    When ingreso con el correo "senior@example.test" y la contraseña "Correcta123!"
    And veo el saludo "Bienvenido, Alex"
    When hago click en el boton agregar en el "Mouse" producto
    Then confirmo que el ultimo producto sea "Mouse"