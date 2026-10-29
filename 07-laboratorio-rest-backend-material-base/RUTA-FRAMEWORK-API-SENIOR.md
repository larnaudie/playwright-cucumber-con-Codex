# Ruta progresiva hacia un framework de APIs con Playwright
Complemento del PRACTICO-BACKEND-REST.md · 27/10/2026

## Qué cambia en el plan
Los módulos 1–16 enseñan HTTP, automatización directa y bases de organización.
No bastan por sí solos para afirmar que se construyó un framework de nivel senior.
Agregamos módulos 17–26 para diseñar, mantener y defender esa arquitectura.

No hay una plantilla oficial única llamada "framework senior".
El diseño de este curso es una propuesta basada en mecanismos oficiales de Playwright,
contratos HTTP y riesgos de testing. Se evalúa criterio y ejecución, no cantidad de clases.
No vamos a implementar toda esta estructura antes de que entiendas sus partes.

Todos los módulos conservan el formato:
concepto -> preparación -> petición completa -> ejemplo -> variante -> revisión.
Los ejemplos HTTP remiten a la misma app y sus bodies concretos.
Cuando aparezca un archivo nuevo, se explica ANTES qué responsabilidad tiene.

## Resultado observable al terminar
Poder construir y explicar una suite que:
- Cambie de entorno sin editar tests ni duplicar URLs.
- Valide configuración antes de emitir peticiones.
- Separe clientes, datos, contratos, fixtures y escenarios.
- Prepare recursos propios y limpie incluso ante fallos normales de un test.
- Ejecute negativos sin helpers que los conviertan en positivos.
- Diferencie autenticación, autorización y aislamiento.
- Diagnostique mediante evidencia sanitizada.
- Funcione individualmente, en conjunto y en paralelo.
- Corra en CI con dependencias reproducibles y reportes útiles.
- Permita incorporar un endpoint nuevo sin copiar medio framework.

Las fixtures no garantizan limpieza si el proceso es terminado abruptamente.
Para escenarios reales se discutirá seguimiento de recursos y recolección posterior,
sin introducir un borrado global peligroso.

## Estructura objetivo — se construye por etapas
~~~text
playwright.config.ts
config/
  environment.ts            selección y validación de entorno
  headers.ts                headers comunes no sensibles
clients/
  TasksClient.ts            rutas y operaciones de tareas
  SessionsClient.ts         operaciones de sesión
models/
  task.ts                   tipos de entrada/salida/error
fixtures/
  api.fixture.ts            inyección de clientes
  task.fixture.ts           recursos y limpieza por test
  auth.fixture.ts           identidad y contextos autenticados
data/
  task.factory.ts           datos válidos únicos, con overrides
  invalid-tasks.ts          entradas negativas deliberadas
schemas/
  task.schema.ts            contrato ejecutable de Task
assertions/
  task.assertions.ts        validaciones compartidas con intención clara
tests/
  smoke/
  tasks/
  auth/
  contracts/
  resilience/
support/
  sanitize.ts               redacción de datos sensibles
  attachments.ts            evidencia HTTP
postman/
reports/                    generado, sin versionar
.env.example                nombres y valores ficticios
.github/workflows/api.yml   última etapa
~~~
Una carpeta se crea cuando exista una responsabilidad real.
No se exige BaseApiClient ni patrón Factory para construir un solo objeto.
No se necesitan Pages para tests HTTP. Una suite mixta puede tener pages/ aparte.

## Mapa de transición desde los módulos actuales
| Al terminar | Habilidad consolidada | Evolución posterior |
|---|---|---|
| 1–3 | request/response, filtros y aserciones | 17 configuración por entorno |
| 4–10 | CRUD, datos, errores y paginación | 18 clientes/tipos y 21 aislamiento |
| 11–12 | tokens, roles y Postman | 20 fixtures autenticadas |
| 13–14 | transporte y contratos | 22 validación y 23 evidencia |
| 15–16 | arquitectura inicial y suite reproducible | 19 fixtures, 24 selección, 25 CI |
| 17–25 | piezas conectadas | 26 desafío y defensa técnica |

El orden recomendado de la segunda etapa es 17 -> 18 -> 19 -> 20 -> 21 -> 22
-> 23 -> 24 -> 25 -> 26. Las referencias de la tabla son conexiones, no saltos obligatorios.

# 17. Variables, entornos y playwright.config.ts

## Prerrequisitos
Módulos 1–4: distinguir URL, headers, cliente y test.
Saber que process.env no carga archivos por sí mismo.
Antes de cambiar archivos, ejecutar el test health actual como referencia.

