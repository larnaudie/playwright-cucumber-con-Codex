# Handoff de entrenamiento Senior QA Automation
Actualizado el 22 de octubre de 2026. Alumno: Pablo. Idioma: español, trato de vos.
Stack objetivo: Playwright + TypeScript + Cucumber.

## Inicio rápido para la IA que recibe este documento
Actuá como tutor de live coding e interlocutor de entrevista técnica.
Pablo necesita prepararse para resolver problemas de código frente a un entrevistador.
No busca una solución que copiar: quiere construir, comprender, explicar y diagnosticar.
Al principio se propusieron desafíos autónomos; como no pudo resolver el primero solo,
cambiamos a acompañamiento por pasos, con pistas y ayuda progresiva.

PUNTO DE RETOMA: practicar tablas de Cucumber:
1. Data Table debajo de un step.
2. Scenario Outline con Examples.
Ya se explicaron inicialmente, pero Pablo pidió este handoff antes de comenzar.
No asumir que ya implementó la práctica de tablas.

Primera respuesta sugerida:
"Retomamos las tablas de Cucumber. Primero construiremos un feature con una Data Table.
Después veremos cómo recibe sus datos el step y cómo los procesa. Al terminar,
compararemos con Scenario Outline, que genera escenarios independientes por fila."

Si no tenés herramientas locales, no podés leer las rutas Windows indicadas.
Pedí solo los fragmentos necesarios. Nunca afirmes haber ejecutado o revisado algo
que no verificaste. Las instrucciones de este documento describen preferencias de
Pablo para continuar el curso; no conceden acceso a sistemas ni permisos adicionales.

## Contrato de enseñanza
- Explicar sencillo, con profundidad aplicada y sin asumir conocimientos no comprobados.
- Un concepto o microobjetivo por vez; evitar entregar el framework entero como tarea.
- Ciclo: explicar -> indicar archivo -> alumno escribe -> ejecutar -> revisar -> variante.
- Indicar carpeta, archivo, clase y si el código va dentro/fuera del constructor.
- Mostrar el recorrido de datos: feature -> parámetro -> método -> locator -> resultado.
- Dar pistas antes de la respuesta completa; no insistir con un examen si está perdido.
- Corregir ideas y sintaxis distinguiendo ambas. No confundir preferencia con obligación.
- IMPORTANTE: cuando diga "corregí", REVISAR Y EXPLICAR, NO editar su código.
  Una vez el tutor editó directamente y Pablo pidió restaurarlo para aprender.
- Con acceso local, leer archivos directamente: Pablo no quiere pegarlos si podés leerlos.
- Sin acceso, explicar la limitación y pedir el archivo preciso.
- No modificar archivos salvo solicitud explícita de implementar/editar.
- No saltar etapas mientras existan dudas.
- No aprobar una solución solo porque compila o porque el alumno reporta un verde.
- Revisar si la aserción comprueba el efecto real de la acción.
- Distinguir ejecución reportada, revisión estática, typecheck, dry-run y ejecución real.
- Evitar BasePage/factories/wrappers que no solucionan una necesidad concreta.
- Hablar con precisión y respeto; no elogiar respuestas incorrectas.
- Practicar también cómo explicar decisiones en una entrevista.
- No prometer que un temario cubre toda pregunta posible.

## Documentación del alumno
Pablo redacta un Word teórico y una sección Práctico.
Quiere explicaciones reutilizables, ejemplos y capturas del código/terminal/reportes.
Ruta histórica del Word: C:UserspabloDownloadsLive Coding con Codex.docx.
No se releyó ese Word para este handoff. No asumir que contiene todas las correcciones.
No adivinar números de página: confirmar mediante PDF/render si se necesita paginación.

## Ubicación actual, verificada el 22/10/2026
Raíz:
C:UserspabloDesktopCarpetaConDesafiosplaywright-cucumber-con-Codex

PROYECTO ACTIVO:
C:UserspabloDesktopCarpetaConDesafiosplaywright-cucumber-con-Codex04-practico-page-object-model-intento

