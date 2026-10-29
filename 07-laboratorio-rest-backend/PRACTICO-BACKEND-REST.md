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
| Caso          | Método y URL                                            |Status |
|---            |---                                                      |---|
| Sin filtro    | GET http://127.0.0.1:3400/api/tasks                     | 200 |
| Filtro válido | GET http://127.0.0.1:3400/api/tasks?completed=false     | 200 |
| Inválido      | GET http://127.0.0.1:3400/api/tasks?completed=pendiente | 400 |

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
# 5. PUT: reemplazar todos los campos editables de una tarea

## Objetivo
Aprender a actualizar una tarea existente enviando su representación editable
completa. Al terminar vas a comprobar tanto la respuesta del PUT como el estado
guardado, mediante un GET posterior. No alcanza con mirar que responda 200.

## 5.1. Qué cambia respecto de POST y GET
- POST /api/tasks crea una tarea; el servidor le asigna un ID.
- GET /api/tasks/ID consulta esa tarea sin modificarla.
- PUT /api/tasks/ID reemplaza todos sus campos editables.

En esta aplicación, esos campos son title, completed y priority.
El ID identifica la tarea y se conserva: va en la URL, no en el body.

Ejemplo antes del PUT:
~~~json
{
  "id": 8,
  "title": "Revisar login",
  "completed": false,
  "priority": "media"
}
~~~
Body que enviamos con PUT:
~~~json
{
  "title": "Revisar carrito",
  "completed": true,
  "priority": "alta"
}
~~~
Después del PUT, la tarea 8 debe contener los nuevos valores.
El 8 es ilustrativo: en tus pruebas usás el ID que devuelva tu propio POST.

En ESTA API, PUT exige los tres campos, aunque solo quieras cambiar uno.
Enviar solo title no conserva automáticamente el resto: devuelve 422.
Para modificar algunos campos veremos PATCH en el punto 6.

PUT no crea tareas con IDs elegidos por nosotros en este laboratorio:
si el ID no existe, devuelve 404. Otras APIs pueden permitir creación con PUT;
siempre se trabaja según el contrato concreto.

## 5.2. Preparación y petición completas
Primero creá una tarea propia con POST, como en el punto 4:
~~~http
POST http://127.0.0.1:3400/api/tasks
Accept: application/json
Content-Type: application/json
~~~
~~~json
{
  "title": "PUT-preparacion-titulo-unico",
  "completed": false,
  "priority": "media"
}
~~~
Esperá 201 y guardá el id de la respuesta.

Luego reemplazala:
~~~http
PUT http://127.0.0.1:3400/api/tasks/ID
Accept: application/json
Content-Type: application/json
~~~
~~~json
{
  "title": "PUT-actualizacion-titulo-unico",
  "completed": true,
  "priority": "alta"
}
~~~
Sin Authorization: las tareas de este laboratorio son públicas.
Content-Type describe el JSON enviado; Accept expresa el formato deseado.
En Playwright, data con un objeto se serializa a JSON y agrega Content-Type
application/json salvo que lo sobreescribas. Accept ya está en nuestro config.

Respuesta esperada: HTTP 200 y tarea completa, con el mismo ID.
Después, GET /api/tasks/ID, sin body, debe responder 200 y esos mismos datos.
No usar GET /api/tasks para verificar una única tarea: usar la ruta con su ID.

## 5.3. Cómo hacerlo en Postman
1. Crear con POST y copiar el id de la respuesta.
2. Crear petición PUT a {{baseUrl}}/api/tasks/ID, reemplazando ID por ese valor.
3. Elegir Body -> raw -> JSON y pegar los tres campos del reemplazo.
4. Revisar Content-Type: application/json; agregar Accept: application/json.
5. Enviar y comprobar 200, ID conservado y los tres valores nuevos.
6. Consultar por GET la misma URL, sin body. Comprobar lo guardado.
7. Reenviar el mismo PUT sin cambiar el body y consultar otra vez.
8. Quitar priority del body del PUT y enviarlo: esperar 422.
9. Hacer GET: los datos deben seguir como estaban antes del intento inválido.
10. Eliminar la tarea con DELETE al terminar; esperar 204.

En el paso 8, el body incompleto es deliberado:
~~~json
{
  "title": "Este cambio no debe guardarse",
  "completed": false
}
~~~
La respuesta contiene error.code igual a VALIDATION_ERROR.
El mensaje explica el campo requerido; no esperamos un requestId fijo.

## 5.4. Herramientas de código antes del ejemplo
- request.put(url, { data }) envía el reemplazo.
- response.status() obtiene el status HTTP.
- await response.json() lee e interpreta el body; necesita await.
- toEqual compara el objeto completo.
- Un GET posterior comprueba que la modificación quedó guardada.
- randomUUID genera un sufijo para evitar títulos duplicados entre ejecuciones.
- try/finally ejecuta la limpieza aunque falle una aserción.
  No requiere catch: queremos que Playwright registre el fallo.
- ...replacement copia las propiedades de replacement a otro objeto:
  { id, ...replacement } contiene id, title, completed y priority.