## 17A. Una sola fuente de configuración
Empezamos con baseURL y Accept en config.
El test usa request.get('/api/tasks'), sin repetir origen ni puerto.
Una ruta que empieza con / reemplaza el path de baseURL:
baseURL=https://host/api/v2/ + /tasks -> https://host/tasks.
Explicar esto antes de configurar APIs con prefijos.

Ejercicio:
- Llevar URL a API_URL y usar rutas de manera consistente.
- Probar el mismo health con dos puertos locales controlados.
- Verificar response.url() para diagnosticar resolución.
- No usar PokéAPI y el backend local bajo un mismo baseURL sin separar proyectos
  o contexto HTTP: son servicios diferentes.

## 17B. Seleccionar y validar entorno
Antes de implementarlo se explican:
TEST_ENV es selector local/qa.
API_URL es dirección.
API_REQUEST_TIMEOUT_MS es presupuesto de una petición.
TEST_ENV no es nombre de archivo mágico: nuestra función lo interpreta.
Los nombres son convención del curso, no requisitos de Playwright.

Entrega:
config/environment.ts que carga archivo opcional del entorno y valida:
- selector conocido;
- URL HTTP/HTTPS;
- timeout entero positivo;
- para qa, URL explícita, sin caer silenciosamente a localhost.
En CI puede no haber .env: usar variables proporcionadas por el proceso.
No usar ! o as string para esconder configuración ausente.
.env.example se versiona; .env, tokens y reportes sensibles no.

Ejemplo de archivos (ficticios):
~~~dotenv
# .env.local
API_URL=http://127.0.0.1:3400
API_REQUEST_TIMEOUT_MS=5000
~~~
~~~dotenv
# .env.qa
API_URL=https://qa.example.test
API_REQUEST_TIMEOUT_MS=8000
~~~
qa.example.test NO existe como entorno desplegado de este curso.
No ejecutar contra él: es una muestra de configuración, no backend disponible.

Git Bash:
~~~bash
TEST_ENV=local npm test
~~~
PowerShell:
~~~powershell
$env:TEST_ENV = 'local'
npm.cmd test
~~~


### Cargar archivo y validar: modelo para construir por partes
En config/environment.ts, con Node 24 y CommonJS del laboratorio:
~~~typescript
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { resolve } from 'node:path';

const name = process.env.TEST_ENV ?? 'local';
if (name !== 'local' && name !== 'qa') {
  throw new Error('TEST_ENV debe ser local o qa');
}
const file = resolve(__dirname, '..', '.env.' + name);
if (existsSync(file)) loadEnvFile(file);
const apiURL = process.env.API_URL
  ?? (name === 'local' ? 'http://127.0.0.1:3400' : undefined);
if (!apiURL) throw new Error('Falta API_URL para el entorno seleccionado');
const parsed = new URL(apiURL);
if (!['http:', 'https:'].includes(parsed.protocol)) {
  throw new Error('API_URL requiere http o https');
}
if (parsed.username || parsed.password || parsed.search || parsed.hash) {
  throw new Error('API_URL no debe incluir credenciales, query ni fragmento');
}
if (parsed.pathname !== '/') {
  throw new Error('En este curso API_URL debe ser un origen sin prefijo de ruta');
}
const rawTimeout = process.env.API_REQUEST_TIMEOUT_MS ?? '5000';
if (!/^[1-9]\d*$/.test(rawTimeout)) {
  throw new Error('API_REQUEST_TIMEOUT_MS debe ser un entero positivo');
}
const requestTimeoutMs = Number(rawTimeout);
if (!Number.isSafeInteger(requestTimeoutMs)) {
  throw new Error('API_REQUEST_TIMEOUT_MS está fuera de rango');
}
export const env = { name, apiURL: parsed.origin, requestTimeoutMs };
~~~

loadEnvFile recibe una ruta de archivo; nunca API_URL.
__dirname es la carpeta del archivo en este proyecto CommonJS.
existsSync evita exigir un archivo en CI. new URL valida la sintaxis.
parsed.origin normaliza el origen sin slash final; /api queda en las rutas.
No copiar esta convención para una API que requiere prefijos sin revisarla.
Las variables del proceso prevalecen sobre el archivo cargado por loadEnvFile.
TEST_ENV se selecciona desde el proceso antes de elegir el archivo.
Migramos conscientemente del .env anterior a .env.local, sin dejar dos archivos
activos cuyo orden de carga no podamos explicar.

