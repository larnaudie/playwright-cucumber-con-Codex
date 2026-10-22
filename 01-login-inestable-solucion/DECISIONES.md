# Explicación para la entrevista

## Diagnóstico
1. El click original no tenía await: el step podía continuar con la acción pendiente.
2. El sleep de 500 ms no representaba ninguna condición del negocio; la respuesta tarda entre 350 y 1399 ms.
3. textContent() obtenía una instantánea. toBe comparaba ese valor sin volver a leer el DOM.
4. Una page compartida durante toda la vida de un worker conservaba localStorage entre escenarios.
   En paralelo puede quedar oculto si cada worker recibe un único escenario; eso no demuestra aislamiento.
5. Los índices de inputs y el primer botón dependían del orden del HTML.
6. Faltaba evidencia de fallos y cobertura de logout.

ERR_CONNECTION_REFUSED es otro problema: hay que arrancar la app antes de ejecutar.
Que un login manual funcione no descarta condiciones de carrera.

## Solución
- Todas las acciones asíncronas se esperan con await.
- toHaveText consulta de nuevo el locator hasta coincidir o agotar el timeout.
- toBeVisible comprueba además que el resultado sea visible para el usuario.
- Un Browser por worker ahorra arranques; un BrowserContext por escenario aísla cookies y almacenamiento.
- CustomWorld mantiene los recursos de cada escenario sin globals de page.
- Los hooks y steps usan function, no arrows, para recibir el this de Cucumber.
- Los locators usan roles y labels con significado para el usuario.
- After adjunta la captura antes de cerrar el contexto; finally garantiza el intento de limpieza.
- Se genera HTML con los adjuntos. Un error de captura se registra como texto.
- El logout verifica el formulario y recarga para comprobar que no revive la sesión.
- No hay retries, sleeps fijos ni any.

El timeout de Cucumber delimita un step completo (15 s), incluyendo llamadas a Playwright.
No reemplaza la sincronización: las aserciones conservan su presupuesto de espera.
No se aumentó ese presupuesto para ocultar el problema.

## Diseño
El Page Object es pequeño y centraliza operaciones de una pantalla; los steps expresan comportamiento.
Para una suite mínima también sería válido usar locators directamente en steps.
No hacen falta un BasePage genérico, jerarquías complejas ni wrappers de cada acción.

Se deja el arranque manual porque era la preparación del desafío.
En CI añadiría un proceso gestionado que arranque el servidor, compruebe /health,
ejecute Cucumber y cierre el servidor incluso ante fallos. La opción webServer de
Playwright Test no se ejecuta automáticamente cuando el runner es Cucumber.

## Cómo lo defendería
"Primero identifiqué en qué paso fallaba y qué evidencia tenía.
Corregí la sincronización esperando el resultado observable.
Después eliminé el estado compartido entre escenarios y comprobé ejecución secuencial y paralela.
No usé retries para esconder la causa y añadí evidencia para futuros fallos."

## Qué no demuestra esta suite
Diez ejecuciones verdes aportan evidencia, no una garantía absoluta de ausencia de flakiness.
No se cubren 500, desconexión, expiración de sesión ni un sistema real de autenticación.
Las credenciales son datos ficticios de esta app local.
## Verificación realizada
- TypeScript strict: compilación correcta.
- Suite secuencial: 3 escenarios y 19 steps aprobados.
- Diez ejecuciones consecutivas con dos workers: todas aprobadas, sin retries.
- Fallo deliberado: salida fallida y una captura PNG verificada en el reporte JSON.
- reports/ejemplo-fallo.html conserva el ejemplo con captura.
- Se restauró el feature original y se volvió a ejecutar la suite correctamente.
- La aplicación ya estaba ejecutándose en el puerto 3100 durante estas comprobaciones.
