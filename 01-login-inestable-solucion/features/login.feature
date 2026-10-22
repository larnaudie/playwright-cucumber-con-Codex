# language: es
Característica: Acceso al portal
  Escenario: Acceso con credenciales válidas
    Dado que abro el portal
    Cuando ingreso con el correo "senior@example.test" y la contraseña "Correcta123!"
    Entonces veo el saludo "Bienvenido, Alex"

  Escenario: Rechazo de credenciales incorrectas
    Dado que abro el portal
    Cuando ingreso con el correo "senior@example.test" y la contraseña "incorrecta"
    Entonces veo el error "Credenciales incorrectas"

  Escenario: Cerrar sesión elimina la sesión persistida
    Dado que abro el portal
    Cuando ingreso con el correo "senior@example.test" y la contraseña "Correcta123!"
    Entonces veo el saludo "Bienvenido, Alex"
    Cuando cierro sesión
    Entonces veo el formulario de acceso
    Cuando recargo la página
    Entonces veo el formulario de acceso