## 5.5. Ejemplo completo: reemplazo correcto
Archivo sugerido: tests/practica5.spec.ts.
Es un modelo resuelto para entender el recorrido, no los tres ejercicios completos.
~~~typescript
import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';

test('PUT reemplaza los campos y conserva el ID', async ({ request }) => {
  let id: number | undefined;

  try {
    const created = await request.post('/api/tasks', {
      data: {
        title: 'Antes-' + randomUUID(),
        completed: false,
        priority: 'media',
      },
    });
    expect(created.status()).toBe(201);
    const original = await created.json();
    id = original.id;
    expect(Number.isInteger(id)).toBe(true);

    const replacement = {
      title: 'Despues-' + randomUUID(),
      completed: true,
      priority: 'alta',
    };

    const updated = await request.put('/api/tasks/' + id, {
      data: replacement,
    });
    expect(updated.status()).toBe(200);
    const updatedBody = await updated.json();
    expect(updatedBody).toEqual({ id, ...replacement });

    const read = await request.get('/api/tasks/' + id);
    expect(read.status()).toBe(200);
    const saved = await read.json();
    expect(saved).toEqual({ id, ...replacement });
  } finally {
    if (id !== undefined) {
      const cleanup = await request.delete('/api/tasks/' + id);
      expect([204, 404]).toContain(cleanup.status());
    }
  }
});
~~~
status() se llama sobre la respuesta HTTP, no sobre updatedBody ni saved.
Guardar id permite limpiar incluso si falla una comprobación posterior.
204 significa borrado correcto; 404 se admite aquí si el recurso ya fue eliminado.
No aceptar cualquier status ni silenciar errores de limpieza.

## 5.6. Qué significa idempotencia
Repetir el mismo PUT sobre el mismo recurso debe tener el mismo efecto previsto
sobre su estado que enviarlo una sola vez.

Ejemplo: establecer completed:true dos veces deja completed:true.
No significa "sumar uno" ni crear una tarea adicional.
Tampoco exige que X-Request-Id o los logs sean idénticos entre respuestas.

Para probarlo, construí replacement UNA vez y reutilizalo en los dos PUT.
Si generás un título nuevo en cada envío, ya no estás repitiendo la misma petición.

## 5.7. Tu práctica: tres tests separados

### Test 1 — Reemplazo completo
1. Crear una tarea propia con título único, completed:false y priority:media.
2. Guardar su ID.
3. Hacer PUT con otro título único, completed:true y priority:baja.
4. Verificar status 200 y el body completo, incluyendo el ID original.
5. Hacer GET por ese ID.
6. Verificar status 200 y los tres valores actualizados.
7. Limpiar en finally.

Variante respecto del ejemplo: cambiar prioridad a baja.

### Test 2 — Repetir el mismo PUT
1. Crear otra tarea propia; no reutilizar la del Test 1.
2. Construir un objeto replacement con los tres campos.
3. Hacer PUT y verificar 200 y el objeto esperado.
4. Repetir PUT con la MISMA URL y el MISMO replacement.
5. Verificar otra vez 200 y los mismos campos e ID.
6. Hacer GET y comprobar que mantiene ese estado.
7. Limpiar en finally.

No comparar las APIResponse con toEqual: comparar sus bodies leídos con json().
No comprobar el total global de tareas: otros tests pueden tener datos propios.

### Test 3 — Rechazar un PUT incompleto sin modificar la tarea
1. Crear una tercera tarea propia y guardar su body e ID.
2. Enviar PUT con un title diferente y completed:true, omitiendo priority.
3. Verificar HTTP 422.
4. Leer su body y verificar error.code igual a VALIDATION_ERROR.
5. Hacer GET por el ID: esperar 200.
6. Comparar su body completo con la tarea ORIGINAL: ningún campo cambió.
7. Limpiar en finally.

El error no es suficiente por sí solo: el GET demuestra que no guardó cambios
parciales antes de rechazar la petición.

## 5.8. Criterio de cierre
Los tres tests pasan por separado y juntos, crean sus propios datos y limpian.
Podés explicar:
- Por qué el ID está en la URL y no lo enviamos dentro del body.
- Qué diferencia hay entre POST, GET y PUT en esta API.
- Por qué PUT incompleto devuelve 422 y no conserva campos omitidos.
- Qué comprobación aporta GET además del body del PUT.
- Por qué repetir la misma petición prueba idempotencia.
- Por qué finalmente usaremos fixtures para evitar repetir preparación/limpieza.

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
Archivo sugerido: tests/practica6.spec.ts.
Crear tres tests separados. Cada uno debe crear su propia tarea mediante POST,
guardar el ID y el body original, y eliminarla al terminar (preferentemente en
finally, como el patrón del punto 4). No reutilizar IDs de otros tests.

Preparación para CADA test:
- POST /api/tasks, con título único, completed:false y priority:"media".
- Esperar HTTP 201 y guardar el objeto recibido como referencia del estado inicial.
- Para PATCH usar /api/tasks/ID, reemplazando ID por el de esa tarea.
- Headers: Content-Type: application/json; Accept: application/json.
  Con request.patch y data como objeto, Playwright agrega Content-Type JSON.
  Accept ya está configurado en nuestro playwright.config.ts.
