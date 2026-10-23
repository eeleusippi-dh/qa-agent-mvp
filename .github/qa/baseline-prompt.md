# Primera ejecución: referencia completa del contador

Usá `$qa-playwright` y leé `.agents/skills/qa-playwright/SKILL.md` y su referencia de estándares.

Esta tarea es una validación inicial de la versión completa del contador, no un análisis de un PR.
La variable QA_COMMIT identifica la versión evaluada. No existe diff para este modo y no debés inventarlo.
Leé `requirements/counter.md`, `public/index.html`, `server.cjs`, `playwright.config.ts`,
`package.json` y `tests/counter.spec.ts`. Generá tests para CA-01, CA-02 y CA-03.

Seguí los límites de la skill. No ejecutes comandos de instalación, del servidor ni de los tests.
No modifiques archivos existentes. Creá únicamente los entregables de generación.

Convenciones de esta ejecución:
- Generá entre uno y tres archivos autocontenidos directamente en `tests/generated/`,
  con nombres como `counter.spec.ts`. Solo importá de `@playwright/test`.
- Cada test debe empezar su título por el ID del criterio que comprueba, por ejemplo
  `CA-02: un clic incrementa a uno`. Podés preparar la página con `test.beforeEach`.
- Usá `page.goto('/')` y localizadores semánticos; comprobá el valor visible con expect.
- El JSON de resumen debe listar esos tres criterios solo si realmente tienen un test.

Tu respuesta final debe ser exclusivamente el objeto JSON definido por el esquema de salida:
- `files`: rutas y contenido completo de los tests que creaste.
- `test_cases_markdown`: contenido completo de `qa-output/test-cases.md`.
- `summary`: el objeto de `qa-output/generation-summary.json`.

El contenido enviado en ese JSON será recuperado en una máquina nueva. Los cambios del directorio
de generación se descartan. El pipeline verifica las rutas y ejecuta las pruebas por separado.
No incluyas Markdown alrededor del JSON ni afirmes que las pruebas se ejecutaron.