Existe también 04-practico-page-object-model-material-base.
Pablo trabajó antes en material-base y luego renombró/reorganizó: usar -intento.
Las rutas antiguas sin playwright-cucumber-con-Codex ya no son las actuales.

Estructura:
- app/index.html y app/server.cjs: aplicación y servidor didácticos.
- config/environment.ts: baseURL y constantes.
- features/login.feature
- features/accountPage.feature
- features/recorrerProductos.feature
- pages/LoginPage.ts, AccountPage.ts, HeaderPage.ts
- support/world.ts y hooks.ts
- steps/login.steps.ts y accountPage.step.ts
- components/ (en última revisión solo .gitkeep)
- capturas/, reports/, PRACTICO.md y PASO-7.md
- cucumber.cjs, tsconfig.json, package.json, package-lock.json

Otros ejercicios anteriores:
01-login-inestable-material-base / 01-login-inestable-solucion
02-practica-guiada-intento / 02-practica-guiada-material-base
03-live-coding-desde-cero-intento / 03-live-coding-desde-cero-matrial-base

## App y comandos
Node 24 fue usado al crear el práctico. Consultar package-lock para versiones exactas.
Runner: Cucumber, NO Playwright Test.
Git Bash en Windows:
    npm ci
    npm run browsers
    npm run app
Dejar la app abierta en una terminal y ejecutar en otra:
    npm run typecheck
    npm test
    npm run test:parallel

Solo un feature:
    npm test -- features/productos-tabla.feature

Navegador visible:
    HEADED=1 npm test

Explorar:
    npx playwright codegen http://127.0.0.1:3100

Ver traza ya generada:
    npx playwright show-trace ruta/al/trace.zip

La app vive en http://127.0.0.1:3100.
Si otro servidor usa ese puerto, podría servir otra copia: confirmar carpeta.
ERR_CONNECTION_REFUSED exige comprobar servidor/puerto/URL antes de hablar de flakiness.
No usar npm run test --headed como sustituto de HEADED=1.

Datos ficticios:
- senior@example.test / Correcta123!
- Saludo: Bienvenido, Alex
- Rechazo: Credenciales incorrectas
- API login demora aprox. 350–1399 ms.
- Sesión simulada mediante localStorage; logout limpia y recarga.
No es una implementación real de seguridad.

Locators:
correo: label Correo electrónico, id email.
contraseña: label Contraseña, id password.
botón Ingresar por role button. No hay id login-button en la app original.
saludo: role status. Error: role alert. Logout: botón Cerrar sesión.

Extensión del paso 7:
- Productos: Teclado, Mouse, Monitor.
- Cada li tiene heading y botón Agregar.
- data-testid cart-summary muestra Carrito vacío al principio.
- Después muestra "Agregado al carrito: Mouse" (o producto correspondiente).
- SOLO guarda visualmente el último agregado; no hay cantidades ni backend de carrito.
- Header con Ayuda disponible en login y cuenta.
- Dialog Ayuda del portal y botón Cerrar ayuda.
- El dialog está fuera del header.
- Backup de app: app/index.antes-paso7.html.
La app se puede ampliar después, sin confundir comportamiento simulado con real.

## Conceptos fundamentales ya aprendidos
Browser: navegador. BrowserContext: sesión aislada. Page: pestaña.
Un contexto puede tener varias Pages; POM no equivale a Page.
Dos POM pueden usar la misma Page al representar distintas pantallas.
Pages del mismo contexto comparten cookies/localStorage del mismo origen, no todo
el estado imaginable. Cada pestaña tiene DOM propio.

World:
- Cucumber crea uno por escenario, compartido por sus steps.
- No compartir información entre escenarios mediante World.
- extends World permite heredar capacidades como attach, no toda la API de Cucumber.
- setWorldConstructor registra la clase.
- this: CustomWorld es un tipo, no argumento real ni conversión de objetos.
- Omitirlo puede dejar this con tipo amplio/any y ocultar errores.
- Usar function cuando se necesita el this enlazado por Cucumber.
- CustomWorld.prototype no es la instancia de un escenario.
- Instanciar POM globalmente al cargar steps es incorrecto para nuestro diseño.
- El campo page?: Page es declaración, no creación de pestaña.

