# Ruta de práctica acompañada
No resolver todo en una sesión. Revisamos código sin editarlo por vos.

## 0 — Observar
Consultar salud y listar tareas desde la página.
Capturar Network y explicar método, ruta, estado, headers y body.
Ejecutar el ejemplo de salud y explicar cada línea.

## 1 — Tu primer GET
En tests/01-tareas.spec.ts:
Consultar /api/tasks.
Comprobar estado 200, items como array y coherencia de total con items.length.
No comprobar un total fijo: la UI y otras pruebas pueden crear tareas.

## 2 — Crear con POST
Enviar un title propio, obtener 201, ID, title y defaults.
Comprobar Location. Guardar el ID en una variable local.
Limpiar al terminar, incluso ante fallos cuando sea posible.
Primero construirlo juntos; no adelantarse a clases de clientes API.

## 3 — Leer el recurso creado
En el mismo test crear y consultar por ID.
Verificar que el servidor conserva lo esperado, no solo lo que devolvió el POST.
No hacer que un segundo test dependa de la creación del primero.

## 4 — PATCH
Preparar tarea propia. Actualizar completed o priority.
Consultar después y verificar campos modificados y preservados.

## 5 — DELETE
Crear, eliminar, comprobar 204 y luego GET 404.
Entender por qué no se interpreta JSON vacío.

## 6 — Casos negativos y límites
title ausente, vacío, corto, largo; completed como string; priority inexistente;
body roto; Content-Type incorrecto; ID inexistente.
Diferenciar entrada inválida de un resultado esperado incorrecto.
Para rechazos, comprobar que no se modificó el recurso previo.

## 7 — Filtros y datos
Crear tareas propias pendientes y completadas; filtrar y verificar sus IDs.
No asumir que el servidor no contiene datos de otros tests.
Aprender diferencia entre aislamiento del cliente y del backend.

## 8 — Organización y Cucumber
Después de comprender requests/responses:
extraer cliente API cuando aporte valor, fixtures de preparación/limpieza,
llevar uno de los flujos a Cucumber y practicar DataTable/Outline.
No confundir un Page Object de UI con un cliente de API.

## Capturas
Por etapa: petición, respuesta, test, resultado y explicación de qué defecto detectaría.
No interpretar "pasó" como evidencia de cobertura completa.