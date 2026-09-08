---

description: "Task list template for feature implementation"
---

# Tasks: Cotizaciones en PDF para Freelancers

**Input**: Design documents from `/specs/001-cotizaciones-freelancer-pdf/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: `plan.md` decide explícitamente incluir pruebas unitarias mínimas, solo para las
funciones de cálculo de dinero y de numeración (investigación, Decisión 6): son los únicos
puntos donde un error tiene consecuencias serias para el negocio. El resto de la
aplicación se valida de forma manual con `quickstart.md` (Principio IV).

**Organization**: Las tareas se agrupan por historia de usuario (spec.md) para poder
implementar y probar cada una de forma independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Se puede hacer en paralelo (archivo distinto, sin dependencias pendientes)
- **[Story]**: A qué historia de usuario pertenece (US1, US2, US3)
- Cada tarea incluye la ruta exacta del archivo

## Path Conventions

Aplicación web estática de una sola página, sin backend (ver `plan.md`):

```text
index.html
src/
├── app.js
├── views/
├── models/
├── storage/
├── pdf/
└── styles/
tests/
└── unit/
```

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Poner en pie el esqueleto de la aplicación estática, sin build ni backend.

- [X] T001 Crear la estructura de carpetas del proyecto (`index.html`, `src/app.js`, `src/views/`, `src/models/`, `src/storage/`, `src/pdf/`, `src/styles/`, `tests/unit/`) según `plan.md`
- [X] T002 [P] Crear `index.html` como punto de entrada: carga `src/app.js` como módulo y la librería de PDF (jsPDF) vía CDN
- [X] T003 [P] Crear `src/styles/base.css` con un layout responsivo mobile-first (encabezado, formularios, tablas con scroll horizontal en pantallas angostas)
- [X] T004 [P] Crear `package.json` con un script `test` que use el test runner integrado de Node (`node --test tests/unit`), sin dependencias externas

**Checkpoint**: La aplicación abre en el navegador como una página en blanco servible desde cualquier hosting estático.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Cálculo de dinero, numeración y acceso a almacenamiento local — usados por las tres historias.

**⚠️ CRITICAL**: Ninguna historia de usuario puede implementarse antes de terminar esta fase.

- [X] T005 [P] Implementar la capa de acceso a `localStorage` (leer/escribir `cotizador:perfil`, `cotizador:servicios`, `cotizador:clientes`, `cotizador:cotizaciones`, `cotizador:contadorAnual`, con valores vacíos por defecto) en `src/storage/store.js`, según `contracts/storage-schema.md`
- [X] T006 [P] Escribir pruebas unitarias de cálculo (importe de línea, base imponible, IVA al 16%, total, y redondeo mitad-hacia-arriba incluyendo el caso $2.345 → $2.35) en `tests/unit/calculos.test.js`, según `data-model.md` — deben fallar antes de implementar T008
- [X] T007 [P] Escribir pruebas unitarias de numeración (primer número del año `AAAA-001`, consecutivos sin saltos ni repeticiones, reinicio a `001` en año nuevo) en `tests/unit/numeracion.test.js`, según `data-model.md` — deben fallar antes de implementar T009
- [X] T008 [P] Implementar las funciones puras de cálculo en `src/models/calculos.js` para que pasen las pruebas de T006
- [X] T009 [P] Implementar la función de numeración automática (usa `cotizador:contadorAnual` vía `src/storage/store.js`) en `src/models/numeracion.js` para que pasen las pruebas de T007
- [X] T010 Implementar el armazón de la aplicación en `src/app.js`: cambio simple entre pantallas (Perfil, Catálogo, Cotizaciones) y la pantalla de bienvenida cuando el perfil y el catálogo están vacíos (depende de T005)

**Checkpoint**: `node --test tests/unit` pasa en verde; la aplicación puede navegar entre pantallas vacías y persistir datos de prueba en `localStorage`.

---

## Phase 3: User Story 1 - Crear una cotización y descargarla en PDF (Priority: P1) 🎯 MVP

**Goal**: El freelancer crea una cotización con líneas (manuales), ve el cálculo automático de base/IVA/total, elige o da de alta un cliente, y descarga un PDF; la cotización queda bloqueada después de generarlo.

**Independent Test**: Abrir la aplicación, crear una cotización con dos líneas escritas a mano, verificar que el total coincide con el ejemplo de la spec ($2,320.00), y descargar el PDF con el desglose completo — sin depender del catálogo de servicios ni de un perfil ya configurado.

### Implementation for User Story 1

- [X] T011 [P] [US1] Implementar funciones de Cliente (crear, listar, buscar por id) en `src/models/clientes.js`, según `data-model.md` (usa T005)
- [X] T012 [US1] Implementar funciones de Cotización (crear borrador con número automático y con `fechaEmision`/`fechaValidez` = `fechaEmision` + 30 días calculadas al crear; agregar/editar/eliminar línea; recalcular totales; exigir mínimo 1 línea para poder generar el PDF; marcar como bloqueada mediante el campo `pdfGenerado: true`, per `contracts/storage-schema.md`) en `src/models/cotizaciones.js` (usa T005, T008, T009, T011)
- [X] T013 [US1] Implementar la generación del PDF según `contracts/pdf-contract.md` en `src/pdf/generarPdf.js` (usa T012)
- [X] T014 [US1] Construir la vista "Nueva Cotización" (elegir cliente existente de una lista o dar de alta uno nuevo; agregar líneas manuales con descripción/cantidad/precio; totales en vivo) en `src/views/cotizacion.js` (usa T011, T012)
- [X] T015 [US1] Conectar el botón "Descargar PDF": bloquear el botón si no hay líneas con un aviso claro (FR-009), generar el PDF, marcar la cotización como bloqueada y deshabilitar la edición de líneas y cliente (FR-012) en `src/views/cotizacion.js` (usa T013, T014)
- [X] T016 [P] [US1] Construir la vista "Mis Cotizaciones" (FR-013: lista con número, cliente, total y estado borrador/generada; permite abrir un borrador para seguir editándolo o crear una nueva; si aún no hay ninguna cotización, mostrar una invitación a crear la primera) en `src/views/listaCotizaciones.js` (usa T012)
- [X] T017 [US1] Registrar las vistas de Cotización y Lista de Cotizaciones en el armazón de navegación de `src/app.js` (usa T010, T014, T016)

**Checkpoint**: La Historia 1 funciona de punta a punta y es demostrable/publicable como MVP (Escenario 1 de `quickstart.md`).

---

## Phase 4: User Story 2 - Configurar el perfil de marca del freelancer (Priority: P2)

**Goal**: El freelancer guarda su nombre, correo, teléfono y logo una sola vez, y esos datos aparecen automáticamente en cada PDF nuevo.

**Independent Test**: Configurar el perfil con un logo, crear una cotización y descargar su PDF; verificar que el logo y los datos de contacto aparecen. Repetir sin logo y verificar que aparece el nombre en su lugar.

### Implementation for User Story 2

- [X] T018 [P] [US2] Implementar funciones de Perfil (guardar, obtener) en `src/models/perfil.js`, según `data-model.md` (usa T005)
- [X] T019 [US2] Construir la vista "Mi Perfil" (formulario de nombre, correo, teléfono y carga de logo) en `src/views/perfil.js` (usa T018)
- [X] T020 [US2] Incluir el logo (o el nombre si no hay logo) y los datos de contacto del freelancer en el encabezado del PDF, según `contracts/pdf-contract.md`, en `src/pdf/generarPdf.js` (usa T013, T018) — ya cubierto por el diseño de T013, que lee el perfil en vivo desde `storage/store.js` en cada generación

**Checkpoint**: Las Historias 1 y 2 funcionan juntas: toda cotización nueva sale con la marca del freelancer (Escenario 2 de `quickstart.md`).

---

## Phase 5: User Story 3 - Mantener un catálogo de servicios reutilizables (Priority: P3)

**Goal**: El freelancer da de alta servicios con precio por defecto y los agrega a una cotización en un par de clics.

**Independent Test**: Crear un servicio en el catálogo, agregarlo como línea en una cotización nueva y verificar que la descripción y el precio se precargan; editar después el precio del servicio en el catálogo y verificar que la cotización ya creada no cambia.

### Implementation for User Story 3

- [X] T021 [P] [US3] Implementar funciones de Servicio (crear, editar, eliminar, listar) en `src/models/servicios.js`, según `data-model.md` (usa T005)
- [X] T022 [US3] Construir la vista "Catálogo de Servicios" (lista con crear/editar/eliminar) en `src/views/catalogo.js` (usa T021)
- [X] T023 [US3] Agregar la opción "Agregar desde catálogo" en la vista de Cotización: al elegir un servicio, copiar su descripción y precio como una línea nueva (sin quedar enlazada al catálogo) en `src/views/cotizacion.js` (usa T014, T021)

**Checkpoint**: Las tres historias funcionan juntas de forma independiente (Escenario 3 de `quickstart.md`).

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Pulido final y publicación.

- [X] T024 [P] Revisar y ajustar `src/styles/base.css` en las tres vistas principales (Cotización, Perfil, Catálogo) para que se usen cómodamente en una pantalla de celular, sin zoom ni scroll horizontal
- [X] T025 [P] Redactar en `README.md` los pasos para publicar la aplicación en un hosting estático (subir `index.html` y `src/` tal cual, sin paso de compilación)
- [X] T026 Ejecutar manualmente los 6 escenarios de `quickstart.md` (incluido el de celular) y corregir cualquier desviación encontrada — ejecutados con Playwright contra un navegador Chromium real (no solo revisión estática): totales exactos, PDF con el contenido completo, bloqueo tras generar, numeración consecutiva, catálogo, cliente reutilizable, vista móvil sin scroll horizontal y persistencia tras recargar; sin errores de consola

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias, se puede empezar de inmediato.
- **Foundational (Phase 2)**: depende de que termine Setup; bloquea a todas las historias.
- **User Stories (Phase 3-5)**: todas dependen de que termine Foundational.
  - Pueden avanzar en paralelo si hay más de una persona, o en orden de prioridad (US1 → US2 → US3).
- **Polish (Phase 6)**: depende de que estén listas las historias que se quieran publicar.

### User Story Dependencies

- **US1 (P1)**: sin dependencias de otras historias.
- **US2 (P2)**: se integra con el PDF de US1 (T020 modifica `src/pdf/generarPdf.js`), pero US1 ya funciona sin ella (con nombre en vez de logo).
- **US3 (P3)**: se integra con la vista de Cotización de US1 (T023 modifica `src/views/cotizacion.js`), pero US1 ya funciona sin catálogo (líneas manuales).

### Parallel Opportunities

- T002, T003, T004 (Setup) en paralelo.
- T005, T006, T007 (Foundational) en paralelo; luego T008, T009 en paralelo.
- T011 (US1) en paralelo con el resto de Foundational recién terminado.
- T016 (US1) en paralelo con T014/T015 una vez lista T012.
- T018 (US2) y T021 (US3) se pueden hacer en paralelo entre sí y en paralelo con el trabajo de US1, ya que tocan archivos distintos.

---

## Parallel Example: User Story 1

```bash
# Una vez terminada la fase Foundational:
Task: "Implementar funciones de Cliente en src/models/clientes.js"
# T012, T013, T014, T015 son secuenciales (cada una depende de la anterior)
# T016 puede avanzar en paralelo en cuanto T012 esté lista:
Task: "Construir la vista Mis Cotizaciones en src/views/listaCotizaciones.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (bloquea todo lo demás)
3. Completar Phase 3: User Story 1
4. **Detenerse y validar**: correr el Escenario 1 de `quickstart.md`
5. Publicar en un hosting estático — ya es un producto usable

### Incremental Delivery

1. Setup + Foundational → base lista
2. + US1 → probar de forma independiente → publicar (MVP)
3. + US2 → probar de forma independiente → publicar
4. + US3 → probar de forma independiente → publicar
5. Cada historia suma valor sin romper las anteriores

---

## Notes

- [P] = archivos distintos, sin dependencias pendientes entre sí.
- [Story] identifica a qué historia de usuario pertenece cada tarea.
- Las pruebas unitarias (T006, T007) se escriben antes que su implementación (T008, T009) y deben fallar primero.
- Confirmar cada checkpoint operando la aplicación (Principio IV) antes de avanzar a la siguiente fase.
- Evitar: tareas vagas, dos tareas [P] tocando el mismo archivo, o dependencias que rompan la independencia de una historia.
