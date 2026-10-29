# Backend REST desde cero — teoría y práctica guiada
Laboratorio 07 · Actualizado el 27/10/2026.
Base URL: http://127.0.0.1:3400.

## Cómo usar este práctico
Cada punto sigue este orden:
1. Conceptos nuevos explicados.
2. Preparación necesaria.
3. Método, URL, headers y body completos.
4. Respuesta esperada.
5. Armado en Postman.
6. Ejemplo de Playwright.
7. Ejercicio propio y criterio de cierre.

No avanzar si una palabra o un requisito no se entiende.
El tutor revisa y explica sin editar tu solución, salvo solicitud explícita.
Los ejemplos resueltos son modelos; la práctica pide una variante.

El objetivo es automatizar APIs con criterio, no aprender todo el desarrollo backend.
Bases de datos productivas, sistemas distribuidos y seguridad requieren otros temas.
Este laboratorio usa datos ficticios y memoria: reiniciar borra tareas y sesiones.
Postman, la consola web y los tests usan el mismo servidor.

## Ruta completa: fundamentos y framework
Los módulos 1–16 son la primera etapa. No constituyen por sí solos un framework
avanzado terminado. Continuar con [RUTA-FRAMEWORK-API-SENIOR.md](RUTA-FRAMEWORK-API-SENIOR.md).

No esperamos al final para entender configuración:
- Antes del módulo 1: distinguir .env (archivo), API_URL (valor), loadEnvFile (carga)
  y use.baseURL (configuración). Nunca pasar una URL a loadEnvFile.
- En 2–3: observar Accept y Content-Type y qué hereda request del config.
- Desde la primera creación: guardar el ID real y limpiar solo los datos propios.
- En 11: separar headers comunes de Authorization y evitar tokens globales.
- En 15–16: construir la primera organización, manteniendo visibles sus límites.
- Después: recorrer 17–26 para evolucionar con teoría, ejemplo y práctica.

| Módulos siguientes | Qué construiremos gradualmente |
| --- | --- |
| 17 | Variables, validación de entorno, baseURL, headers y timeouts. |
| 18–19 | Clientes tipados y fixtures con setup/teardown. |
| 20–21 | Autenticación, factories, datos propios y cleanup. |
| 22–23 | Contratos ejecutables, errores y evidencia sanitizada. |
| 24–25 | Tags, selección, paralelismo y CI reproducible. |
| 26 | Flujo completo, revisión y defensa de entrevista. |

Cada módulo exige entender y explicar el resultado anterior.
Las capacidades que todavía no tiene la app se agregan antes de pedir ejercicios
que dependan de ellas.

## Preparación única
Desde la carpeta 07-laboratorio-rest-backend, Git Bash:
~~~bash
npm ci
npm run app
~~~
Dejar esa terminal abierta. En otra:
~~~bash
npm run test:health
npm run typecheck
~~~
En PowerShell usar npm.cmd si npm.ps1 está bloqueado.
No instalar navegadores: probamos con request, no page.
La configuración actual no inicia el servidor automáticamente.

Postman:
- Crear colección con variable de colección baseUrl = http://127.0.0.1:3400.
- SIN barra final; usar {{baseUrl}}/api/health.
- No duplicar baseUrl en Globals/Environment por ahora.
- Authorization: No Auth salvo instrucción contraria.
- Para GET/HEAD: Body -> none; no escribir {}.
- Para JSON: Body -> raw -> JSON. Revisar que Content-Type sea application/json.

Playwright:
- Archivos bajo tests/, extensión .spec.ts.
- Import básico:
~~~ts
import { test, expect } from '@playwright/test';
~~~
- Cada ejemplo test(...) usa ese import salvo que lo repita.
- Ejecutar archivo:
~~~bash
npm test -- tests/01-practica.spec.ts
~~~
- La baseURL se configura en playwright.config.ts.
- No hace falta .env para empezar. Si lo usás, debe existir y cargarse ANTES
  de leer process.env; loadEnvFile recibe una ruta de archivo, no una URL.
~~~ts
import { loadEnvFile } from 'node:process';
import { resolve } from 'node:path';
loadEnvFile(resolve(__dirname, '.env'));
~~~
Contenido opcional del archivo:
~~~dotenv
API_URL=http://127.0.0.1:3400
~~~
No exigir ese archivo en CI si las variables llegan desde el proceso.
No reemplazar toda tu configuración por el fragmento de carga.

# 1. Cliente, backend, API y primer intercambio

## Explicación
El cliente solicita una operación y el backend la procesa y responde.
Una página, Postman y Playwright pueden actuar como clientes del mismo servidor.
API es el contrato para comunicarse: rutas, métodos, entradas y respuestas.
REST es un estilo arquitectónico; no equivale a "usar JSON".
Aquí usamos recursos como /api/tasks y /api/tasks/ID y métodos HTTP para operarlos.
El laboratorio aplica convenciones REST; no demuestra todas las restricciones del estilo.

## Petición y respuesta
| Elemento | Valor |
|---|---|
| Método | GET |
| URL | http://127.0.0.1:3400/api/health |
| Authorization | Ninguna |
| Accept | application/json, opcional |
| Content-Type | No necesario, no enviamos body |
| Body | Ninguno |

HTTP 200, header de respuesta Content-Type: application/json; charset=utf-8.
~~~json
{
  "status": "ok",
  "service": "rest-lab-07"
}
~~~
El 200 es estado HTTP. status:"ok" pertenece al body y lo define la app.
Una respuesta 200 puede tener un body incorrecto: comprobar ambos.

## Postman
GET {{baseUrl}}/api/health. Header Accept: application/json.
Body none -> Send. Observar 200, Body y Headers de la respuesta.

## Ejemplo
~~~ts
test('salud del backend', async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.status).toBe('ok');
  expect(body.service).toBe('rest-lab-07');
});
~~~
request es un cliente HTTP, no una pestaña.
await espera la respuesta; status() ejecuta un método; json() interpreta JSON.
expect compara; console.log solo muestra.

## Tu práctica
Repetir desde consola web, Postman y Playwright.
Cambiar temporalmente el service esperado, comprobar que falla y restaurarlo.
Terminaste si podés explicar por qué pasó el código HTTP pero podría fallar el body.
Guardar captura de petición, respuesta y terminal.

