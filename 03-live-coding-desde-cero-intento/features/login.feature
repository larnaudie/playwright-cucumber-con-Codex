# language: en
Feature: Acceso al portal
  Scenario: Acceso con credenciales válidas
    Given que abro el portal
    When ingreso con el correo "senior@example.test" y la contraseña "Correcta123!"
    Then veo el saludo "Bienvenido, Alex"