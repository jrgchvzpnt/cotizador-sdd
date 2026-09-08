# Implementation Plan: Cotizaciones en PDF para Freelancers

**Branch**: `001-cotizaciones-freelancer-pdf` | **Date**: 2026-09-05 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-cotizaciones-freelancer-pdf/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Una aplicación web de una sola página (sin servidor propio, sin base de datos en la nube y
sin cuentas de usuario) que permite a un freelancer crear cotizaciones en español de México
con montos en pesos mexicanos, calcular automáticamente el IVA y el total, numerarlas
automáticamente por año, y descargarlas en PDF con su marca. Todo corre en el navegador
—incluido el celular— y los datos (perfil, catálogo, clientes y cotizaciones) se guardan
únicamente en el dispositivo del freelancer. Al ser un sitio estático, se puede publicar y
tener en línea de inmediato en cualquier hosting estático, sin infraestructura de servidor.

## Technical Context

**Language/Version**: JavaScript estándar de navegador (ES2020+), sin transpilación ni paso de compilación (build).

**Primary Dependencies**: una librería de generación de PDF que corre en el propio navegador (p. ej. jsPDF), cargada vía CDN. Sin backend, sin framework de UI pesado, sin ORM ni base de datos.

**Storage**: almacenamiento local del navegador (`localStorage`), en formato JSON. Sin servidor ni base de datos en la nube (excluido explícitamente por la spec y por el usuario).

**Testing**: pruebas unitarias mínimas para las funciones puras de cálculo (IVA, totales, numeración, redondeo) con un runner ligero sin dependencias pesadas; el resto de los flujos se verifica de forma funcional siguiendo los escenarios manuales de `quickstart.md`, conforme al Principio IV (verificable por una persona no técnica).

**Target Platform**: navegador web de escritorio y de celular (diseño responsivo, mobile-first), publicado como sitio estático.

**Project Type**: aplicación web de una sola página (frontend puro, sin backend).

**Performance Goals**: las interacciones cotidianas (agregar una línea, recalcular totales, generar el PDF) se perciben como instantáneas (por debajo de 1 segundo) en un teléfono o computadora de gama media.

**Constraints**: debe verse y usarse bien en pantallas de celular; no requiere cuentas de usuario ni servidor propio; cargar la página por primera vez requiere internet (está alojada en un hosting estático), pero una vez cargada, guardar datos y calcular totales no depende de la red.

**Scale/Scope**: un freelancer por navegador/dispositivo; volumen esperado de decenas de servicios, cientos de clientes y cientos de cotizaciones por año — muy por debajo de los límites típicos de almacenamiento local de un navegador.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación | Cómo se cumple |
|---|---|---|
| I. Simplicidad ante todo | PASS | Sin backend, sin base de datos, sin framework con build pipeline, sin cuentas de usuario. Una sola librería externa (PDF), cargada por CDN. Nada de lo construido anticipa necesidades futuras no pedidas. |
| II. Idioma y mercado | PASS | Toda la interfaz, mensajes y el PDF se redactan en español de México; todos los montos se muestran y calculan en pesos mexicanos (MXN). |
| III. Cero alcance fantasma | PASS | La estructura de carpetas y los artefactos de diseño cubren únicamente lo descrito en `spec.md` (perfil, catálogo, clientes, cotizaciones, PDF); no se incluyen cuentas, sincronización en la nube, multidivisa ni descuentos. |
| IV. Verificable por una persona no técnica | PASS | Al ser una aplicación web usable directamente en el navegador, cada criterio de aceptación de la spec se puede comprobar haciendo clic y revisando el PDF descargado, sin leer código (ver `quickstart.md`). |
| V. Datos del usuario | PASS | Solo se piden los datos de la spec (nombre, correo, teléfono, logo, líneas de cotización); no hay claves ni secretos en el código, ya que no existe backend ni servicio externo que requiera credenciales. |

No hay violaciones que justificar.

**Re-chequeo posterior al diseño (Fase 1)**: tras generar `data-model.md`, `contracts/` y
`quickstart.md`, se revisó de nuevo esta tabla — ningún artefacto de diseño introduce
cuentas de usuario, base de datos en la nube, funcionalidad fuera de la spec, datos
innecesarios ni secretos en el código. Los cinco principios se mantienen en PASS.

## Project Structure

### Documentation (this feature)

```text
specs/001-cotizaciones-freelancer-pdf/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
index.html                  # Punto de entrada de la aplicación estática

src/
├── app.js                  # Arranque de la aplicación y cambio simple entre pantallas
├── views/                  # Pantallas: perfil, catálogo, clientes, cotización, cotización bloqueada
├── models/                 # Funciones puras: cálculo de totales, IVA, numeración, redondeo, validaciones
├── storage/                # Acceso a localStorage (guardar/leer perfil, catálogo, clientes, cotizaciones)
├── pdf/                    # Generación del PDF a partir de una cotización
└── styles/                 # CSS responsivo (mobile-first)

tests/
└── unit/                   # Pruebas de las funciones puras en src/models/ (cálculo, numeración, redondeo)
```

**Structure Decision**: Aplicación web estática de una sola página, sin backend. Se eligió
esta estructura mínima porque no hay servidor, base de datos ni build pipeline que
mantener: todo el código vive en `src/` y `index.html`, y se publica tal cual en cualquier
hosting estático (Principio I: simplicidad ante todo). La separación en `models/` (cálculo
puro), `storage/` (persistencia local) y `pdf/` (generación del documento) mantiene cada
responsabilidad aislada sin introducir capas de abstracción adicionales.

## Complexity Tracking

> No aplica — el Constitution Check no encontró violaciones que justificar.