Práctica: qa sin URL, protocolo inválido y timeout "abc" deben fallar antes del test.
Comprobar precedencia de una variable de terminal y aprender a quitarla después.
## 17C. Headers por alcance
Accept puede ser común en config.
Content-Type se coloca según la petición: JSON, multipart, texto.
Authorization pertenece a la identidad del test/contexto, no a un token global.
X-Request-Id de la respuesta no es un header que debamos generar por defecto.
No registrar credenciales ni desactivar HTTPS globalmente.

Petición conocida para comprobar configuración:
GET /api/health, Accept application/json, sin body/auth -> 200.
Variante: POST /api/tasks con data objeto y sin Content-Type manual -> 201.
Negativo: mismo endpoint con bytes y text/plain -> 415.

## 17D. Distintos timeouts
timeout de test limita el caso.
timeout de request limita una operación HTTP.
expect.timeout sirve a aserciones reintentables; no vuelve a enviar un GET por sí solo.
No usar actionTimeout como sustituto genérico del timeout de API sin revisar su alcance.
Ejercicio de demora:
GET /api/lab/delay?ms=1000, Accept opcional, sin body/auth.
request timeout 100 -> excepción de timeout; no status 408 devuelto por nuestra API.

## Configuración objetivo ilustrativa
No pegarla todavía: config/environment.ts y la fixture de request se construyen
primero. env.apiURL e env.requestTimeoutMs son valores validados de esa función.

~~~ts
import { defineConfig } from '@playwright/test';
import { env } from './config/environment';

export default defineConfig({
  testDir: './tests',
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: false,
  workers: process.env.CI ? 2 : 1,
  retries: 0,
  timeout: 20_000,
  globalTimeout: 120_000,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['junit', { outputFile: 'reports/junit/results.xml' }],
  ],
  outputDir: 'reports/results',
  use: {
    baseURL: env.apiURL,
    extraHTTPHeaders: { Accept: 'application/json' },
  },
});
~~~
Los tiempos son presupuestos de ejemplo que se justifican para este laboratorio,
no recomendaciones universales. Dos workers es una etapa de prueba, no un óptimo.
Retries queda 0 hasta aprender política explícita de reintentos.
globalTimeout se ajustará al tamaño real de la suite.

apiRequest.newContext({ timeout: env.requestTimeoutMs }) permite aplicar un timeout
al contexto HTTP propio que construiremos; hay que disponerlo con dispose().
Si seguimos con request incorporado, comenzar con timeout por llamada antes de
reemplazar fixtures. No presentar una opción inventada requestTimeout en use.

## Cierre del módulo
Con URL inválida, fallar antes de hacer requests.
Sin .env en CI, funcionar si existen variables explícitas.
Cambiar entorno no modifica tests.
Explicar qué valores son de proyecto, proceso, contexto y petición.
No continuar hasta que puedas reconstruir config por responsabilidades.

# 18. Clientes API tipados que no ocultan comportamiento

## Conceptos nuevos
DTO: objeto de datos que se envía o recibe.
APIResponse: estado/headers/body de respuesta.
Tipo de TS y validación de red son responsabilidades distintas.
Cliente agrupa operaciones; tests definen expectativas.
No todo helper debe comprobar 200 ni convertir errores en excepciones propias.

Archivo models/task.ts:
~~~ts
export type Priority = 'baja' | 'media' | 'alta';

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  priority: Priority;
}

export interface CreateTaskInput {
  title: string;
  completed?: boolean;
  priority?: Priority;
}

export type ReplaceTaskInput = Omit<Task, 'id'>;
export type UpdateTaskInput = Partial<ReplaceTaskInput>;
~~~
Omit quita un campo. Partial hace opcionales todos los campos.
Partial permite {} en compilación: el servidor todavía exige algún campo para PATCH.

Archivo clients/TasksClient.ts, primer paso:
~~~ts
import type { APIRequestContext } from '@playwright/test';
import type { CreateTaskInput } from '../models/task';

export class TasksClient {
  constructor(private readonly http: APIRequestContext) {}

  list() {
    return this.http.get('/api/tasks');
  }

  getById(id: number) {
    return this.http.get('/api/tasks/' + id);
  }

  create(input: CreateTaskInput) {
    return this.http.post('/api/tasks', { data: input });
  }
}
~~~

Petición de ejemplo:
POST /api/tasks, Content-Type JSON por data, Accept heredado, sin auth.
Body:
~~~json
{ "title": "Cliente-titulo-unico", "priority": "alta" }
~~~
201 con Task e ID. 409 si el título ya existe.

Ejercicio:
- Extraer getById/create de dos tests directos.
- Agregar PUT/PATCH/DELETE y filtro sin copiar assertions dentro.
- Negativo GET de ID eliminado -> 404 con el mismo cliente.
- Para body deliberadamente inválido, usar request directo o una entrada unknown
  explícita de bajo nivel. No romper todo el tipado ni castear como válido.
