# Práctico de Page Object Model

Este archivo es tu espacio para registrar la implementación y pegar sus explicaciones
en el documento de estudio. Guardá las imágenes en capturas/.
Las capturas de aprendizaje son manuales; la screenshot automática del reporte solo
se genera cuando un escenario falla.

## 0. Estado inicial sin POM
Objetivo: comprender el código antes de reorganizarlo.
- Leer features/login.feature, support/world.ts, support/hooks.ts y steps/login.steps.ts.
- Ejecutar los dos escenarios, secuencialmente y en paralelo.
- Explicar quién crea el navegador y cómo llega la página a los steps.
Capturas sugeridas: estructura de carpetas, When original y resultado de la terminal.
Mi explicación:
Resultado:

## 1. Clase y constructor
Archivo: pages/LoginPage.ts.
- Crear clase exportada que reciba la Page existente.
- Declarar locators tipados para correo, contraseña y botón.
- Discutir readonly y visibilidad pública/privada.
- No navegar, completar ni hacer click dentro del constructor.
- Ejecutar typecheck. El comportamiento de la suite todavía no cambió.
Captura: clase con constructor.
Mi explicación:
Resultado:

## 2. Encapsular la operación de login
Archivos: pages/LoginPage.ts y steps/login.steps.ts.
- Agregar login(email, password): Promise<void>.
- Mover las tres acciones del When al método.
- Importar LoginPage en steps y crear una instancia local con currentPage.
- Reemplazar únicamente el cuerpo del When por la llamada al método.
- Verificar escenarios válidos e inválidos.
Capturas: método login, When antes/después y resultado.
Mi explicación:
Resultado:

## 3. Navegación y configuración
Archivos: pages/LoginPage.ts, config/environment.ts y steps/login.steps.ts.
- Diseñar open() y pasar la URL de configuración explícitamente o por constructor.
- Mantener BASE_URL fuera de los literales del Page Object.
- Refactorizar el Given.
- Explicar por qué new LoginPage(page) no navega.
Capturas: configuración, open y Given.
Mi explicación:
Resultado:

## 4. Verificaciones y contratos
Archivos: pages/LoginPage.ts y steps/login.steps.ts.
- Elegir aserciones en Then o métodos explícitos expectGreeting/expectError.
- Mantener comprobación de visibilidad y texto.
- No agregar una aserción de login exitoso dentro de login(): también prueba rechazos.
- Si la página usa expect, importarlo desde @playwright/test.
- Forzar un texto incorrecto, confirmar fallo y screenshot, luego revertir.
Capturas: Then, verificación y reporte del fallo.
Mi explicación:
Resultado:

## 5. Integración con World
Archivo: support/world.ts.
- Reemplazar la creación local por un getter loginPage, después de discutir el diseño.
- Comparar getter que crea un objeto en cada acceso con instancia guardada por escenario.
- Entender que ambas pueden usar la misma pestaña; ningún Page Object debe ser global.
- Mantener la limpieza de context en hooks.
Capturas: World y steps finales.
Mi explicación:
Resultado:

## 6. Ampliar con logout
Archivos: features/login.feature, pages/AccountPage.ts y steps/login.steps.ts.
- Crear AccountPage cuando lleguemos a esta etapa; todavía no está preparada.
- Implementar logout sobre la misma Page.
- Crear escenario que inicie sesión, cierre sesión y confirme el formulario.
- Recargar para confirmar que no reaparece la sesión.
- Explicar cambio de pantalla frente a cambio de pestaña.
Capturas: escenario, AccountPage y resultado.
Mi explicación:
Resultado:

## 7. Locators dinámicos y componentes (extensión posterior)
La app base es un login: no tiene una tabla de órdenes ni un encabezado compartido
entre varias pantallas. Cuando lleguemos aquí ampliaremos la app juntos.
- Agregar una lista con elementos identificables para practicar un locator parametrizado.
- Extraer un componente solo si existe comportamiento reutilizable real.
- Discutir composición frente a BasePage.
No inventar clases vacías solo para cumplir el patrón.
Mi explicación:
Resultado:

## 8. Defensa de entrevista
- ¿Qué cambió al pasar a POM y qué comportamiento se conservó?
- ¿Quién administra Browser, BrowserContext y Page?
- ¿Por qué LoginPage no importa Cucumber ni World?
- ¿Qué elegiste exponer y qué ocultar?
- ¿Por qué el patrón no elimina por sí mismo la flakiness?
- ¿Qué harías si un locator coincide con dos elementos?
- ¿Qué ventaja aportaría una BasePage concreta? ¿Y qué costo?
Mi respuesta: