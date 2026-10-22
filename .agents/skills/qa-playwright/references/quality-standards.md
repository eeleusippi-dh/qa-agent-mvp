# Estándares iniciales de QA — MVP

Propuesta inicial para el piloto; reemplazar o ampliar con los estándares aprobados por el equipo.

## Casos

Cada caso debe identificar un criterio de aceptación y un resultado observable.
Registrar precondiciones, datos, pasos y resultado esperado de forma que otro integrante pueda reproducirlo.
Separar comportamiento requerido de su implementación actual. Documentar ambigüedades.

## Automatización

- Usar TypeScript y `@playwright/test` con la configuración existente.
- Abrir la aplicación usando rutas relativas a `baseURL`; no apuntar a sitios externos o producción.
- Preferir localizadores por rol y nombre accesible, etiqueta o test ID. No usar clases visuales frágiles cuando haya una alternativa semántica.
- Usar aserciones de Playwright con espera automática, como `await expect(locator).toHaveText(...)`.
- Evitar esperas fijas (`waitForTimeout`), pruebas vacías, `test.skip`, `test.fixme` y `test.only`.
- Cada test debe preparar su estado y poder ejecutarse solo. No compartir un contador mutable entre tests.
- Verificar el resultado del comportamiento, no solo que un botón exista o que no ocurra una excepción.
- No interceptar o reemplazar el comportamiento bajo prueba con un mock que produzca directamente el resultado esperado.
- Mantener los tests generados autocontenidos: importar únicamente `@playwright/test`, sin scripts del sistema, llamadas a procesos ni acceso a secretos.

## Ejemplo del contador

Si CA-02 exige que un clic sume uno, comprobar ese incremento aunque el código sume dos.
La prueba debe exponer el defecto. El código de la aplicación no define el resultado correcto.

No agregar máximos, persistencia o restricciones sobre valores negativos si los requisitos no los definen.

## Evidencia y decisión

La generación de tests no demuestra su aprobación. La evidencia de ejecución pertenece al job de Playwright.
Un fallo de infraestructura, ausencia de tests requeridos o requisitos esenciales pendientes no equivale a QA aprobado.
No afirmar ausencia de errores a partir de un conjunto de pruebas aprobado.