- Sin Authorization.

### Test 1 — Cambiar solamente priority
1. Enviar PATCH con este body, sin agregar title ni completed:
~~~json
{ "priority": "alta" }
~~~
2. Verificar HTTP 200.
3. Leer el body de la respuesta y comprobar:
   - id: sigue siendo el ID creado.
   - priority: ahora es "alta".
   - title: sigue siendo exactamente el título original.
   - completed: sigue siendo false.
4. Hacer GET /api/tasks/ID, sin body; verificar HTTP 200.
5. Comprobar que el GET devuelve ese mismo estado: solo cambió priority.

La respuesta del PATCH contiene la tarea completa aunque hayas enviado un solo
campo. Ese es el comportamiento que estás comprobando.

### Test 2 — Rechazar un PATCH vacío
1. Crear otra tarea propia con la preparación indicada.
2. Enviar PATCH al ID de esa tarea con body:
~~~json
{}
~~~
Un objeto vacío no solicita ningún cambio; esta API lo rechaza.
3. Verificar HTTP 422.
4. Leer la respuesta y comprobar error.code igual a "VALIDATION_ERROR".
5. Hacer GET /api/tasks/ID y verificar HTTP 200.
6. Comparar el body del GET con el objeto original completo: deben ser iguales.

### Test 3 — Rechazar un tipo incorrecto sin guardar cambios
1. Crear una tercera tarea propia.
2. Enviar PATCH con este body:
~~~json
{ "completed": "true" }
~~~
Las comillas son deliberadas: "true" es un string; el campo requiere un booleano.
3. Verificar HTTP 422 y error.code igual a "VALIDATION_ERROR".
4. Hacer GET /api/tasks/ID y verificar HTTP 200.
5. Comparar su body con la tarea original completa: ningún campo debe cambiar.
   En particular, completed debe seguir siendo false.

Terminaste cuando los tres tests pasan por separado y juntos, y podés explicar:
- Por qué el primer PATCH conserva title y completed sin enviarlos.
- Por qué {} y {"completed":"true"} son JSON válidos, pero la API los rechaza.
- Por qué comprobar solo 422 no demuestra que la tarea quedó intacta:
  necesitás consultar y comparar su estado.
No basta con afirmar que priority "no es baja": comprobá el valor exacto esperado.

# 7. DELETE y respuestas sin contenido

## Explicación
DELETE elimina el recurso. Nuestra API devuelve 204 sin body.
json() necesita texto JSON: no usarlo en un cuerpo vacío.
Segundo DELETE devuelve 404, pero el estado final sigue siendo ausencia.
Eso no contradice la idempotencia de DELETE.

Idempotencia significa mismo efecto previsto al repetir la operación, no que
cada header, log o dato interno tenga que permanecer igual.


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
Archivo sugerido: tests/practica7.spec.ts. Crear dos tests independientes.
Para cada uno, POST /api/tasks con un title único; esperar 201 y guardar id.
Header del POST: Content-Type: application/json; Accept ya viene del config.
DELETE y GET usan Accept: application/json, sin body ni Authorization.

### Test 1 — Eliminar y comprobar el efecto
1. Crear tu tarea; no usar un ID fijo ni el de otro test.
2. DELETE /api/tasks/ID.
3. Comprobar status 204.
4. Leer con await response.text() y comprobar que devuelve ''.
   No llamar json(): no hay JSON en una respuesta sin contenido.
5. GET /api/tasks/ID.
6. Comprobar 404 y body.error.code igual a "TASK_NOT_FOUND".

### Test 2 — Eliminar dos veces el mismo recurso
1. Crear otra tarea propia.
2. Primer DELETE al ID creado: exigir 204 y body vacío.
3. Segundo DELETE al MISMO ID: exigir 404.
4. Leer el JSON del segundo DELETE y comprobar "TASK_NOT_FOUND".
5. GET del mismo ID: exigir 404 y "TASK_NOT_FOUND".

En finally, intentar limpiar si se obtuvo ID. Ese cleanup admite 204 o 404:
puede que el test ya haya eliminado la tarea. El primer DELETE del comportamiento
que estás probando debe exigir 204, porque sabés que acabás de crearla.
No usar la tolerancia del cleanup para debilitar esa aserción.

Terminaste si ambos tests pasan y explicás por qué el segundo DELETE tiene otro
status pero mantiene el mismo estado final: el recurso no existe.

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
Archivo sugerido: tests/practica8.spec.ts. Crear cuatro tests separados.
No requieren crear tareas, tokens ni IDs. Todas las peticiones van al backend
configurado en baseURL; Accept: application/json ya se hereda del config.
No enviar body ni Authorization. No agregar headers de respuesta a la petición.

### Test 1 — Ruta desconocida y error trazable
1. GET /api/no-existe.
2. Verificar 404.
3. Leer JSON: error.code debe ser "ROUTE_NOT_FOUND".
4. error.message debe ser un string no vacío.
5. Obtener response.headers()['x-request-id']; debe ser string no vacío.
6. Comprobar que body.error.requestId coincide con ese header.
7. Buscar manualmente el mismo ID en la terminal del servidor.
No comparar contra un ID fijo: cambia en cada petición.