- Probar que cambiar ruta en un lugar actualiza todos sus consumidores.
Cierre: poder testear éxitos y rechazos sin helpers que impongan 2xx.

# 19. Fixtures: inyección, setup y teardown por test

## Explicación antes del código
Fixture prepara una dependencia, la entrega al test mediante use() y la limpia.
Antes de await use(...) es setup; después es teardown.
Al depender una fixture de otra, Playwright coordina el orden.
request es fixture incorporada por test; no es nuestra base de datos.
Scope worker comparte en un proceso; scope test es individual.
No usar worker scope para un recurso mutable sin justificar aislamiento.

Primer ejemplo, fixtures/api.fixture.ts:
~~~ts
import { test as base, expect } from '@playwright/test';
import { TasksClient } from '../clients/TasksClient';

type ApiFixtures = { tasks: TasksClient };

export const test = base.extend<ApiFixtures>({
  tasks: async ({ request }, use) => {
    const tasks = new TasksClient(request);
    await use(tasks);
  },
});

export { expect };
~~~
Los tests IMPORTAN test desde esta fixture:
~~~ts
import { test, expect } from '../fixtures/api.fixture';

test('leer mediante cliente inyectado', async ({ tasks }) => {
  // Preparar una tarea propia antes de consultar.
  // No afirmar que este esqueleto ya valida un comportamiento.
});
~~~
El cuerpo comentado es solo estructura; debe completarse antes de quedar en suite.

Práctica por etapas:
19A inyectar TasksClient; mantener preparación explícita.
19B crear fixture task: POST propio, await use(task), DELETE al terminar.
19C forzar fallo en el test y verificar que el teardown elimina el recurso.
19D si test ya lo borró, manejar solo 404 documentado, no silenciar todo error.
19E registrar por separado fallos de cleanup.
No intentar todo el ciclo de una vez.

Petición de setup: POST /api/tasks con title único, Content-Type JSON -> 201.
Petición de teardown: DELETE /api/tasks/ID sin body -> 204 o 404 documentado.
Capturar id antes de nuevas aserciones cuando sea posible.
Una terminación abrupta del proceso no garantiza ejecutar teardown.

Cierre: explicar use, dependencia de fixtures y responsabilidad de dispose().
No hacer dispose del request incorporado que administra Playwright.
Sí disponer un APIRequestContext creado manualmente por nuestra fixture.

# 20. Identidades, contextos autenticados y permisos

## Prerrequisito
Haber probado login/token/logout directamente en módulo 11.
No empezar con cache global de tokens.

Diseño gradual:
- SessionsClient hace POST/DELETE de sesión.
- Fixture user obtiene token de usuario.
- Fixture admin obtiene token admin.
- Contexto API por identidad con Authorization propio.
- finally invalida token y dispone el contexto creado.
- Credenciales por entorno; los valores del laboratorio son ficticios.
No usar un token global en playwright.config que autentique accidentalmente negativos.

Petición de login:
POST /api/sessions, Content-Type application/json, sin Authorization.
~~~json
{ "email": "qa@example.test", "password": "Aprender123!" }
~~~
201 -> accessToken. Perfil:
GET /api/profile, Authorization Bearer token, Accept JSON, sin body -> 200.
GET /api/admin/stats con user -> 403; admin -> 200.
DELETE /api/sessions con token -> 204.

Ejercicio:
- Negativo sin token con contexto anónimo.
- Login user y admin en dos contextos diferentes.
- Verificar que user sigue sin permiso después de ejecutar un caso admin.
- Invalidar una sesión y comprobar 401.
- Cambiar contexto no reutiliza Authorization de otro por accidente.
- No usar storageState como si guardara automáticamente headers Bearer:
  storageState trata cookies/almacenamiento según soporte; el header lo gestionamos aparte.

Limitación real de la app:
Tareas públicas. No existe propiedad por usuario.
Antes de probar acceso a "tareas ajenas", ampliar backend con ownership y contrato.
Distinguir rol admin (autorización de función) de acceso por ID (autorización de objeto).
Los tests de esta fase no certifican seguridad de producción.
## 21. Datos propios, factories y limpieza

### Qué problema resolvemos
Dos tests que crean "Mi tarea" pueden chocar con el 409 por título duplicado.
Dos APIRequestContext separados NO crean dos bases de datos: ambos llaman al mismo
servidor. El aislamiento del cliente y el aislamiento de datos son problemas distintos.