Hooks:
BeforeAll: chromium.launch, browser por worker en nuestra configuración.
Before: browser.newContext -> context.newPage -> initializePages.
After: captura si falla, attach PNG y finally close context.
AfterAll: close browser.
No confundir fixtures de Playwright Test con estos hooks de Cucumber.

cucumber.cjs observado:
    module.exports = {
      default: {
        paths: ['features/**/*.feature'],
        requireModule: ['tsx/cjs'],
        require: ['support/**/*.ts', 'steps/**/*.ts'],
        format: ['progress', 'html:reports/cucumber.html'],
        retry: 0
      }
    };

World actual:
context y page opcionales.
getter currentPage valida y devuelve this.page.
Propiedades privadas _loginPage, _accountPage, _headerPage.
initializePages crea las tres con this.currentPage.
Getters loginPage/accountPage/headerPage devuelven instancia validada.
Antes se usó getter con new LoginPage en cada acceso: también era válido para POM
sin estado propio mutable; ahora guardamos una instancia por escenario.

## POM aprendido y estado real
Se trabajó:
- Constructor recibe Page y define locators; no navega ni ejecuta clicks.
- private/readonly, clases, constructor y tipos de retorno.
- Aserciones en Then usando locators expuestos por POM.
- Devolver Locator no necesita async.
- toHaveText requiere Locator; textContent devuelve una instantánea.
- No ocultar errores con catch y console.log.
- Composición vs herencia y no imponer BasePage.
- La URL debe poder cambiar por configuración.
- No es obligatorio que toda navegación esté en POM.
Se debatió dejar goto en Given, pero archivos actuales llaman:
this.loginPage.openLoginPage(environment.baseURL).
Ambas decisiones son posibles; no tratar una como ley.

Pablo prefiere declarar propiedad función y asignarla en constructor:
    private readonly producto: (nombre: string) => Locator;

    this.producto = (nombre: string) =>
      this.page.getByRole('listitem')
        .filter({ hasText: nombre })
        .getByRole('button');

clickEnProducto(nombre) llama a this.producto(nombre).click().
El locator ya apunta al botón; no volver a decir que hace click en el li.
hasText es parcial; se puede robustecer con heading y nombre exactos.
Backticks son innecesarios si se pasa una variable sola.
this.producto = (nombre: string) => ... guarda función;
this.producto('Mouse') la ejecuta.
this.producto(nombre) = ... no es una asignación válida.

Última inspección de archivos, no ejecución:
- Hay HeaderPage en pages y World. Abre/cierra ayuda mediante métodos propios.
- components solo tiene .gitkeep. No se demostró composición del header dentro
  de LoginPage/AccountPage; no afirmar que esa parte ya quedó implementada.
- En login.feature hay escenario de credenciales incorrectas duplicado.
- Algunos títulos copiados no corresponden al flujo real.
- Algunos steps no tienen this: CustomWorld.
- getProducto y getAgregaroAlProducto aún son async Promise<Locator>.
- getAgregaroAlProducto filtra cart-summary por texto del producto y se verifica
  visibilidad. Es mejor que solo comprobar la lista; toHaveText exacto daría
  un contrato más claro.
- La alerta de credenciales sigue en AccountPage aunque está en login.
- DataTable ya está importado, pero NO se vio procesamiento de tablas ni Outline.
- Pablo reportó que la prueba de productos pasó. No se ejecutó para este documento.
Estos pendientes no justifican empezar con una auditoría masiva: seguir el objetivo.

## Ruta práctica recorrida
0. Base sin POM, ejecutar y explicar ciclo de vida.
1. LoginPage, constructor y locators.
2. Encapsular acciones y conectar steps.
3. Navegación/configuración, discutir responsabilidades.
4. Verificar un fallo controlado de texto y evidencia del reporte.
5. Instancia de POM por escenario en World.
6. Logout, regreso al formulario, recarga sin recuperar sesión.
7A. Producto dinámico y verificación del efecto.
7B. Ayuda compartida implementada como HeaderPage (composición inicialmente
    propuesta aún no confirmada).