### Test 2 — HEAD obtiene headers sin body
1. request.head('/api/health').
2. Verificar 200.
3. Comprobar content-type que contenga "application/json".
4. Comprobar await response.text() igual a ''.
5. No usar json(), aunque Content-Type mencione JSON: HEAD no trae body.

### Test 3 — OPTIONS informa métodos permitidos
1. Usar request.fetch('/api/tasks', { method: 'OPTIONS' }).
   fetch permite indicar explícitamente un método HTTP como OPTIONS.
2. Verificar 204 y texto vacío.
3. Obtener el header allow y comprobar que incluye GET y POST.
4. Comprobar que no incluye PUT: PUT pertenece a /api/tasks/ID.
El formato es texto separado por comas. Para comparar métodos completos podés usar:
const methods = allow.split(',').map(value => value.trim());
Antes verificá que allow existe. No depender del orden de la lista.

### Test 4 — Método no admitido para la colección
1. PUT /api/tasks, sin body: acá probamos el método sobre la ruta de colección.
2. Verificar 405.
3. Leer JSON y comprobar error.code igual a "METHOD_NOT_ALLOWED".
4. Revisar Allow: incluye POST y GET, y no incluye PUT.
5. Comprobar cache-control igual a "no-store".
En esta app, esa ruta rechaza el método antes de procesar un body.

Terminaste si explicás la diferencia entre ruta desconocida (404) y método no
admitido en una ruta conocida (405), y por qué HEAD/204 no se leen con json().

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
Archivo sugerido: tests/practica9.spec.ts.
Trabajar con POST /api/tasks. Accept: application/json heredado; sin Authorization.
Para objetos enviados con data, Playwright configura Content-Type JSON.
Crear tests separados o casos con títulos descriptivos; no mezclar todos los
errores en una sola prueba sin poder identificar qué entrada falló.

### Grupo A — Límites de longitud de title
Usar 'a'.repeat(N): repeat construye un string repitiendo un carácter N veces.
Probar N=2, N=3, N=80 y N=81; el límite se cuenta después de recortar espacios.
- 2 y 81: esperar 422 y error.code "VALIDATION_ERROR".
- 3 y 80: esperar 201, ID entero positivo y title idéntico al enviado.
Guardar y eliminar en finally los recursos válidos.
Para repetir estos casos, evitar títulos duplicados. En los válidos podés generar
un título único de longitud exacta N: randomUUID().replaceAll('-', '').slice(0, N)
para N=3; para 80, completar un prefijo UUID con letras hasta llegar a 80.
Una longitud 3 tiene espacio limitado de valores: ejecutar secuencialmente,
limpiar siempre y diagnosticar un 409 como colisión de datos, no error de longitud.
No agregar un UUID a 'aaa' y seguir diciendo que probaste tres caracteres.

### Grupo B — Campos inválidos
Cada fila es un body diferente; todos deben devolver 422 y "VALIDATION_ERROR":
| Caso | Body |
| --- | --- |
| title ausente | {} |
| title vacío | {"title":""} |
| solo espacios | {"title":"   "} |
| title null | {"title":null} |
| title numérico | {"title":123} |
| completed string | {"title":"Tipo incorrecto","completed":"true"} |
| priority fuera de opciones | {"title":"Prioridad incorrecta","priority":"urgente"} |

Si inesperadamente recibís 201, registrar su ID y limpiar antes de terminar
el test fallido. No dejar residuos por una respuesta inesperada.

### Grupo C — Formato frente a tipo de contenido
1. POST con Content-Type application/json y
   data: Buffer.from('{"title":', 'utf8').
   Esperar 400 y "INVALID_JSON": los bytes no forman JSON interpretable.
2. POST con Content-Type text/plain y texto '{"title":"Texto de ejemplo"}'.
   Esperar 415 y "UNSUPPORTED_MEDIA_TYPE".
No reemplazar estos bodies por objetos: cambiaría el caso que querés probar.

### Grupo D — Conflicto por título
1. Crear tarea con título único como 'Conflicto-' + randomUUID(); esperar 201.
2. Guardar ID y body original.
3. POST con el mismo título convertido a mayúsculas; esperar 409 y "TITLE_CONFLICT".
4. GET del ID original; esperar 200 y el objeto original sin cambios.
5. Eliminar el original en finally.
El POST rechazado no debería crear otra tarea; no capturar su error como si fuera Task.

Terminaste si distinguís JSON roto (400), tipo de contenido incorrecto (415),
campos inválidos (422) y título duplicado (409).
413 queda fuera de este ejercicio: todavía no practicamos el límite en bytes.

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
Archivo sugerido: tests/practica10.spec.ts. Separar los siguientes tres tests.
Los GET usan params y Accept: application/json heredado, sin body ni auth.
Los POST/PATCH envían objetos en data y usan Content-Type JSON.