Una factory construye datos de prueba. No hace HTTP; permite variar campos y genera
valores identificables. El test conserva el ID devuelto por el servidor para borrar
solamente sus propios recursos.

~~~typescript
import { randomUUID } from 'node:crypto';
import type { CreateTaskInput } from '../models/task';

export function buildTask(
  overrides: Partial<CreateTaskInput> = {}
): CreateTaskInput {
  return {
    title: 'QA-' + randomUUID(),
    completed: false,
    priority: 'media',
    ...overrides,
  };
}
~~~

El spread final permite reemplazar valores: buildTask({ priority: 'alta' }).
No usar esta factory para probar una longitud concreta sin sobreescribir title.
No generar un ID local suponiendo que será el ID asignado por el backend.

### Ejemplo HTTP y resultado
POST http://127.0.0.1:3400/api/tasks
Headers: Accept: application/json; Content-Type: application/json.
Sin Authorization: las tareas actuales son públicas.
~~~json
{ "title": "QA-ejemplo-unico-21", "completed": false, "priority": "alta" }
~~~
201 y un objeto con id numérico. Conservar ese id.
DELETE http://127.0.0.1:3400/api/tasks/ID
Header: Accept: application/json. Sin body. Esperar 204.
En Postman, crear un título nuevo y guardar el id antes del DELETE.

### Ejercicio gradual
1. Crear data/task.factory.ts con la factory y usarla en un test.
2. Crear una fixture que registre IDs de recursos creados por ese test.
3. En teardown, borrar esos IDs aunque falle una aserción.
4. Si DELETE devuelve 404, decidir explícitamente si es limpieza ya realizada.
   No ignorar un 500 ni envolver todo en catch vacío.
5. Ejecutar dos workers y después repetir la suite tres veces.
6. Incorporar una matriz de límites: title de 2, 3, 80 y 81 caracteres.
   Explicar por qué el título duplicado es un caso distinto de longitud inválida.

Comandos, desde la raíz del laboratorio:
~~~bash
npx playwright test --workers=2
npx playwright test --workers=2 --repeat-each=3
~~~
No vaciar globalmente tareas como cleanup: borraría datos de otros tests.
Cierre: tests independientes del orden, sin conflictos de títulos y sin residuos propios.
El laboratorio no ofrece endpoint de reset; no inventarlo en el cliente.

## 22. Contratos: validar datos en tiempo de ejecución

### Qué incorporamos
Una interface TypeScript ayuda al escribir código, pero desaparece al ejecutarlo.
La API puede responder completed: "false" como string aunque hayas hecho un cast a Task.
Un esquema JSON Schema permite comprobar la estructura real. Ajv es una opción
para ejecutarlo; se incorpora cuando lleguemos a este módulo, no se instala por rutina.

Ejemplo reducido de schema para una tarea:
~~~json
{
  "type": "object",
  "required": ["id", "title", "completed", "priority"],
  "properties": {
    "id": { "type": "integer", "minimum": 1 },
    "title": { "type": "string", "minLength": 3, "maxLength": 80 },
    "completed": { "type": "boolean" },
    "priority": { "enum": ["baja", "media", "alta"] }
  },
  "additionalProperties": false
}
~~~
additionalProperties:false representa una decisión estricta: agregar un campo rompe
esta validación. Discutir si el consumidor necesita ese nivel de restricción.
Validar estructura no prueba reglas como "la tarea consultada es la que creé".

### Modelo de validación
Tras instalar Ajv y guardar el schema:
~~~typescript
import Ajv from 'ajv';
const ajv = new Ajv({ allErrors: true });
const validateTask = ajv.compile(taskSchema);
const body: unknown = await response.json();
expect(validateTask(body), JSON.stringify(validateTask.errors)).toBe(true);
~~~
taskSchema es el objeto del ejemplo anterior que debemos importar.
Compilar una vez por módulo/fixture, no por cada campo de cada respuesta.
El ejemplo valida; no pretende que ese compile sin tipado genérico convierta
automáticamente body en Task para TypeScript.

### Petición de trabajo
Crear primero una tarea propia como en 21; luego:
GET http://127.0.0.1:3400/api/tasks/ID
Header Accept: application/json, sin body, sin Authorization.
Esperar 200, Content-Type JSON y el objeto Task.
En Postman: comprobar tipos con pm.expect además de valores; el validador Ajv
del framework se ejecuta en Node, no se asume disponible en Postman.

### Ejercicio
- Guardar schemas/task.schema.ts y validar una respuesta real.
- Probar el validador con una copia local del objeto cuyo completed sea un string.
  No modificar el servidor para fabricar este error.
