Feature: Homepage sesion iniciada
  Scenario: Accedemos a la pagina y cerramos sesion
    Given que abro el portal
    When ingreso con el correo "senior@example.test" y la contraseña "Correcta123!"
    And veo el saludo "Bienvenido, Alex"
    When hago click en el boton de cerrar sesion
    Then veo la pagina del login
    And si recargo la pagina
    Then veo la pagina del login