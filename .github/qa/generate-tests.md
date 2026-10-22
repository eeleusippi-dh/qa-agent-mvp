# Tarea del agente QA del MVP

Usá la skill `$qa-playwright` de `.agents/skills/qa-playwright/SKILL.md`.
Leé esa skill y su referencia de estándares antes de actuar.

El objetivo es generar casos y tests para el cambio que identifique el pipeline,
contrastándolo con los criterios de `requirements/`.

Inspeccioná los archivos existentes para comprender la aplicación y sus convenciones.
Escribí únicamente los entregables definidos por la skill en `tests/generated/` y `qa-output/`.
Si faltan entradas esenciales, documentá `needs_context` en el resumen.

No ejecutes la aplicación ni las pruebas. La ejecución real y el control final corresponden
a jobs separados del workflow. No declares que las pruebas pasan.

Este archivo contiene la tarea de generación, no configura por sí mismo el workflow.