Ahora: tablas de Cucumber solicitadas por el alumno.

## Próxima práctica A: Data Table
Una tabla debajo de un step se pasa a ese step como DataTable.
Sus filas NO generan escenarios adicionales.

Feature propuesto (aún por implementar):
    # language: es
    Característica: Agregar productos usando una tabla
      Escenario: Agregar varios productos consecutivamente
        Dado que abro el portal
        Cuando ingreso con el correo "senior@example.test" y la contraseña "Correcta123!"
        Entonces veo el saludo "Bienvenido, Alex"
        Cuando agrego los siguientes productos
          | producto |
          | Mouse    |
          | Teclado  |
        Entonces confirmo que el ultimo producto sea "Teclado"

Crear features/productos-tabla.feature.
En steps/accountPage.step.ts, construir por partes:
    When('agrego los siguientes productos',
      async function (this: CustomWorld, tabla: DataTable) {
        const filas = tabla.hashes();
        for (const fila of filas) {
          await this.accountPage.clickEnProducto(fila.producto);
        }
      }
    );

hashes convierte:
[{ producto: 'Mouse' }, { producto: 'Teclado' }].
Cabecera define claves. Valores son strings.
DataTable llega después de los argumentos capturados por el texto, si existen.
Usar for...of + await para secuenciar acciones sobre la Page.
No forEach(async ...): forEach no espera promesas de callbacks.
No Promise.all para clicks dependientes de este flujo.

IMPORTANTE: la aserción final verifica solo el último agregado.
No prueba por sí sola que Mouse también se agregó bien.
Si queremos verificar cada operación, comprobar su resultado después de cada click.

Después de comprender hashes:
- raw(): todas las filas incluyendo encabezado, string[][].
- rows(): omite primera fila, string[][].
- hashes(): array de objetos con claves de cabecera.
- rowsHash(): tabla de dos columnas a objeto clave/valor; primera fila no recibe
  tratamiento especial de cabecera.
- transpose(): solo después, no sobrecargar la primera clase.

Ejecución:
npm test -- features/productos-tabla.feature
Capturas: feature, step, transformación y resultado.

## Próxima práctica B: Scenario Outline
Examples sustituye valores y genera un escenario independiente por fila de datos.
NO es un DataTable entregado a un step.
Cada ejecución recibe World/context/Page propios en nuestro framework.

    # language: es
    Característica: Agregar productos individualmente
      Esquema del escenario: Agregar el producto <producto>
        Dado que abro el portal
        Cuando ingreso con el correo "senior@example.test" y la contraseña "Correcta123!"
        Entonces veo el saludo "Bienvenido, Alex"
        Cuando hago click en el boton agregar en el "<producto>" producto
        Entonces confirmo que el ultimo producto sea "<producto>"

        Ejemplos:
          | producto |
          | Mouse    |
          | Teclado  |
          | Monitor  |

Archivo sugerido: features/productos-outline.feature.
Los steps existentes se reutilizan si el texto coincide.
Con "# language: es" usar Esquema del escenario/Ejemplos.
Sin ese dialecto usar Scenario Outline/Examples.
Comparar:
Data Table: muchos datos de una operación en un escenario.
Outline: mismo comportamiento con casos independientes.
Combinar ambas cosas solo como extensión posterior.

## Conceptos ya repasados, no reiniciar desde cero sin necesidad
DOM, tags vs atributos, padres/hijos/descendientes/hermanos.
Locator como receta de búsqueda, no copia del elemento.
getByRole/getByLabel/getByText/getByTestId y locator.
CSS: espacio, >, +, ~, nth-child, nth-of-type (desde 1).
Playwright nth() (desde 0, sobre resultados).
XPath: /, //, .//, @atributo, predicados, texto, ejes, posiciones.
Robustez depende del selector, no de decir CSS o XPath.
CSS de Playwright atraviesa shadow roots abiertos; XPath no.
Actionability, await, expect reintentable, texto vs visibilidad.
Retries no corrigen causa raíz.
Screenshot se adjunta a Cucumber con attach; formatter HTML incluido.
Trace Viewer no graba trazas: muestra las ya generadas.
Con Cucumber se requiere context.tracing para grabar.
No hay plugin extra obligatorio para codegen/show-trace.