### Test 1 — Paginar tus tres tareas
1. Generar prefix = 'grupo-' + randomUUID().
2. Crear por POST tres tareas, en orden, con títulos prefix+' A', prefix+' B',
   prefix+' C'; todas completed:false y priority:"alta". Exigir 201.
3. Guardar IDs en un array en ese mismo orden; registrar cada uno al crearlo.
4. Consultar GET /api/tasks con params:
   { q: prefix, completed: 'false', priority: 'alta', page: 1, limit: 2 }.
5. Exigir 200; body.total=3, body.page=1, body.limit=2.
   items debe contener exactamente los IDs A y B, en ese orden.
6. Repetir cambiando solo page a 2: total=3, page=2, limit=2 y solo ID C.
7. Repetir con page=3: total=3, page=3, limit=2 e items vacío.
8. Unir los IDs de páginas 1 y 2: deben coincidir exactamente con los tres
   creados, sin duplicados. No comparar solo cantidades.
9. Eliminar todos tus IDs en finally.
El filtro q con prefijo único evita que tareas de otros tests alteren el total.

### Test 2 — Un cambio afecta el filtro correcto
1. Crear otras tres tareas propias con prefijo único y completed:false.
2. PATCH de una sola, enviando {"completed":true}; exigir 200.
3. GET con q=tu prefijo y completed=false, limit=10: exigir total=2 y los IDs
   de las dos tareas no modificadas. Cada completed debe ser false.
4. GET con el mismo q y completed=true, limit=10: exigir total=1 y el ID
   modificado. Su completed debe ser true.
5. Eliminar las tres en finally.
No consultar sin q: podría haber otras tareas completadas en el servidor.

### Test 3 — Parámetros inválidos
Hacer tres GET independientes (sin preparar datos):
- params: { page: 0 }
- params: { limit: 51 }
- params: { parametroInexistente: 'valor' }
En cada uno exigir 400 y body.error.code "INVALID_QUERY".
Enviar cada parámetro por separado para saber cuál causa el rechazo.

Terminaste si explicás por qué total puede ser 3 mientras items tiene 2 o 0,
y mostrás que no confundiste paginación con filtro.

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
Archivo sugerido: tests/practica11.spec.ts.
Crear los cinco tests siguientes. Accept: application/json se hereda.
POST de login usa Content-Type JSON; GET/DELETE no tienen body.
No configurar Authorization globalmente: algunos casos requieren NO tener token.

### Test 1 — Perfil sin autenticación
1. GET /api/profile sin Authorization.
2. Exigir 401.
3. Leer JSON: error.code debe ser "UNAUTHORIZED".
4. Comprobar header www-authenticate igual a "Bearer".

### Test 2 — Contraseña incorrecta
1. POST /api/sessions con body:
~~~json
{ "email": "qa@example.test", "password": "Incorrecta123!" }
~~~
2. Exigir 401 y error.code "INVALID_CREDENTIALS".
No usar body mal formado: eso probaría validación de campos y podría dar 422,
en lugar de comprobar credenciales incorrectas.

### Test 3 — Usuario autenticado sin permiso de administrador
1. POST /api/sessions con:
~~~json
{ "email": "qa@example.test", "password": "Aprender123!" }
~~~
2. Exigir 201; guardar accessToken, sin imprimirlo.
3. GET /api/profile con Authorization: Bearer TOKEN_RECIBIDO.
   Exigir 200 y { email:"qa@example.test", role:"user" }.
4. GET /api/admin/stats con ese mismo header.
5. Exigir 403 y error.code "FORBIDDEN".
6. En finally, DELETE /api/sessions con ese token: exigir 204, sin leer JSON.

### Test 4 — Administrador con permiso
1. Crear sesión propia con admin@example.test y password Aprender123!.
2. Exigir 201 y guardar el accessToken de ESTA sesión.
3. GET /api/admin/stats con Authorization: Bearer TOKEN_ADMIN.
4. Exigir 200; taskCount debe ser entero mayor o igual a cero.
   No exigir un total fijo: otros tests pueden crear tareas.
5. Cerrar esta sesión en finally con DELETE /api/sessions y exigir 204.

### Test 5 — Token revocado
1. Crear una nueva sesión válida de usuario y guardar su token.
2. Consultar profile con él: exigir 200, demostrando que funcionaba.
3. DELETE /api/sessions con ese token: exigir 204 y texto vacío.
4. Volver a consultar profile con exactamente el mismo token.
5. Exigir 401 y "UNAUTHORIZED".
Prever limpieza si falla antes del paso 3. Después de revocarlo, un segundo
DELETE puede devolver 401: no exigir 204 a una sesión ya inválida.
Podés registrar una variable booleana que indique que el logout ya ocurrió.

Terminaste si distinguís identidad ausente/inválida (401) de identidad válida
sin permiso (403), y no compartís tokens entre tests.
No inventar un token y afirmar que probaste expiración: ese caso es token inválido.
No esperar 30 minutos ni probar propiedad de tareas: esa preparación no existe aún.

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
Esta práctica se hace en Postman, en una colección.
Primero ejecutar cada petición manualmente; después usar Runner.
baseUrl debe valer http://127.0.0.1:3400, sin slash final.
Usar variables de COLECCIÓN: baseUrl, taskId, taskTitle y token.
No crear otras con igual nombre en Globals/Environment durante este ejercicio.