# 2. Anatomía: ruta, query params, filtros y headers

## Conceptos ANTES de usarlos
http es esquema, 127.0.0.1 host, 3400 puerto y /api/tasks ruta.
En /api/tasks/8, 8 es parámetro de ruta: identifica una tarea.
Después de ? van query parameters, escritos nombre=valor y separados por &.

Un FILTRO pide solo registros que cumplen una condición:
completed=false pide pendientes; completed=true pide completadas.
No modifica el servidor: limita los resultados de esa consulta.
En la URL los valores viajan como texto; la API interpreta los textos true/false.

page y limit son PAGINACIÓN, no filtros:
page indica página, empezando en 1.
limit indica máximo por página, de 1 a 50.
Con 5 registros y limit=2: página 1 tiene 2, página 2 tiene 2, página 3 tiene 1.
No los necesitás para el ejercicio inicial; se profundizan en punto 10.

Accept expresa formato deseado. Content-Type expresa formato del body enviado.
No tenés que mandar un header Content-Type para obtener una respuesta JSON.
Nuestra API no implementa negociar Accept ni devolver 406 por otros formatos.

## Tres peticiones completas
| Caso | Método y URL | Status |
|---|---|---|
| Sin filtro | GET http://127.0.0.1:3400/api/tasks | 200 |
| Filtro válido | GET http://127.0.0.1:3400/api/tasks?completed=false | 200 |
| Inválido | GET http://127.0.0.1:3400/api/tasks?completed=pendiente | 400 |