- Además comprobar id y title contra los datos creados.
- Validar por separado la estructura de un error 404.
- Discutir qué valida OpenAPI: rutas, operaciones, parámetros y respuestas.
  Este laboratorio aún no incluye un archivo OpenAPI: escribirlo y revisarlo
  antes de afirmar que los tests comprueban su cumplimiento.

Cierre: distinguir compilación, validación de estructura y aserciones de negocio.
Fuente para profundizar: https://ajv.js.org/guide/typescript.html

## 23. Evidencia útil, errores y diagnóstico

### Qué incorporamos
En API interesa método, ruta, estado, datos relevantes y X-Request-Id.
Una captura de pantalla del navegador no explica una respuesta HTTP.
test.step agrupa acciones; testInfo.attach agrega evidencia al reporte.

Ejemplo de adjunto acotado, dentro de un test con argumento testInfo:
~~~typescript
await testInfo.attach('respuesta-resumida', {
  body: JSON.stringify({
    status: response.status(),
    requestId: response.headers()['x-request-id'],
  }, null, 2),
  contentType: 'application/json',
});
~~~
response es la APIResponse que acabamos de recibir.
No adjuntar Authorization, passwords, accessToken ni todos los headers sin revisar.
Enseñaremos una función de sanitización y probaremos que elimina esos campos.
Sanitizar nuestros adjuntos no garantiza sanitizar trazas automáticas: revisar
su contenido y su acceso antes de publicarlas.

### Experimento reproducible
GET http://127.0.0.1:3400/api/lab/status/503
Header Accept: application/json. Sin body ni Authorization.
Esperar HTTP 503, Retry-After: 2 y error.code SIMULATED_503.
En Postman, abrir Headers de respuesta y buscar X-Request-Id.
Encontrar ese mismo identificador en el log del servidor.

Un 503 recibido es una respuesta HTTP: puede ser el resultado esperado del test.
Un timeout o ECONNREFUSED puede impedir recibir respuesta y lanzar una excepción.
El cliente debe permitir distinguir ambos; no convertir todos los fallos en false.

### Ejercicio
1. Agrupar crear/consultar/verificar con test.step.
2. Adjuntar resumen al fallar, preservando el error original.
3. Comparar una respuesta 503 con un servidor apagado.
4. Probar la sanitización con un token ficticio reconocible.
5. Revisar el reporte y comprobar que no contiene ese token.
6. Explicar retries del test frente a reintentos de una petición.

No repetir un POST ciegamente: el servidor podría haberlo procesado antes del timeout.
expect(body.completed).toBe(true) no vuelve a consultar la API.
Si el contrato fuera eventualmente consistente, enseñaríamos expect.poll que haga
un GET nuevo y tenga plazo explícito. La app actual es inmediata; primero habría
que agregar un caso asincrónico real antes de practicar esa estrategia.

Cierre: un fallo se puede diagnosticar con la evidencia sin exponer credenciales.

## 24. Suites, tags, proyectos y paralelismo

### Conceptos antes de configurar
Un tag clasifica un test: @smoke puede ser un grupo pequeño de comprobaciones críticas.
Un proyecto Playwright es una configuración de ejecución; no es otra carpeta obligatoria.
Un worker ejecuta tests en un proceso; sharding reparte la suite entre ejecuciones.

No mezclar estas ideas: tener un proyecto por rol no sustituye fixtures con tokens
separados. Ejecutar por defecto el mismo CRUD contra todos los ambientes puede
duplicar mutaciones. El ambiente se elige explícitamente y se valida como vimos en 17.

### Ejemplo mínimo
~~~typescript
test('crear y consultar una tarea', { tag: ['@smoke', '@tasks'] },
  async ({ tasks }) => {
    // Aquí se conserva la implementación ya construida y su limpieza.
  });
~~~
Es una plantilla de clasificación, no un test completo para copiar y dejar vacío.

~~~bash
npx playwright test --grep @smoke
npx playwright test --grep @tasks --workers=2
npx playwright test --shard=1/2
npx playwright test --shard=2/2
~~~

Un test de ejemplo usa POST /api/tasks con Accept JSON, Content-Type JSON y
body de la factory de 21; verifica 201, consulta GET /api/tasks/ID sin body
y verifica 200 antes de limpiar. Los tags no cambian ese contrato.

