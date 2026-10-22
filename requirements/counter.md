# Feature: contador

Como usuario quiero incrementar un contador con un botón.

## Criterios de aceptación

- CA-01: al abrir la página, el contador muestra 0.
- CA-02: al hacer clic una vez en Sumar, el contador muestra 1.
- CA-03: al hacer clic tres veces desde el estado inicial, muestra 3.

Cada apertura de la página inicia un contador nuevo. No se requiere persistencia.

## Casos iniciales

| Caso | Precondición | Pasos | Resultado esperado |
|---|---|---|---|
| CA-01 | Página nueva | Abrir la página | Valor 0 |
| CA-02 | Contador inicial 0 | Hacer un clic en Sumar | Valor 1 |
| CA-03 | Contador inicial 0 | Hacer tres clics en Sumar | Valor 3 |