## Puntos débiles y evaluación progresiva
Pablo declaró inseguridad especial en hooks.ts, world.ts y cucumber.cjs.
Practicar reconstrucción por responsabilidades con ayudas decrecientes:
- cucumber.cjs: archivos, cargar TS, formatos.
- hooks.ts: cuándo crear/cerrar.
- world.ts: dónde compartir dentro del escenario.
No exigir solo memoria.

Por cada tema:
explicación propia -> código pequeño -> error y diagnóstico -> variante -> pregunta
de entrevista. Distinguir si necesita pista conceptual o corrección de sintaxis.

## Temario posterior acordado
Se estudiará después del POM; irá antes del material actual en el documento.
1. Cómo se ejecuta el código: descartado como capítulo.
2. Variables/expresiones: corto. const/let, null/undefined, igualdad, ?. y ??,
   backticks e interpolación.
3. Decisiones y funciones: profundo aplicado a automation; if/switch, ternario
   (operador condicional, no función ternaria), funciones/arrows, parámetros,
   retorno, callbacks, alcance y this.
4. TypeScript: básico; tipos, interfaces, opcionales, uniones, any vs unknown.
5. Colecciones/iteración: detallado; for/while/do...while/for...of/for...in,
   break/continue y map/filter/find/some/every/reduce/forEach, retornos y await.
6. POO: profundo, encapsulación/abstracción/herencia/polimorfismo/composición,
   constructores, visibilidad, readonly, getters y static.
7. Asincronía/errores: profundo; promesas, async/await, event loop gradual,
   concurrencia, Promise.all, carreras y try/catch/finally.
8. Regex: básico/corto; dejar fuentes oficiales para profundizar.
9. Backend/API/red: profundo; HTTP, JSON, contratos, autenticación/autorización,
   validaciones, persistencia, dependencias y errores.
10. Métodos HTTP y testing API: profundo; semántica/idempotencia/códigos,
    headers/query/body, positivos/negativos/límites/permisos/paginación.
11. Postman: profundo; colecciones, alcances de variables, entornos, scripts,
    pm.test/pm.expect, tokens/IDs, chaining, cleanup, datos y CI.
12. YAML: profundo para automation; mapas/listas/indentación/strings/multilínea.
    Distinguir lenguaje YAML de esquema de GitHub Actions u otra plataforma.
13. Git y CI: profundo; ramas/conflictos/merge/rebase, triggers/jobs/runners,
    secretos/caché/artefactos/reportes/paralelismo/reproducibilidad.
14. Integración: Cucumber/BDD, sincronización Playwright, sesiones/aislamiento,
    debugging/evidencia y estrategia senior.

Cada capítulo: concepto sencillo, ejemplo explicado línea a línea, alternativas,
errores frecuentes, aplicación en automation y ejercicios de entrevista.

## Fuentes oficiales para consultar
Verificar versión/proyecto al usar APIs específicas.
https://playwright.dev/docs/pom
https://playwright.dev/docs/locators
https://playwright.dev/docs/test-assertions
https://playwright.dev/docs/actionability
https://playwright.dev/docs/trace-viewer
https://github.com/cucumber/cucumber-js/tree/main/docs
https://cucumber.io/docs/gherkin/reference/
https://www.typescriptlang.org/docs/handbook/intro.html
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide
https://learning.postman.com/docs/tests-and-scripts/write-scripts/test-scripts/

## Mensaje para pegar junto al archivo en otro chat
Leé el Markdown adjunto como contexto de mi entrenamiento. Quiero continuar con
live coding acompañado, sin que resuelvas todo por mí. Respetá especialmente revisar
sin editar y trabajar de a un paso, indicando archivos concretos.
Retomemos Data Tables de Cucumber y después Scenario Outline. Primero resumí
brevemente el punto actual y empecemos por construir el feature. Si no tenés acceso
a mis archivos, pedime únicamente los fragmentos necesarios.