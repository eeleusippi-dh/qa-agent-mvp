# QA Agent MVP — paso 2

Base local: contador y tres pruebas con Playwright + TypeScript.

## Preparación

Requiere Node.js 24 y npm. Desde la raíz del repositorio:

```sh
npm install
npx playwright install chromium
npm run test:e2e
```

La configuración levanta y detiene la aplicación automáticamente. El puerto 3000 debe estar libre.
Resultado esperado: tres pruebas aprobadas. Para ver el informe:

```sh
npm run report
```

Para explorar la aplicación manualmente, ejecutar `npm run start` y abrir
http://127.0.0.1:3000. Detenerla con Ctrl+C antes de ejecutar los tests.

## Comprobar que detecta un error

En public/index.html cambiar temporalmente `count += 1` por `count += 2`.
Ejecutar los tests: CA-01 debe pasar; CA-02 y CA-03 deben fallar.
Restaurar `count += 1` y repetir: deben aprobar los tres.

## Archivos

- public/index.html: aplicación.
- server.cjs: servidor local sin dependencias adicionales.
- requirements/counter.md: criterios y casos iniciales.
- tests/counter.spec.ts: pruebas de navegador.
- playwright.config.ts: navegador, entorno y reportes.

`npm install` genera package-lock.json. Versionarlo junto con el código para que
GitHub Actions pueda instalar las mismas dependencias con `npm ci`.

## GitHub Actions

El workflow `.github/workflows/playwright.yml` ejecuta las pruebas con Node.js 24
y Chromium en cada push a `main` y pull request dirigido a `main`. También permite iniciarlas manualmente
desde la pestaña **Actions** del repositorio con **Run workflow**.

Subir el proyecto, incluyendo `package-lock.json` y el workflow, a un repositorio
de GitHub para activar la automatización. Cada ejecución guarda el informe
`playwright-results`, con el reporte y las evidencias, durante 7 días; se puede descargar desde **Artifacts**.

Para impedir merges cuando fallan las pruebas, configurar `playwright-tests` como
check obligatorio en las reglas de protección de la rama del repositorio.
El agente se incorporará en los próximos pasos.