En los tres: Accept application/json opcional, sin Content-Type, auth ni body.
Respuesta válida ilustrativa (IDs y cantidades dependen del estado):
~~~json
{
  "items": [
    { "id": 1, "title": "Explorar REST", "completed": false, "priority": "media" }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
~~~
La raíz es un OBJETO; items es un ARRAY dentro de él.
Error esperado:
~~~json
{
  "error": {
    "code": "INVALID_QUERY",
    "message": "Filtro o paginación inválidos",
    "requestId": "valor-variable"
  }
}
~~~
requestId cambia; no esperar literalmente "valor-variable".

## Postman paso a paso
GET {{baseUrl}}/api/tasks -> pestaña Params.
Key completed, Value false. Postman agrega ?completed=false a la URL.
Desmarcar fila -> sin filtro. Cambiar a pendiente -> inválido.
En Headers de RESPUESTA buscar X-Request-Id y el mismo ID en terminal del servidor.
No enviar X-Request-Id como header propio para esta práctica.

## Ejemplo Playwright
~~~ts
test('consultar pendientes', async ({ request }) => {
  const response = await request.get('/api/tasks', {
    params: { completed: 'false' },
    headers: { Accept: 'application/json' },
  });
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(Array.isArray(body.items)).toBe(true);
  for (const task of body.items) {
    expect(task.completed).toBe(false);
  }
});
~~~
params arma la query sin concatenar ? y & manualmente.
Si items está vacío, el for no comprueba ningún registro: no afirmar que eso
demuestra por sí solo que había pendientes. Prepararemos datos propios en punto 10.

## Tu práctica
Tres tests separados: sin filtro, con completed=false e inválido completed=pendiente.
En el inválido verificar status 400 y body.error.code igual a INVALID_QUERY.
No asumir total=1.
Si todas las tareas están pendientes, filtrado y sin filtro pueden devolver lo mismo.
Capturar URL final, status, headers y body de los tres casos.
Explicar la diferencia entre filtro, parámetro de ruta y paginación.

# 3. GET y aserciones de estructura y tipos

## Explicación
toBe compara valores simples; toEqual estructuras; toMatchObject una parte del objeto.
toContainText es para Locator de UI, no para un JSON.
typeof pregunta tipo en ejecución. Array.isArray reconoce arrays.
Un cast/interface TypeScript no valida lo que devuelve el servidor.

## Petición modelo
GET http://127.0.0.1:3400/api/tasks.
Accept application/json opcional; sin Content-Type, auth ni body.
200 con items,total,page,limit como mostró punto 2.
Content-Type es header de respuesta; headers() usa nombres en minúsculas.
total cuenta coincidencias ANTES de paginar, no solamente items de esta página.

## Postman
Enviar GET y mirar tipos:
id número, title texto, completed booleano.
false y "false" no son el mismo tipo.
Revisar Content-Type en respuesta.

## Ejemplo
~~~ts
test('estructura de colección', async ({ request }) => {
  const response = await request.get('/api/tasks');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/json');
  const body = await response.json();

  expect(Array.isArray(body.items)).toBe(true);
  expect(Number.isInteger(body.total)).toBe(true);
  expect(body.total).toBeGreaterThanOrEqual(0);
  expect(body.items.length).toBeLessThanOrEqual(body.limit);
  expect(body.items.length).toBeLessThanOrEqual(body.total);

  for (const task of body.items) {
    expect(Number.isInteger(task.id)).toBe(true);
    expect(task.id).toBeGreaterThan(0);
    expect(typeof task.title).toBe('string');
    expect(typeof task.completed).toBe('boolean');
    expect(['baja', 'media', 'alta']).toContain(task.priority);
  }
});
~~~
Estas aserciones no necesitan await ni reemiten GET si fallan.
response.ok() admite cualquier 2xx; status() permite esperar exactamente 200 o 201.

## Tu práctica
Escribir el test de colección y otro para X-Request-Id de health:
string no vacío, no un UUID fijo.
Forzar temporalmente un tipo esperado incorrecto y comprobar fallo.
No afirmar que el loop verificó tareas si no había ninguna.

# 4. POST: creación, ID y limpieza

## Explicación y herramientas nuevas
POST crea una tarea en la colección.
title obligatorio; completed default false; priority default media.
id lo genera el servidor; Location indica la ruta del recurso creado.
El título es único en esta app: repetirlo produce 409.

randomUUID(), de node:crypto, genera un identificador para datos únicos.
try ejecuta el caso; finally limpia aunque falle una aserción.
Guardamos id fuera del try para usarlo en finally.
number | undefined permite representar un ID todavía no recibido.

## Petición completa
POST http://127.0.0.1:3400/api/tasks.
Content-Type application/json REQUERIDO; Accept application/json opcional.
Sin Authorization.
~~~json
{
  "title": "Mi tarea nueva",
  "priority": "alta"
}
~~~
201, Location: /api/tasks/ID. Body ilustrativo:
~~~json
{
  "id": 8,
  "title": "Mi tarea nueva",
  "completed": false,
  "priority": "alta"
}
~~~
8 no es un ID garantizado: usar el recibido.

## Postman
POST {{baseUrl}}/api/tasks -> Body raw JSON.
Cambiar título si ya existe; enviar y capturar ID.
GET {{baseUrl}}/api/tasks/ID, sin body, para comprobar que quedó guardado.
DELETE mismo ID, sin body, para limpiar. DELETE se explica en profundidad en punto 7.

## Ejemplo completo y reutilizable de preparación
~~~ts
import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';

test('crear y leer una tarea propia', async ({ request }) => {
  const title = 'POST-' + randomUUID();
  let id: number | undefined;

  try {
    const created = await request.post('/api/tasks', {
      data: { title, priority: 'alta' },
    });
    expect(created.status()).toBe(201);
    const task = await created.json();
    id = task.id;

    expect(Number.isInteger(id)).toBe(true);
    expect(created.headers().location).toBe('/api/tasks/' + id);
    expect(task).toMatchObject({ title, completed: false, priority: 'alta' });

    const read = await request.get('/api/tasks/' + id);
    expect(read.status()).toBe(200);
    expect(await read.json()).toEqual(task);
  } finally {
    if (id !== undefined) {
      const cleanup = await request.delete('/api/tasks/' + id);
      expect([204, 404]).toContain(cleanup.status());
    }
  }
});
~~~
data con objeto serializa JSON y configura Content-Type en Playwright.
La limpieza acepta 404 si ese test ya eliminó la tarea; no ignorar todo error.
Un fallo de limpieza puede necesitar investigación separada del fallo original.
Si la creación ocurre pero no recibimos su ID por un corte de red, no podemos
adivinarlo con este patrón: es una limitación conocida.

## Tu práctica
Crear enviando SOLO title y comprobar defaults.
Consultar por ID; limpiar en finally.
Luego probar espacios extremos y comprobar title recortado.
Un test no debe depender del ID que creó otro.
Este patrón se reutiliza en PUT, PATCH, DELETE y validaciones.
# 5. PUT: reemplazar todos los campos editables

## Explicación
PUT reemplaza la representación del recurso identificado.
En ESTA API requiere que exista: no crea IDs arbitrarios.
Todos los campos editables son obligatorios: title, completed y priority.
Omitir uno no significa conservarlo; se rechaza con 422.
id se conserva y no es editable.
Idempotencia significa mismo efecto previsto al repetir la operación, no que
cada header, log o dato interno tenga que permanecer igual.

## Preparación y petición
Crear tarea propia con el patrón POST/finally del punto 4 y guardar su ID.
PUT http://127.0.0.1:3400/api/tasks/ID.
Headers: Content-Type application/json obligatorio; Accept application/json opcional.
Sin Authorization.
~~~json
{
  "title": "Tarea reemplazada",
  "completed": true,
  "priority": "baja"
}
~~~
200 con tarea completa y mismo ID. Inexistente -> 404.
Body incompleto -> 422 VALIDATION_ERROR y ningún cambio.
Otra API podría crear mediante PUT y devolver 201; seguir siempre su contrato.

## Postman
PUT a {{baseUrl}}/api/tasks/ID, Body raw JSON con los tres campos.
GET después para confirmar el reemplazo.
Quitar priority, repetir y comprobar 422 y GET sin cambios.

## Ejemplo de actualización
FRAGMENTO para insertar dentro del try del punto 4: presupone request, id y
randomUUID de esa preparación. No es un archivo completo.
~~~ts
const replacement = {
  title: 'PUT-' + randomUUID(),
  completed: true,
  priority: 'baja',
};
const changed = await request.put('/api/tasks/' + id, { data: replacement });
expect(changed.status()).toBe(200);
expect(await changed.json()).toEqual({ id, ...replacement });

const readAfterPut = await request.get('/api/tasks/' + id);
expect(await readAfterPut.json()).toEqual({ id, ...replacement });
~~~
...replacement copia sus campos al objeto esperado.

## Tu práctica
Test nuevo, con su propio POST y finally:
PUT completo -> GET y todos los campos.
Repetir mismo PUT -> mismo estado final.
PUT incompleto -> 422 y recurso intacto.
Terminado cuando distinguís reemplazar, modificar parcialmente y crear.

# 6. PATCH: cambiar algunos campos

## Explicación
PATCH envía cambios parciales y conserva lo omitido.
Aquí usa un objeto JSON; no implementa JSON Patch RFC 6902.
null no equivale a "no enviar": se valida.
Asignar completed=true repetidamente es idempotente en esta app.
PATCH en general puede no serlo: incrementar un contador tendría otro comportamiento.

## Petición completa
Preparar tarea propia como punto 4.
PATCH http://127.0.0.1:3400/api/tasks/ID.
Content-Type application/json obligatorio; Accept application/json opcional.
Sin Authorization.
~~~json
{
  "completed": true
}
~~~
200 con tarea completa, title y priority preservados.
{} o {"completed":"true"} -> 422.
El segundo body es JSON válido, pero el dato es string, no booleano.

## Postman
Crear tarea con prioridad alta, PATCH solo completed, GET para comparar.
Después mandar completed como texto y comprobar rechazo.

## Ejemplo dentro del patrón de preparación
~~~ts
const beforeResponse = await request.get('/api/tasks/' + id);
const before = await beforeResponse.json();

const changed = await request.patch('/api/tasks/' + id, {
  data: { completed: true },
});
expect(changed.status()).toBe(200);

const afterResponse = await request.get('/api/tasks/' + id);
expect(await afterResponse.json()).toEqual({
  ...before,
  completed: true,
});
~~~
before permite comprobar campos preservados; el campo que debe cambiar tiene
su expectativa explícita, no copiada de la nueva respuesta.

## Tu práctica
PATCH solo priority; comprobar cambio y preservación.
PATCH vacío y tipos inválidos; verificar estado sin modificaciones.
No basta con negar un valor arbitrario: comprobar el estado correcto.

# 7. DELETE y respuestas sin contenido

## Explicación
DELETE elimina el recurso. Nuestra API devuelve 204 sin body.
json() necesita texto JSON: no usarlo en un cuerpo vacío.
Segundo DELETE devuelve 404, pero el estado final sigue siendo ausencia.
Eso no contradice la idempotencia de DELETE.

## Petición completa
Preparación: crear tarea propia y capturar ID.
DELETE http://127.0.0.1:3400/api/tasks/ID.
Accept application/json opcional. Sin Content-Type, auth ni body.
204, sin JSON. GET posterior -> 404 TASK_NOT_FOUND.

## Postman
Crear, eliminar, observar body vacío y luego consultar el mismo ID.
No usar una tarea ajena para probar eliminación.

## Ejemplo dentro del patrón de preparación
~~~ts
const removed = await request.delete('/api/tasks/' + id);
expect(removed.status()).toBe(204);
expect(await removed.text()).toBe('');

const readDeleted = await request.get('/api/tasks/' + id);
expect(readDeleted.status()).toBe(404);
expect((await readDeleted.json()).error.code).toBe('TASK_NOT_FOUND');
~~~
text() permite comprobar ausencia sin intentar interpretar JSON.

## Tu práctica
Agregar segundo DELETE -> 404.
Explicar por qué el cleanup puede aceptar 404 pero el primer DELETE esperado no.
204 por sí solo no demuestra que se eliminó: comprobar efecto por GET.

# 8. Estados HTTP, headers y errores

## Explicación
2xx éxito; 4xx rechazo de la petición; 5xx error del servidor.
Un 4xx esperado puede hacer PASAR un test negativo.
El estado HTTP y el campo error.code pertenecen a niveles diferentes.

| HTTP | Uso en este laboratorio |
|---|---|
| 200 | Lectura/actualización |
| 201 | Creación |
| 204 | Éxito sin contenido |
| 400 | JSON roto o query inválida |
| 401 | Autenticación ausente o inválida |
| 403 | Identidad válida sin permiso |
| 404 | Ruta/recurso inexistente |
| 405 | Método no admitido para esa ruta |
| 409 | Título duplicado |
| 413 | Body demasiado grande |
| 415 | Content-Type incorrecto |
| 422 | Reglas de campos inválidas |
| 429, 500, 503 | Simuladores del punto 13 |

Headers nuevos:
X-Request-Id: correlaciona intercambio y log.
Allow: métodos permitidos, no roles de usuario.
Cache-Control:no-store: indica no almacenar la respuesta.
Son headers de RESPUESTA; no necesitás enviarlos para recibirlos.

## Petición completa y respuesta
GET http://127.0.0.1:3400/api/no-existe.
Accept application/json opcional; sin auth/body.
404:
~~~json
{
  "error": {
    "code": "ROUTE_NOT_FOUND",
    "message": "Ruta no encontrada",
    "requestId": "valor-variable"
  }
}
~~~

## Postman
Comparar HTTP 404 con error.code.
Buscar X-Request-Id en headers de respuesta y el mismo valor en el body y log.

## Ejemplo Playwright
~~~ts
test('ruta desconocida devuelve error trazable', async ({ request }) => {
  const response = await request.get('/api/no-existe');
  expect(response.status()).toBe(404);

  const body = await response.json();
  expect(body.error.code).toBe('ROUTE_NOT_FOUND');
  expect(typeof body.error.message).toBe('string');
  expect(body.error.requestId).toBe(response.headers()['x-request-id']);
});
~~~

## Otros métodos, explicados antes del ejercicio
HEAD obtiene headers sin body.
HEAD /api/health, Accept opcional, sin body/auth -> 200 y texto vacío.
OPTIONS pregunta métodos admitidos.
OPTIONS /api/tasks, Accept opcional, sin body/auth -> 204 y Allow.
PUT /api/tasks (colección) -> 405; PUT /api/tasks/ID sí existe.
El recurso y la ruta importan tanto como el verbo.

## Tu práctica
HEAD:
~~~ts
const head = await request.head('/api/health');
expect(head.status()).toBe(200);
expect(await head.text()).toBe('');
~~~
OPTIONS:
~~~ts
const options = await request.fetch('/api/tasks', { method: 'OPTIONS' });
expect(options.status()).toBe(204);
expect(options.headers().allow).toContain('POST');
~~~
Incorporar ambos en tests completos con import/test.
Después PUT a colección -> 405 y comprobar Allow.
No interpretar body en HEAD ni 204.

# 9. Validaciones, JSON roto y conflictos

## Conceptos nuevos
Un JSON puede ser interpretable y contener datos inválidos.
"title":2 es un dato del tipo incorrecto; un JSON sin cerrar ni siquiera se interpreta.
title debe tener 3..80 caracteres después de trim.
completed debe ser booleano; priority baja/media/alta.
Campos desconocidos, null o array como body -> 422.
Duplicar título tras trim, ignorando mayúsculas -> 409.

## Matriz de peticiones completas
Todas POST http://127.0.0.1:3400/api/tasks, sin auth.
Accept application/json opcional.
| Body | Content-Type | Esperado |
|---|---|---|
| {"title":"ab"} | application/json | 422 VALIDATION_ERROR |
| {"title":"Válida","completed":"true"} | application/json | 422 VALIDATION_ERROR |
| {"title": | application/json | 400 INVALID_JSON |
| {"title":"Válida"} | text/plain | 415 UNSUPPORTED_MEDIA_TYPE |

El tercer body es INTENCIONALMENTE texto roto. No es ejemplo de JSON válido.
En Postman raw JSON para primeros casos; raw Text y text/plain para el último.
Revisar headers efectivos para no duplicar tipos.

## Ejemplo
~~~ts
test('distinguir formato de reglas', async ({ request }) => {
  const invalidFields = await request.post('/api/tasks', {
    data: { title: 'ab' },
  });
  expect(invalidFields.status()).toBe(422);

  const broken = await request.post('/api/tasks', {
    headers: { 'Content-Type': 'application/json' },
    data: Buffer.from('{"title":', 'utf8'),
  });
  expect(broken.status()).toBe(400);
  expect((await broken.json()).error.code).toBe('INVALID_JSON');

  const wrongType = await request.post('/api/tasks', {
    headers: { 'Content-Type': 'text/plain' },
    data: '{"title":"Válida"}',
  });
  expect(wrongType.status()).toBe(415);
});
~~~
data como objeto se serializa. Para JSON roto usamos Buffer.from(texto, 'utf8'):
Buffer contiene bytes y evita que el cliente convierta nuestro texto en un string JSON válido.
Con Content-Type JSON, pasar un string directamente puede serializarlo como valor JSON.
utf8 indica cómo convertir los caracteres en bytes.
No hacer que un helper convierta una entrada inválida en válida.

## Tu práctica
Longitudes 2, 3, 80 y 81 usando 'a'.repeat(N).
Casos ausente, vacío, espacios, null y número.
Los válidos crean recursos y deben limpiarse.
Crear título propio, repetirlo en mayúsculas -> 409 y original intacto.
No hace falta provocar 413 todavía: antes explicaríamos bytes y límites de tamaño.
# 10. Filtros con datos propios y paginación

## Explicación ANTES de armar la consulta
Ya conocés completed del punto 2.
priority=alta filtra por prioridad.
q=texto busca parte del título sin distinguir mayúsculas.
Combinados usan AND: deben cumplirse todas las condiciones.

Paginación divide una colección:
page empieza en 1; limit es máximo por página (1..50).
Defaults: page 1 y limit 10.
Con tres coincidencias y limit=2:
página 1 devuelve dos; página 2 una; página 3 ninguna.
total sigue siendo 3: cuenta coincidencias antes de paginar.
Orden: creación ascendente, no alfabético.

## Preparación y petición completa
Crear tres tareas propias por POST usando un prefijo único, completed=false y
priority=alta. Guardar los tres IDs para limpieza.
Ejemplo manual de un body; cambiar A por B y C:
~~~json
{
  "title": "grupo-demo-001 A",
  "completed": false,
  "priority": "alta"
}
~~~
POST /api/tasks: Content-Type application/json obligatorio; Accept opcional.

Consulta:
GET http://127.0.0.1:3400/api/tasks?completed=false&priority=alta&q=grupo-demo-001&page=1&limit=2
Headers: Accept application/json opcional; sin Content-Type, auth ni body.
200 ilustrativo:
~~~json
{
  "items": [
    { "id": 12, "title": "grupo-demo-001 A", "completed": false, "priority": "alta" },
    { "id": 13, "title": "grupo-demo-001 B", "completed": false, "priority": "alta" }
  ],
  "total": 3,
  "page": 1,
  "limit": 2
}
~~~
Los IDs ilustrativos deben reemplazarse por los creados.
Con q único evitamos que tareas ajenas alteren lo esperado.

## Postman
En Params:
| Key | Value |
|---|---|
| completed | false |
| priority | alta |
| q | grupo-demo-001 |
| page | 1 |
| limit | 2 |
Consultar páginas 1, 2 y 3 cambiando solo page.
Después limpiar las tres tareas mediante DELETE.

## Ejemplo completo Playwright
~~~ts
import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';

test('paginar un conjunto preparado', async ({ request }) => {
  const prefix = 'grupo-' + randomUUID();
  const ids: number[] = [];

  try {
    for (const suffix of ['A', 'B', 'C']) {
      const created = await request.post('/api/tasks', {
        data: {
          title: prefix + ' ' + suffix,
          completed: false,
          priority: 'alta',
        },
      });
      expect(created.status()).toBe(201);
      ids.push((await created.json()).id);
    }

    const response = await request.get('/api/tasks', {
      params: {
        q: prefix,
        completed: 'false',
        priority: 'alta',
        page: 1,
        limit: 2,
      },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.total).toBe(3);
    expect(body.items).toHaveLength(2);
    expect(body.items.map((task: { id: number }) => task.id)).toEqual(ids.slice(0, 2));
  } finally {
    for (const id of ids) {
      const cleaned = await request.delete('/api/tasks/' + id);
      expect([204, 404]).toContain(cleaned.status());
    }
  }
});
~~~
ids es array de IDs propios; push agrega uno.
map transforma tareas en sus IDs. slice(0,2) toma las dos primeras posiciones.
La anotación {id:number} ayuda al editor; no valida JSON. La validación usa expect.

## Tu práctica
Adaptar el ejemplo para páginas 2 y 3 y verificar total, items y ausencia de IDs repetidos.
PATCH una tarea a completed=true y comprobar ambos filtros.
Ahora sí hay datos preparados: una lista vacía inesperada no puede pasar inadvertida.
page=0, limit=51 y query desconocida -> 400.
No probar solo cantidad de filas: comprobar que sean las tareas correctas.

# 11. Autenticación, tokens y autorización

## Explicación
Autenticar: comprobar quién sos.
Autorizar: decidir qué puede hacer esa identidad.
El login crea una sesión y devuelve un token que se envía en peticiones posteriores.
En esta app es opaco, NO JWT; no hay que decodificarlo.
Dura 1800 segundos, y reiniciar servidor lo invalida.
Tareas son públicas. Perfil y estadísticas requieren token.

## A. Crear sesión
POST http://127.0.0.1:3400/api/sessions.
Content-Type application/json obligatorio; Accept application/json opcional.
Sin Authorization.
~~~json
{
  "email": "qa@example.test",
  "password": "Aprender123!"
}
~~~
201:
~~~json
{
  "accessToken": "token-variable",
  "tokenType": "Bearer",
  "expiresIn": 1800,
  "user": {
    "email": "qa@example.test",
    "role": "user"
  }
}
~~~
Para admin, email admin@example.test, misma contraseña ficticia.

## B. Usar token
GET http://127.0.0.1:3400/api/profile.
| Header | Valor |
|---|---|
| Authorization | Bearer TOKEN_RECIBIDO |
| Accept | application/json, opcional |
Sin Content-Type ni body.
TOKEN_RECIBIDO significa pegar accessToken, sin comillas adicionales.
200:
~~~json
{
  "email": "qa@example.test",
  "role": "user"
}
~~~
Sin token/inválido -> 401 y WWW-Authenticate: Bearer.
No usar correo o contraseña como token.

## C. Permiso y cierre
GET /api/admin/stats con token user -> 403 FORBIDDEN.
Con token admin -> 200 {"taskCount":numero}.
Headers y ausencia de body iguales a profile.
DELETE /api/sessions con Authorization Bearer -> 204.
Reusar ese token en profile -> 401.
403 no significa contraseña inválida: la identidad está autenticada, pero sin permiso.

## Postman
Crear sesión y copiar accessToken.
Profile -> Authorization -> Bearer Token, pegar valor.
No agregar también un segundo header Authorization.
Repetir admin/stats con user y con admin.
Tokens no deben publicarse en logs/capturas.

## Ejemplo
~~~ts
test('sesión y permisos', async ({ request }) => {
  const login = await request.post('/api/sessions', {
    data: { email: 'qa@example.test', password: 'Aprender123!' },
  });
  expect(login.status()).toBe(201);
  const { accessToken } = await login.json();
  const headers = { Authorization: 'Bearer ' + accessToken };

  try {
    const profile = await request.get('/api/profile', { headers });
    expect(profile.status()).toBe(200);
    expect(await profile.json()).toEqual({
      email: 'qa@example.test',
      role: 'user',
    });
    const forbidden = await request.get('/api/admin/stats', { headers });
    expect(forbidden.status()).toBe(403);
  } finally {
    const logout = await request.delete('/api/sessions', { headers });
    expect(logout.status()).toBe(204);
  }

  const reused = await request.get('/api/profile', { headers });
  expect(reused.status()).toBe(401);
});
~~~

## Tu práctica
Perfil sin token -> 401.
Credenciales erróneas -> 401 INVALID_CREDENTIALS.
Con admin -> estadísticas 200.
Con user -> estadísticas 403 y error.code FORBIDDEN.
No confundir token inventado con prueba real de expiración.
No esperar 30 minutos: testear reloj/TTL requeriría otra preparación todavía no implementada.
Las tareas públicas no demuestran aislamiento por propietario.

# 12. Scripts, variables y flujo en Postman

## Conceptos nuevos
Send envía. Scripts agrega comprobaciones automáticas.
Pre-request corre ANTES; Post-response DESPUÉS.
pm.test da nombre a una comprobación; pm.expect compara.
pm.response es objeto de Postman, no APIResponse de Playwright.

Variable de colección guarda un dato para siguientes requests.
{{taskId}} se sustituye en URL/body.
Guardaremos baseUrl, taskId, taskTitle y token SOLO en colección.
No mezclar alcances con igual nombre sin comprender precedencia.
Variables Postman no se comparten con process.env de los tests.

## Petición completa
POST {{baseUrl}}/api/tasks.
Content-Type application/json obligatorio; Accept application/json opcional.
Sin Authorization.
Body raw JSON:
~~~json
{
  "title": "{{taskTitle}}",
  "priority": "alta"
}
~~~

## Pre-request de CREACIÓN
~~~js
pm.collectionVariables.unset('taskId');
pm.collectionVariables.set(
  'taskTitle',
  'Postman-' + pm.variables.replaceIn('{{$guid}}')
);
~~~
{{$guid}} genera identificador dinámico; replaceIn lo resuelve.
unset borra un ID viejo para no reutilizarlo si falla el nuevo POST.
Este script va en la petición de crear, no en todas las requests del flujo.

## Post-response de CREACIÓN
~~~js
pm.test('Estado 201', function () {
  pm.response.to.have.status(201);
});

if (pm.response.code === 201) {
  const body = pm.response.json();

  pm.test('Título enviado y recibido coinciden', function () {
    pm.expect(body.title).to.eql(
      pm.collectionVariables.get('taskTitle')
    );
  });

  pm.test('ID numérico', function () {
    pm.expect(body.id).to.be.a('number');
  });

  pm.collectionVariables.set('taskId', String(body.id));
}
~~~
El if evita capturar datos de un error; no sustituye la aserción de 201.
Guardar una variable no demuestra que el contenido sea correcto.

## Siguiente petición GET
GET {{baseUrl}}/api/tasks/{{taskId}}.
Accept application/json opcional; sin Content-Type, auth ni body.
Post-response:
~~~js
pm.test('Estado 200', function () {
  pm.response.to.have.status(200);
});
const body = pm.response.json();
pm.test('Misma tarea', function () {
  pm.expect(body.id).to.eql(Number(pm.collectionVariables.get('taskId')));
  pm.expect(body.title).to.eql(pm.collectionVariables.get('taskTitle'));
});
~~~
Convertimos taskId a número porque se guardó como string.

## Tu práctica
Armar POST -> GET -> PATCH -> GET -> DELETE -> GET 404.
Métodos, bodies y headers son los de puntos 4,6,7.
DELETE 204 no usa json():
~~~js
pm.test('Sin contenido', function () {
  pm.response.to.have.status(204);
  pm.expect(pm.response.text()).to.eql('');
});
~~~
Al final quitar taskId/taskTitle.
Login: guardar accessToken en token; Authorization Bearer {{token}}.
No exportar secretos reales.
Solo después usar Collection Runner con CSV:
encabezados title,priority; cada fila una iteración.
pm.iterationData.get('title') lee el dato de esa iteración.
Primero comprender colección manual antes de introducir CSV y varios entornos.

## Equivalencia Playwright
~~~ts
const response = await request.get('/api/tasks/' + id);
expect(response.status()).toBe(200);
const body = await response.json();
expect(body.id).toBe(id);
~~~
Aquí id es variable local del test, preparada según punto 4, no variable Postman.

# 13. Demoras, errores HTTP y fallos de transporte

## Explicación
Recibir HTTP 500 es distinto de no recibir respuesta.
Timeout, DNS o conexión rechazada pueden lanzar una excepción antes de tener
APIResponse: no hay response.status() que consultar.
Timeout es límite de espera, no una pausa.

Los endpoints de este módulo SIMULAN condiciones.
No hay rate limiter real ni fallo productivo.
Retry-After:2 expresa segundos, no milisegundos.

## Peticiones completas
Todas GET; Accept application/json opcional; sin Content-Type, auth ni body.
| URL | Esperado |
|---|---|
| http://127.0.0.1:3400/api/lab/delay?ms=1000 | 200 después de aproximadamente 1 s |
| http://127.0.0.1:3400/api/lab/status/429 | 429 y Retry-After:2 |
| http://127.0.0.1:3400/api/lab/status/500 | 500 SIMULATED_500 |
| http://127.0.0.1:3400/api/lab/status/503 | 503 y Retry-After:2 |

ms significa milisegundos; la API admite 0..2000.
200 del delay:
~~~json
{ "delayedMs": 1000 }
~~~
429:
~~~json
{
  "error": {
    "code": "SIMULATED_429",
    "message": "Respuesta simulada del laboratorio",
    "requestId": "variable"
  }
}
~~~

## Postman
Enviar delay, mirar duración. Luego 429 y header Retry-After.
No confundir el 429 recibido con una excepción del cliente.

## Ejemplo
~~~ts
test('respuesta y timeout son diferentes', async ({ request }) => {
  const limited = await request.get('/api/lab/status/429');
  expect(limited.status()).toBe(429);
  expect(limited.headers()['retry-after']).toBe('2');

  await expect(
    request.get('/api/lab/delay', {
      params: { ms: 1000 },
      timeout: 100,
    })
  ).rejects.toThrow(/timeout/i);
});
~~~
rejects verifica una promesa rechazada y necesita await.
/timeout/i es regex: busca ese texto sin distinguir mayúsculas.
No usar un mensaje completo que pueda cambiar entre versiones.

## Tu práctica
Comparar 500 recibido con timeout.
Investigar servidor detenido manualmente y volver a iniciarlo.
No convertir el servidor detenido en dependencia de toda la suite.
Explicar por qué reintentar POST a ciegas puede crear duplicados.
Las aserciones de JSON no hacen polling; habría que emitir nuevos GET para esperar
un estado eventual definido por contrato.
Esto no es prueba de carga ni medición de SLA de producción.
# 14. Contratos de datos y JSON Schema

## Explicación antes de usar un validador
Contrato define campos/tipos/reglas/respuestas.
Una interface TS no inspecciona el JSON recibido en ejecución.
JSON Schema es un documento con reglas de forma; necesita un programa VALIDADOR
para comprobar datos. Escribir un esquema no ejecuta una validación.
OpenAPI describe operaciones completas; no es igual a esquema de un objeto.
No instalar Ajv todavía: primero comprobaciones conocidas y esquema explicado.
Un esquema no prueba permisos, unicidad ni persistencia.

## Petición y respuesta de referencia
Preparar tarea propia por POST según punto 4.
GET http://127.0.0.1:3400/api/tasks/ID.
Accept application/json opcional; sin auth ni body.
200:
~~~json
{
  "id": 8,
  "title": "Contrato propio",
  "completed": false,
  "priority": "media"
}
~~~
En Postman comparar nombres y tipos, no el orden visual de propiedades.
Limpiar la tarea cuando termines.

## Ejemplo de esquema
Archivo schemas/task.schema.json:
~~~json
{
  "type": "object",
  "required": ["id", "title", "completed", "priority"],
  "additionalProperties": false,
  "properties": {
    "id": { "type": "integer", "minimum": 1 },
    "title": { "type": "string", "minLength": 3, "maxLength": 80 },
    "completed": { "type": "boolean" },
    "priority": { "enum": ["baja", "media", "alta"] }
  }
}
~~~
required lista obligatorios; properties define cada campo.
additionalProperties:false rechaza campos no listados.
enum limita valores.
No estamos ejecutando ese esquema todavía.

## Ejemplo ejecutable con expect
Dentro del test que creó y recuperó su tarea:
~~~ts
const task = await response.json();
expect(Object.keys(task).sort()).toEqual(
  ['id', 'title', 'completed', 'priority'].sort()
);
expect(Number.isInteger(task.id)).toBe(true);
expect(typeof task.title).toBe('string');
expect(typeof task.completed).toBe('boolean');
expect(['baja', 'media', 'alta']).toContain(task.priority);
~~~
response es el resultado del GET, no una variable mágica.
Object.keys obtiene los nombres y sort ordena para comparar sin depender del orden.
Ese fragmento comprueba tipos básicos, no equivale a toda validación del esquema.

## Tu práctica
Escribir esquema y comprobaciones con expect.
Probar una muestra LOCAL con id:"8", que debe fallar por string.
No cambiar la app para producir el ejemplo incorrecto.
Después, con el tutor, instalar y explicar un validador antes de usarlo en ejercicios.
No usar any para ocultar errores ni cast para simular validación.

# 15. Framework de API: clients y fixtures, no Pages

## Explicación
POM representa interacción con interfaz: Page y Locator.
No hay DOM al enviar HTTP, por eso no necesitamos Pages para API.
APIRequestContext es el cliente HTTP de Playwright.
TasksClient será nuestra clase para agrupar rutas/operaciones cuando se repitan.
Los tests conservan expectativas explícitas.
No crear wrappers por cada línea sin aportar una responsabilidad clara.

Organización progresiva:
~~~text
playwright.config.ts  baseURL, headers, timeouts y reportes
tests/               escenarios y aserciones
clients/             operaciones API reutilizables
fixtures/            preparación y limpieza por test
data/                factories y entradas
schemas/             contratos
reports/             evidencia
~~~
Al principio request directo es suficiente.

## Operación modelo
GET /api/tasks/ID de un recurso preparado.
Accept application/json heredado de config; sin Content-Type, auth ni body.
200 si existe, 404 si no.
El cliente debe permitir comprobar ambos; no esconder expect(200) en cada método.

## Cliente mínimo
Crear clients/TasksClient.ts:
~~~ts
import type { APIRequestContext } from '@playwright/test';

export class TasksClient {
  constructor(private readonly request: APIRequestContext) {}

  getById(id: number) {
    return this.request.get('/api/tasks/' + id);
  }
}
~~~
Recibe dependencia existente, no crea navegador.
El retorno es promesa de APIResponse, no body ya validado.

## Ejemplo de uso completo
Crear tests/cliente.spec.ts DESPUÉS de crear el archivo del cliente:
~~~ts
import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { TasksClient } from '../clients/TasksClient';

test('leer mediante cliente API', async ({ request }) => {
  const client = new TasksClient(request);
  let id: number | undefined;
  const title = 'Cliente-' + randomUUID();

  try {
    const created = await request.post('/api/tasks', { data: { title } });
    expect(created.status()).toBe(201);
    const task = await created.json();
    expect(Number.isInteger(task.id)).toBe(true);
    expect(task.id).toBeGreaterThan(0);
    const createdId: number = task.id;
    id = createdId;

    const read = await client.getById(createdId);
    expect(read.status()).toBe(200);
    expect((await read.json()).title).toBe(title);
  } finally {
    if (id !== undefined) {
      const cleaned = await request.delete('/api/tasks/' + id);
      expect([204, 404]).toContain(cleaned.status());
    }
  }
});
~~~
Validamos el ID recibido antes de usarlo. La anotación number ayuda al compilador;
las aserciones comprueban su forma en ejecución.

## Fixtures explicado antes de implementarlas
La fixture request ya prepara un cliente por test.
Una fixture propia puede crear una tarea, entregarla al test y eliminarla al terminar.
Cliente HTTP nuevo NO significa datos nuevos en el backend: su memoria es compartida.
No usar globals de ID/token ni un reset global antes de cada test.
Mezclar UI+API requiere decidir si deben compartir cookies; no es automático
en todos los contextos HTTP.

## Postman y práctica
Postman no usa TasksClient ni clases TS: repite la misma petición GET por su URL.
En Playwright, escribir primero dos tests directos y después extraer ruta repetida.
Agregar métodos create/update solo cuando se usen realmente.
Probar 200 y 404 con el mismo método cliente.
La implementación de fixture se hará acompañada después de entender el ciclo
crear -> usar -> limpiar. No se exige una API nueva de fixtures sin explicarla.

# 16. Suite reproducible, evidencia y CI

## Conceptos nuevos
Suite: conjunto de tests.
CI: ejecutarlos automáticamente al cambiar código.
Pipeline: secuencia de tareas. Job: grupo ejecutado en un runner.
Runner: máquina que ejecuta. Artefacto: archivo conservado, como reporte.
Secreto: dato sensible inyectado por entorno, no escrito en Git.
YAML: formato de configuración con claves/listas/indentación; su esquema depende
de la plataforma. No es un lenguaje para enviar peticiones HTTP.

Primero necesitamos suite reproducible; luego aprenderemos YAML aplicado a CI.
No instalar navegadores para pruebas que solo usan request.
npm ci instala versiones del lockfile; no equivale a actualizar dependencias.

## Recorrido HTTP del ejercicio final
Preparar título único como punto 4.
POST http://127.0.0.1:3400/api/tasks:
Content-Type application/json obligatorio; Accept opcional; sin auth.
~~~json
{
  "title": "Final-titulo-unico",
  "completed": false,
  "priority": "media"
}
~~~
201 -> capturar ID.
GET /api/tasks/ID -> 200.
PATCH misma ruta con:
~~~json
{ "completed": true }
~~~
PUT misma ruta con:
~~~json
{
  "title": "Final-reemplazo-unico",
  "completed": false,
  "priority": "alta"
}
~~~
PATCH/PUT: Content-Type application/json obligatorio, Accept opcional.
Después GET verifica persistencia; DELETE sin body -> 204; GET -> 404.
GET/DELETE sin Content-Type, auth ni body.
Cada paso debe comprobar status y contenido apropiado.
Todo el recorrido pertenece a un test, no a tests encadenados por globals.

## Postman
Armar el flujo del punto 12 con variables de colección.
Usar títulos únicos y limpiar.
Guardar evidencia sin Authorization/password/token.
No confundir ejecutar requests en orden con independencia de escenarios.

## Ejemplo de ejecución Playwright
Un archivo:
~~~bash
npm test -- tests/01-practica.spec.ts
~~~
Todos:
~~~bash
npm test
~~~
Con dos workers, solo después de aislar títulos y recursos:
~~~bash
npm test -- --workers=2
~~~
Reporte:
~~~bash
npm run report
~~~
En API, adjuntar status/headers/body sanitizados suele ser más útil que screenshots.

## Arranque automático, explicado antes de configurarlo
Hoy iniciás npm run app manualmente.
Playwright Test puede administrarlo con webServer.
Este bloque se agrega al objeto defineConfig en playwright.config.ts:
~~~ts
webServer: {
  command: 'npm run app',
  url: 'http://127.0.0.1:3400/api/health',
  reuseExistingServer: !process.env.CI,
  timeout: 15_000,
},
~~~
command inicia proceso; url indica cuándo considerarlo disponible.
reuseExistingServer permite reutilizar localmente; en CI queremos servidor propio.
process.env.CI es una variable de entorno, no un campo del backend.
Este ejemplo presupone API local puerto 3400. Si API_URL cambia, adaptar ambas
configuraciones; no levantar localmente un servidor para un test remoto sin querer.
No requiere Chromium.
Si agregaste carga de .env obligatoria, la configuración CI también debe contemplar
que sus variables pueden llegar sin archivo.

## Tu práctica final
1. Completar recorrido CRUD con preparación y limpieza.
2. Ejecutar individual y conjuntamente.
3. Verificar ausencia de efectos ante rechazo.
4. Ejecutar con dos workers e investigar colisiones.
5. Forzar expectativa incorrecta, confirmar fallo útil y restaurar.
6. Elegir qué logs publicar y qué ocultar.
7. Con el tutor, implementar webServer y después escribir pipeline YAML.
No se exige escribir YAML sin haber visto antes su sintaxis y ciclo de vida.

## Criterio de cierre
Podés explicar qué defecto detecta cada aserción y qué no se probó.
Un test vacío o un 200 aislado no demuestra cobertura.
No aumentar timeouts/retries sin evidencia.
No vaciar datos ajenos para limpiar.
Este curso construye una base de automation API, no dominio total del backend.

# Fuentes y continuidad
HTTP: https://www.rfc-editor.org/rfc/rfc9110.html
PATCH: https://www.rfc-editor.org/rfc/rfc5789.html
Playwright API: https://playwright.dev/docs/api-testing
APIRequestContext: https://playwright.dev/docs/api/class-apirequestcontext
APIResponse: https://playwright.dev/docs/api/class-apiresponse
WebServer: https://playwright.dev/docs/test-webserver
Postman scripts: https://learning.postman.com/docs/tests-and-scripts/write-scripts/test-scripts/
Variables: https://learning.postman.com/docs/tests-and-scripts/write-scripts/postman-sandbox-reference/pm-variables/
JSON Schema: https://json-schema.org/learn/getting-started-step-by-step
OpenAPI: https://spec.openapis.org/oas/latest.html

Regla para el tutor: explicar conceptos, preparar datos, mostrar petición completa,
respuesta y código antes de pedir una variante práctica.
No asumir que se conocen filtros, paginación, tokens, schemas, fixtures ni CI.
No editar el código del alumno cuando solicita una revisión.