### Parte A — Flujo de tareas, en seis peticiones
Crear requests con nombres 01-Crear, 02-Leer, 03-Completar, 04-Verificar,
05-Eliminar y 06-Confirmar ausencia.

1. POST {{baseUrl}}/api/tasks.
   Headers Accept:application/json y Content-Type:application/json.
   Body raw JSON:
~~~json
{ "title": "{{taskTitle}}", "priority": "alta" }
~~~
   Usar los scripts Pre-request y Post-response de CREACIÓN explicados arriba:
   generar taskTitle único, borrar taskId anterior, exigir 201, guardar nuevo ID.
   Comprobar también completed:false y priority:"alta".
2. GET {{baseUrl}}/api/tasks/{{taskId}}, sin body.
   En Post-response exigir 200, mismo ID y título de las variables de colección.
3. PATCH a esa misma URL; Content-Type JSON y body {"completed":true}.
   En Post-response exigir 200 y completed boolean true.
4. GET a esa URL, sin body.
   Exigir 200, ID/título originales, completed:true y priority:"alta".
5. DELETE a esa URL, sin body.
   Exigir 204 y pm.response.text() igual a ''; no usar pm.response.json().
6. GET a esa URL, todavía conservando taskId.
   Exigir 404 y error.code "TASK_NOT_FOUND".
   Solo DESPUÉS de comprobarlo, borrar taskId y taskTitle con
   pm.collectionVariables.unset('taskId') y unset('taskTitle').

GET/DELETE usan Accept JSON opcional, sin Content-Type ni Authorization.
Cada comprobación debe estar dentro de pm.test para verse en Test Results.
No borrar taskId antes del último GET ni generar otro título en cada request.
Si detenés el flujo antes de DELETE, limpiar manualmente el ID creado.

### Parte B — Guardar y usar token
1. POST {{baseUrl}}/api/sessions, sin Authorization, Content-Type JSON:
~~~json
{ "email": "qa@example.test", "password": "Aprender123!" }
~~~
2. Antes del login, borrar token anterior con unset.
3. En Post-response exigir 201. Solo si respondió 201, guardar:
   pm.collectionVariables.set('token', pm.response.json().accessToken).
4. GET {{baseUrl}}/api/profile.
   En Authorization elegir Bearer Token y escribir {{token}}.
   Exigir 200 y el email del usuario; no duplicar Authorization en Headers.
5. DELETE {{baseUrl}}/api/sessions con el mismo token; exigir 204.
6. GET profile con el token todavía guardado; exigir 401.
7. Borrar token de las variables de colección.
No imprimir ni exportar el token.

### Parte C — Runner con datos (solo al terminar A y B)
Un CSV contiene columnas y filas: cada fila proporciona datos para una iteración.
Ejemplo de archivo:
~~~csv
title,priority
Caso-A,alta
Caso-B,baja
~~~
En el Pre-request de 01-Crear, adaptar la generación de taskTitle:
- Leer el título con pm.iterationData.get('title').
- Agregar un GUID para que cada creación sea única.
- Guardar priority de la fila en una variable de colección taskPriority.
- Cambiar el body a:
~~~json
{ "title": "{{taskTitle}}", "priority": "{{taskPriority}}" }
~~~
En las validaciones, comparar priority contra taskPriority, no contra "alta".
Seleccionar en Runner SOLO las seis peticiones de tareas, en ese orden, y el CSV.
Esperar dos iteraciones completas; limpiar taskPriority al final de cada una.
No incluir login como parte de este flujo si no lo usa.

Terminaste si ejecutás dos veces el flujo sin reutilizar IDs viejos y podés explicar
qué corre en Pre-request, qué corre en Post-response y de dónde sale cada variable.

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
Archivo sugerido: tests/practica13.spec.ts.
GET con Accept:application/json heredado, sin body ni Authorization.
Crear tres tests automatizados y hacer luego una exploración manual separada.

### Test 1 — HTTP 500 recibido
1. GET /api/lab/status/500.
2. Exigir status 500.
3. Leer JSON y comprobar error.code "SIMULATED_500".
4. Comprobar x-request-id no vacío.
El test debe PASAR porque 500 es el resultado esperado del simulador.
No usar response.ok() como requisito de todos los tests.

### Test 2 — Respuesta demorada dentro del plazo
1. GET /api/lab/delay con params:{ms:1000} y timeout:3000.
2. Exigir 200 y body igual a {"delayedMs":1000}.
1000 son milisegundos de demora solicitada; 3000 es el máximo del cliente.
No agregar waitForTimeout ni exigir una duración exacta del sistema.

### Test 3 — Demora superior al plazo del cliente
1. Enviar GET al mismo endpoint con params:{ms:1000}, pero timeout:100.
2. Usar await expect(promesaDeLaPeticion).rejects.toThrow(/timeout/i),
   como en el ejemplo anterior.
