# Primera ejecucion manual del agente QA

## Alcance

Workflow manual sobre la version seleccionada del repositorio. Genera pruebas para todo el contador
(CA-01, CA-02 y CA-03). No analiza aun un diff de feature ni se dispara en PRs.
Solo usar con el repositorio de demostracion y cambios revisados de colaboradores de confianza.

## Archivos agregados

- `.github/workflows/qa-agent.yml`: generacion, ejecucion y check final.
- `.github/qa/baseline-prompt.md`: tarea inicial que invoca la skill existente.
- `.github/qa/bundle.schema.json`: estructura de la respuesta de Codex.
- `.github/qa/validate-agent.mjs`: recuperacion de archivos y validacion de resultados.

No reemplazan `playwright.yml` ni la skill existente. No cambian dependencias.

## Publicacion y ejecucion

1. Copiar los archivos a la raiz del proyecto, combinando `.github` con la carpeta existente.
2. Crear commit en `feat/qa-agent-workflow`, subirlo y abrir un PR hacia `main`.
3. Revisar los archivos y el check existente de Playwright. Este PR no ejecuta al agente.
4. Incorporar el PR a `main` una vez revisado.
5. En GitHub: Actions > QA Agent MVP > Run workflow. Elegir `main` y confirmar.

Esta ejecucion consume la API de OpenAI y requiere el secreto `OPENAI_API_KEY` y acceso con cuota disponible.
El workflow deja el modelo predeterminado de Codex; disponibilidad y limites dependen del proyecto de API.

## Resultado esperado

- Generar casos y tests: Codex crea el paquete de salida.
- Validar y ejecutar Playwright: una maquina nueva recupera solo tests y documentacion,
  ejecuta los tests generados y los tres tests de referencia existentes.
- qa-agent-gate: aprueba solo si ambas etapas terminaron correctamente.

Descargar el artifact `qa-agent-evidence` desde el resumen de la ejecucion.
Incluye los casos, resumen, tests, reporte HTML y resultados JSON generados por Playwright.
Las pruebas generadas quedan como evidencia, no se suben automaticamente al repositorio.

## Controles y limites

- Codex es el ultimo paso del job de generacion. Solo su respuesta JSON pasa al siguiente job.
- La maquina de ejecucion recupera el mismo commit desde cero; no recibe el secreto de OpenAI
  ni cambios a la aplicacion que pudiera haber hecho el agente en su maquina.
- El verificador limita cantidad, tamano y rutas de los archivos recibidos y comprueba sintaxis,
  algunas construcciones prohibidas y correspondencia entre resumen y archivos.
- La comprobacion del reporte rechaza pruebas omitidas, fallos esperados y criterios sin ejecucion aprobada.
- Los controles estaticos no son un sandbox y no demuestran que las aserciones sean suficientes.
  Revisar los casos y tests producidos durante este piloto antes de extenderlo al equipo.
- El check final aun no es obligatorio en una proteccion de rama ni habilita auto-merge.
- La ausencia de generacion, un error de API o una ejecucion incompleta no aprueban el check final.

No cambiar a `pull_request_target` para ejecutar codigo de PRs con secretos.
La siguiente etapa incorporara diffs y activacion en PRs con reglas de confianza y proteccion de rama.

## Errores habituales

- No aparece Run workflow: incorporar primero el archivo a la rama principal y recargar Actions.
- API sin cuota o modelo no disponible: revisar acceso y facturacion del proyecto de OpenAI.
- Generacion correcta pero validacion fallida: revisar el paso del verificador; no desactivar el control
  para conseguir un verde. Corregir el prompt o el caso y volver a ejecutar manualmente.
- El check existing de Playwright pasa pero QA Agent MVP no corrio: es normal en el PR de instalacion.
