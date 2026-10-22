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

  Escenario: Rechazo de credenciales incorrectas
    Dado que abro el portal
    Cuando ingreso con el correo "senior@example.test" y la contraseña "incorrecta"
    Entonces veo el error "Credenciales incorrectas"

  Escenario: Abro y cierro el login.
    Dado que abro el portal
    Cuando hago click en el boton ayuda
    Y veo que se abre el portal de ayuda
    Entonces hago click en cerrar ayuda
    Y se cierra el modal de portal de ayuda