3. No intentar response.status(): no se obtuvo una respuesta utilizable.
No hacer await de la petición antes de entregarla a expect(...).rejects:
la excepción se escaparía antes de comprobarla.

### Exploración manual — Servidor detenido
1. Fuera de la ejecución automática, detener npm run app en su terminal.
2. Desde Postman enviar GET http://127.0.0.1:3400/api/health.
3. Registrar el error de conexión: no es un HTTP 500 ni un 404.
4. Reiniciar npm run app y repetir: esperar 200.
5. Volver a ejecutar el test de health y los tres tests de este punto.
No detener el servidor desde un test ni depender de que otro lo reinicie.
Si ya configuraste webServer automático, hacer esta exploración en Postman
cuando Playwright no esté ejecutándose.

Terminaste si explicás qué caso tiene respuesta HTTP y cuál rechaza una promesa.
Explicar también por qué un POST con timeout podría haberse procesado: repetirlo
sin estrategia puede duplicar efectos. No implementar reintentos automáticos aún.
No se está midiendo carga ni un SLA productivo.

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
Crear schemas/task.schema.json con el esquema mostrado arriba y un archivo
tests/practica14.spec.ts para las comprobaciones ejecutables.
Guardar un schema NO lo ejecuta: por ahora usaremos expect, sin instalar Ajv.

### Parte A — Comprobar una respuesta real
1. POST /api/tasks, Content-Type JSON, con title único, completed:false,
   priority:"media". Exigir 201 y guardar ID.
2. GET /api/tasks/ID, Accept JSON, sin body ni Authorization. Exigir 200.
3. Leer el body y comprobar los nombres exactos de propiedades:
   id, title, completed y priority. Usar Object.keys(...).sort() como el ejemplo.
4. Comprobar id entero mayor que cero.
5. title debe ser string y tener entre 3 y 80 caracteres.
6. completed debe ser boolean.
7. priority debe pertenecer a baja/media/alta.
8. Además comparar ID y title contra los de la tarea que creaste.
   Un objeto de otra tarea puede tener tipos correctos y ser el recurso equivocado.
9. Eliminar tu tarea en finally.

### Parte B — Entender un dato incorrecto sin tocar la app
Crear un objeto local (no hacer HTTP para fabricarlo):
~~~typescript
const invalidSample = {
  id: '8',
  title: 'Muestra local',
  completed: false,
  priority: 'media',
};
~~~
Primero ejecutar temporalmente:
expect(Number.isInteger(invalidSample.id)).toBe(true);
Debe FALLAR: id es string. Leer el error y guardar evidencia.
Después retirar esa aserción deliberadamente incorrecta de la suite normal.
Si querés conservar una prueba verde del concepto, comprobar:
expect(Number.isInteger(invalidSample.id)).toBe(false);
Eso prueba un predicado concreto, no significa que ejecutaste el JSON Schema.
No convertir id con Number() antes de validar: ocultaría el defecto original.

### Parte C — Relacionar schema y comprobaciones
Explicar, campo por campo, qué hacen required, properties,
additionalProperties:false y enum.
Identificar qué reglas del schema cubrieron tus expect y cuáles no.
Ejemplo: comprobar typeof title no comprueba por sí solo minLength/maxLength.

Terminaste si distinguís tipo TS, schema escrito y validación ejecutada.
El validador automático se incorporará acompañado y con explicación de su API;
no se exige importarlo ni usar casts para simular que validaste la respuesta.

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
Postman continúa usando URLs; no importa clases TypeScript.
En este punto trabajamos principalmente en Playwright y refactorizamos sin
cambiar los comportamientos comprobados. No construir todavía el framework final.

### Etapa 1 — Dos casos con request directo
Archivo sugerido: tests/practica15.spec.ts.
1. Test positivo: crear tarea propia con título único mediante POST /api/tasks.
   Content-Type JSON, Accept heredado, sin Authorization.
2. Guardar ID, hacer GET /api/tasks/ID y exigir 200 y los datos de esa tarea.
3. Limpiar en finally.
4. Test negativo independiente: crear otra tarea y guardar su ID.
5. Eliminarla con DELETE /api/tasks/ID y exigir 204.
6. GET de ese mismo ID eliminado: exigir 404 y "TASK_NOT_FOUND".
7. Prever cleanup si el caso falla antes de eliminar.
No inventar un ID grande suponiendo que no existe.

### Etapa 2 — Extraer el cliente
1. Crear clients/TasksClient.ts siguiendo el cliente mínimo explicado arriba.
2. Su constructor recibe APIRequestContext; no crea Browser, Page ni sesión.
3. Implementar getById(id), devolviendo la APIResponse del GET.
4. En cada test crear client = new TasksClient(request).
5. Reemplazar SOLO el GET directo por client.getById(id).
6. Mantener las aserciones en los tests: el positivo exige 200; el negativo 404.
7. Ejecutar ambos tests antes y después: deben conservar el comportamiento.
No poner expect(status).toBe(200) dentro de getById: rompería el caso negativo.

