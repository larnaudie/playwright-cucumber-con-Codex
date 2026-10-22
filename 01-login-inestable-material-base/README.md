# Desafío 01 — Login inestable

Tiempo sugerido: 45–60 minutos. Modalidad: entrevista con código y explicación en voz alta.

## Situación
Heredaste una suite que falla en CI y a veces funciona en la computadora de un compañero.
El equipo necesita confiar en los escenarios de acceso antes de publicar.
La aplicación tarda un tiempo variable en responder y recuerda la sesión en el navegador.

## Tu misión
1. Ejecutá la suite y describí qué observás, sin modificar código todavía.
2. Diagnosticá las causas; diferenciá síntomas, hipótesis y evidencia.
3. Corregí la automatización manteniendo los dos escenarios existentes.
4. Garantizá independencia entre escenarios y funcionamiento con dos workers.
5. Incorporá una captura de pantalla ante fallos, adjunta al reporte de Cucumber.
6. Agregá un escenario que compruebe que cerrar sesión vuelve a mostrar el formulario.
7. Escribí DECISIONES.md: causas, cambios, alternativas y evidencia de ejecución.

Podés modificar features, steps, support y configuración, y crear nuevas clases.
La app es parte de la consigna: no la cambies para facilitar los tests.
No soluciones los fallos con sleeps fijos, retries o incrementos arbitrarios de timeouts.
Una separación en Page Objects es opcional: justificá las abstracciones que elijas.

## Preparación
Requiere Node.js 24 y npm. En PowerShell, dentro de esta carpeta:

    npm.cmd install
    npm.cmd run browsers

Terminal 1 (dejar abierta):

    npm.cmd run app

Terminal 2:

    npm.cmd test
    npm.cmd run typecheck
    npm.cmd run test:parallel

Cucumber es el runner. No ejecutes esta suite con playwright test.
El primer npm install genera package-lock.json: conservarlo para reproducibilidad.
Para futuras instalaciones usar npm.cmd ci.
Puerto de la aplicación: 3100. Ctrl+C detiene el servidor.

## Criterios de aceptación
- Los escenarios válidos comprueban resultados visibles para el usuario.
- Un escenario falla si la aplicación devuelve un resultado incorrecto.
- Los escenarios funcionan por separado, juntos y en paralelo.
- Diez ejecuciones consecutivas completas sin fallos, sin retries.
- TypeScript compila con strict y sin recurrir a any.
- Un fallo forzado temporalmente produce evidencia útil; revertirlo al terminar.
- Los recursos del navegador se liberan incluso cuando falla un escenario.

## Evaluación (100 puntos)
- Diagnóstico y evidencia: 20.
- Sincronización y aserciones confiables: 25.
- Aislamiento y ciclo de vida: 20.
- TypeScript y mantenibilidad: 15.
- Evidencia de fallos y reporte: 10.
- Explicación de decisiones y cobertura: 10.

## Preguntas del entrevistador
- ¿Cómo distinguís un defecto del producto de un defecto del test?
- ¿Qué cambia al ejecutar Cucumber en paralelo?
- ¿Qué esperarías antes y después de enviar el formulario?
- ¿Cómo probarías un 500 o una desconexión sin depender del backend?
- ¿Qué pondrías en UI y qué bajarías a API?
- ¿Qué evidencia necesitarías antes de atribuir un fallo a CI?

## Entrega
Avisame en el chat cuando esté listo y compartí el comando ejecutado y su resultado.
Revisaremos el código de esta carpeta con feedback, preguntas y una segunda ronda.
No hay solución incluida: podés pedir pistas de menor a mayor detalle.