### Práctica por etapas
1. Marcar una prueba CRUD como smoke y justificar por qué detecta un riesgo crítico.
2. Añadir tags @auth y @contract donde corresponda; un test puede tener varios.
3. Comparar los tests seleccionados usando --list antes de ejecutar.
4. Probar workers=1 y workers=2; explicar cualquier diferencia.
5. Repartir en dos shards usando servidor accesible para ambas ejecuciones.
6. Investigar proyectos solo cuando necesitemos configuraciones diferentes;
   declarar testMatch o grep conscientemente para evitar duplicados accidentales.

Si hay un proyecto de setup, enseñar dependencies y teardown antes de usarlo.
No transformar un test de negocio A en requisito del test B para compartir su ID.
Autenticación por fixture y datos por escenario siguen siendo la base.

Cierre: predecir qué tests selecciona un comando y demostrar independencia.
Fuentes:
https://playwright.dev/docs/test-projects
https://playwright.dev/docs/test-parallel
https://playwright.dev/docs/test-sharding

## 25. Integración continua reproducible

### Qué problema resolvemos
En tu máquina puede existir .env, un servidor ya iniciado y node_modules.
Un agente de CI empieza con un checkout y debe preparar todo explícitamente.
npm ci instala según el lockfile. Un test rojo debe producir un job rojo.
Para una suite exclusivamente HTTP con APIRequestContext no necesitamos abrir
Chromium ni instalar navegadores solo por costumbre.

### Preparar el servidor
Primero incorporaremos al config del módulo 17 una configuración webServer
para local. Se combina con el config existente, no lo reemplaza entero:
~~~typescript
webServer: env.name === 'local' ? {
  command: 'npm run app',
  url: env.apiURL + '/api/health',
  reuseExistingServer: !process.env.CI,
  timeout: 15_000,
} : undefined,
~~~
Requiere que config/environment.ts exporte env.name y que env.apiURL se normalice
sin slash final. Validar host/puerto local antes de habilitar este arranque.
En QA el servidor ya está desplegado; no lanzar app/server.cjs para simular QA.
webServer comprueba disponibilidad; el test de health valida su contrato.

### Ejemplo explicado de GitHub Actions
Supuesto: package.json y playwright.config.ts están en la raíz del repositorio.
En nuestro repositorio con subcarpetas hay que adaptar working-directory y rutas
de artefactos al laboratorio 07 antes de usarlo. Las versiones mayores de actions
son ilustrativas; revisar las políticas y versiones del repositorio al implementarlo.

~~~yaml
name: API tests
on: [push, pull_request]
permissions:
  contents: read
jobs:
  api:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    env:
      CI: "true"
      TEST_ENV: local
      API_URL: http://127.0.0.1:3400
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "24"
          cache: npm
      - run: npm ci
      - run: npm run typecheck
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: api-results
          path: reports/
          retention-days: 7
~~~

on define eventos; jobs agrupa trabajos; steps se ejecuta en orden.
uses ejecuta una acción; run ejecuta un comando. env define variables del proceso.
if:always permite guardar evidencia incluso si fallaron los tests.
Eso no convierte el job en verde. No agregar continue-on-error al test para ocultarlo.
timeout-minutes limita el job completo, no cada petición.

El endpoint sigue siendo GET /api/health con Accept JSON, sin body, HTTP 200 y
status:"ok". El servidor arranca por webServer. No subir .env ni poner passwords
en YAML: al incorporar autenticación se usan secretos del proveedor y configuración
validada, sin imprimirlos.

### Ejercicio
1. Ejecutar npm ci, typecheck y tests localmente desde un estado reproducible.
2. Arrancar servidor mediante webServer y comprobar que no requiere otra terminal.
3. Incorporar workflow con rutas correctas para nuestro repositorio.
4. Forzar una expectativa incorrecta: job rojo y reporte descargable.
5. Corregirla y comprobar ejecución verde.
6. Explicar cómo se elige QA sin un .env local y sin publicar credenciales.
7. Después, y solo si aporta, agregar shards y merge de reportes blob.

Cierre: otra persona puede reproducir el resultado con comandos documentados.
La ejecución real de CI se verificará al implementar; este documento no la ejecuta.

## 26. Integración final y defensa de entrevista

### Trabajo final
Elegir un flujo: crear tarea -> consultarla -> actualizarla -> eliminarla ->
confirmar 404. Cada test posee sus datos; no convertir pasos en tests dependientes.
Petición inicial:
POST http://127.0.0.1:3400/api/tasks
Headers Accept: application/json, Content-Type: application/json.
~~~json
{ "title": "QA-flujo-final-unico", "completed": false, "priority": "media" }
~~~
Esperar 201; guardar ID y Location.
PATCH /api/tasks/ID, mismos headers, body {"completed":true} -> 200.
GET /api/tasks/ID, Accept JSON, sin body -> 200 con completed boolean true.
DELETE /api/tasks/ID, Accept JSON, sin body -> 204.
GET del ID eliminado -> 404 con TASK_NOT_FOUND.
En cada ejecución usar título único y cleanup aunque falle una verificación.
Luego implementar variantes independientes de validación, conflicto y autenticación.