### Etapa 3 — Una reutilización adicional
Solo después de pasar la etapa 2:
1. Extraer la creación repetida a create(input).
2. Para empezar, tipar input como { title:string }; los tests de esta etapa
   crean enviando solo title. El tipado completo se profundiza en módulo 18.
3. El método debe llamar POST /api/tasks con data:input y devolver la respuesta.
4. Reemplazar el POST de ambos tests por el método; mantener lectura de body,
   expectativas e IDs en los tests.
5. Ejecutar nuevamente ambos.
No agregar update/delete ni una BaseClient si no los estás usando.

### Qué queda para construir juntos
No implementar aún una fixture propia por memoria o copiando código sin explicar.
Antes de llegar al módulo 19, poder señalar en tus tests dónde están:
crear -> guardar ID -> usar -> limpiar.
request ya es una fixture incorporada; un cliente propio es otra responsabilidad.
En Postman, repetir manualmente un GET conocido y comprobar que la URL coincide
con la que construye getById, sin intentar ejecutar la clase TS allí.

Terminaste si ambos casos pasan con el mismo cliente y explicás qué lógica
moviste y qué quedó en el test. No se exige una API nueva de fixtures en este punto.

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
Esta es la integración de lo visto en 1–15, no el framework avanzado terminado.
Archivo sugerido: tests/practica16.spec.ts. Usar títulos únicos y datos propios.

### Parte A — Un flujo CRUD completo dentro de un test
Todas las URLs usan baseURL local. Accept JSON se hereda.
POST/PUT/PATCH envían objetos data con Content-Type JSON.
GET/DELETE no envían body ni Authorization.
1. POST /api/tasks con title único, completed:false y priority:"media".
   Exigir 201; guardar ID y comprobar los tres campos e ID positivo.
2. GET /api/tasks/ID. Exigir 200 y el objeto creado.
3. PATCH a esa URL con {"completed":true}.
   Exigir 200; verificar completed:true y que title/priority no cambiaron.
4. GET del ID: exigir 200 y el estado actualizado.
5. PUT del ID con otro título único, completed:false y priority:"alta".
   Exigir 200, ID conservado y los tres valores de reemplazo.
6. GET del ID: exigir 200 y ese mismo reemplazo guardado.
7. DELETE del ID: exigir 204 y texto vacío.
8. GET del ID eliminado: exigir 404 y "TASK_NOT_FOUND".
9. finally intenta limpiar tu ID; admite 204/404 porque pudo borrarse en paso 7.
No separar esos pasos en tests que se pasan un ID global.

### Parte B — Rechazo sin efectos
Crear otro test con su propia tarea.
1. Guardar el body inicial.
2. PATCH con {"completed":"true"}; exigir 422 y "VALIDATION_ERROR".
3. GET: exigir 200 y body idéntico al inicial.
4. Limpiar en finally.
Esta variante integra un negativo; un CRUD feliz no cubre rechazos.

### Parte C — Ejecutar y diagnosticar
Desde la raíz del laboratorio:
~~~bash
npm test -- tests/practica16.spec.ts
npm test
npm test -- --workers=2
npm run report
~~~
1. Ejecutar primero el archivo, después toda la suite.
2. Revisar que no haya tests viejos con fallos deliberados sin restaurar.
3. Ejecutar dos workers. Si falla, investigar IDs/títulos/estado compartido
   antes de aumentar timeouts o agregar retries.
4. Cambiar temporalmente UN valor esperado para provocar un fallo.
5. Ejecutar el archivo y abrir el reporte: identificar test, paso y comparación.
6. Restaurar el valor y comprobar que vuelve a pasar.
No dejar una expectativa incorrecta en la suite normal.

### Parte D — Evidencia útil
En una petición de tareas, registrar método/ruta, status, body y X-Request-Id.
No registrar token, password ni Authorization.
Conservar una captura del reporte fallido y otra del resultado corregido.
No hace falta una captura de una página web para demostrar un resultado HTTP.

### Parte E — Arranque automático, acompañado
1. Revisar el bloque webServer explicado arriba; identificar command, url,
   reuseExistingServer y timeout.
2. Agregarlo a defineConfig cuando podamos explicar cada campo.
3. Con API_URL local en puerto 3400, detener el servidor manual.
4. Ejecutar el test de health: Playwright debe iniciar y administrar la app.
5. No apuntar a QA dejando un webServer local desconectado de esa configuración.
6. Verificar qué ocurre si falta .env: en CI podrán llegar variables por proceso.
Antes de implementar, entender la diferencia entre cargar archivo y leer process.env.

### Parte F — Preparar CI sin exigir YAML desconocido
Anotar los comandos y variables que necesita una máquina nueva:
- Versión de Node compatible, npm ci y npm run typecheck.
- API_URL y forma de iniciar/esperar el servidor.
- Comando de tests, código de salida y carpeta reports/.
Explicar runner, job, artefacto y secreto con este flujo concreto.
El workflow YAML se construirá acompañado en módulo 25; no se exige escribirlo
todavía ni publicar nada en GitHub para cerrar este punto.

Terminaste si la suite se ejecuta de forma reproducible, los tests son
independientes y explicás qué comprobó cada paso y qué sigue fuera de cobertura.

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