### Evidencia de que entendimos el framework
| Área | Demostración requerida |
| --- | --- |
| Configuración | Explicar baseURL, resolución de rutas, headers y precedencia de variables; QA mal configurado falla temprano. |
| HTTP | Distinguir 201, 204, 400, 401, 403, 404, 409, 415, 422 y 503 en ejemplos reales del laboratorio. |
| Clientes | Reutilizan transporte y endpoints; no ocultan respuestas negativas ni contienen todos los asserts. |
| Fixtures | Explicar setup, use y teardown; preservar la limpieza cuando falla el test. |
| Datos | Ejecutar con uno/dos workers y repeticiones sin depender de IDs fijos. |
| Auth | Separar anónimo/user/admin; revocar token y comprobar 401; no compartir credenciales accidentalmente. |
| Contratos | Distinguir schema, tipos TS y reglas de negocio; detectar un campo con tipo incorrecto. |
| Diagnóstico | Encontrar requestId, interpretar timeout frente a error HTTP y adjuntar evidencia sanitizada. |
| CI | Reproducir instalación, servidor, ejecución y reporte; demostrar fallo real del job ante test rojo. |
| Criterio | Justificar qué abstraer, qué dejar directo y qué pruebas aportan valor. |

### Preguntas de entrevista para cerrar cada bloque
- ¿Qué ocurre si API_URL falta en QA? ¿Por qué un fallback silencioso es peligroso?
- ¿Por qué dos contextos HTTP no aíslan tareas del servidor?
- ¿Qué harías si una creación termina en timeout y no sabés si se procesó?
- ¿Cómo probarías PATCH sin confundirlo con PUT?
- ¿Por qué un cast TypeScript no valida el response body?
- ¿Qué información dejarías en un reporte de login fallido?
- ¿Cuándo usarías una fixture y cuándo una función común?
- ¿Por qué los retries pueden ocultar un problema?
- ¿Cómo probarías autorización por propietario si la app la implementara?
- ¿Qué eliminarías de tu framework si solo agrega complejidad?

No existe un número de clases ni una estructura universal que otorgue nivel Senior.
La meta es construirlo, diagnosticar fallos y defender decisiones con ejemplos.
Haremos una revisión de código y un ejercicio sin guía para comprobar autonomía.

## Extensiones posteriores: necesitan ampliar la app primero
No se darán por implementadas ni se exigirán antes de explicar su contrato:
- Propiedad de recursos: dos usuarios, tareas propias/ajenas y control por ID.
- Concurrencia: ETag/If-Match y rechazo de actualizaciones con versión vieja.
- Idempotencia: contrato de Idempotency-Key y creación segura ante reintentos.
- Trabajo asincrónico: respuesta 202, estado de operación y polling con plazo.
- Otros formatos: multipart y archivos, si el puesto lo requiere.
- Servicios externos: mocks controlados, errores de dependencia y límites de pruebas.
- Performance/carga: objetivos medibles y herramienta adecuada; tiempos de un test
  funcional por sí solos no constituyen una prueba de carga.

## Fuentes oficiales para estudiar y revisar decisiones
Esta es una propuesta pedagógica basada en capacidades documentadas; las fuentes
no definen un único "framework Senior".
- API testing y APIRequestContext: https://playwright.dev/docs/api-testing
- Ciclo de vida y dispose: https://playwright.dev/docs/api/class-apirequestcontext
- Fixtures: https://playwright.dev/docs/test-fixtures
- Configuración: https://playwright.dev/docs/test-configuration
- Opciones de contexto: https://playwright.dev/docs/test-use-options
- Timeouts: https://playwright.dev/docs/test-timeouts
- Reporters: https://playwright.dev/docs/test-reporters
- JSON Schema con TypeScript: https://ajv.js.org/guide/typescript.html
- Autorización por objeto: https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/

## Cómo nos acompañará el tutor
Para cada módulo: explicar -> ejemplo pequeño -> ejercicio propio -> revisión ->
fallo deliberado y diagnóstico -> explicación del alumno.
No avanzar dejando conceptos nuevos sin explicar. No entregar el framework entero
resuelto. Revisar el código sin modificar la solución del alumno salvo pedido explícito.
Si falta una capacidad del backend, ampliarla y documentarla antes de exigir su prueba.
