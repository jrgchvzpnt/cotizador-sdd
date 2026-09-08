---

description: "Task list template for feature implementation"
---

# Tasks: Cotizaciones en PDF para Freelancers (Angular + Java/Spring Boot)

**Input**: Design documents from `/specs/001-cotizaciones-freelancer-pdf/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Nota**: este `tasks.md` reemplaza al de la versión sin backend (26 tareas, ya
completadas) tras la enmienda de la constitución a v2.0.0 (Angular + Java/Spring Boot
como arquitectura estándar). Los requisitos funcionales (FR-001 a FR-013) no cambian;
solo dónde vive cada pieza de lógica.

**Tests**: igual que antes, solo se prueban automáticamente los cálculos de dinero y la
numeración (research.md, Decisión 6) — ahora con JUnit 5 en el backend. El resto se
valida manualmente con `quickstart.md` (Principio IV).

**Organization**: las tareas se agrupan por historia de usuario (spec.md) para poder
implementar y probar cada una de forma independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede hacer en paralelo (archivo distinto, sin dependencias pendientes)
- **[Story]**: a qué historia de usuario pertenece (US1, US2, US3)
- Cada tarea incluye la ruta exacta del archivo

## Path Conventions

```text
backend/
├── src/main/java/mx/cotizador/{modelo,repositorio,servicio,web}/
├── src/main/resources/{application.properties, static/}
└── src/test/java/mx/cotizador/servicio/

frontend/
└── src/app/{core,cotizaciones,perfil,catalogo}/
```

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: poner en pie los dos proyectos (backend Spring Boot, frontend Angular) y
cómo se empaquetan juntos.

- [X] T001 Crear el proyecto Spring Boot en `backend/` (Maven, Java 25) con las
      dependencias `spring-boot-starter-web`, `spring-boot-starter-data-jpa`,
      `com.h2database:h2`, `com.github.librepdf:openpdf` y `spring-boot-starter-test`
      en `backend/pom.xml`
- [X] T002 [P] Crear el proyecto Angular en `frontend/` con Angular CLI (routing
      habilitado, sin librería de UI adicional, conforme al Principio I)
- [X] T003 [P] Configurar `backend/src/main/resources/application.properties` con la
      base de datos H2 en modo archivo; cualquier credencial se toma de variables de
      entorno, nunca embebida (Principio V)
- [X] T004 [P] Crear un script de build en la raíz del repositorio que compile Angular
      (`ng build`) y copie el resultado a `backend/src/main/resources/static/`, de modo
      que `mvn package` produzca un solo JAR desplegable
- [X] T005 [P] Configurar el CSS base responsivo mobile-first en `frontend/src/styles.css`

**Checkpoint**: `mvn spring-boot:run` levanta el backend y sirve una página en blanco
generada por Angular.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: entidades, cálculo, numeración y manejo de errores — usados por las tres
historias.

**⚠️ CRITICAL**: ninguna historia de usuario puede implementarse antes de terminar esta
fase.

- [X] T006 [P] Crear las entidades JPA `Perfil`, `Servicio`, `Cliente`, `Cotizacion` y
      `LineaCotizacion` en `backend/src/main/java/mx/cotizador/modelo/`, según
      `data-model.md`
- [X] T007 [P] Crear los repositorios Spring Data JPA (`PerfilRepository`,
      `ServicioRepository`, `ClienteRepository`, `CotizacionRepository`) en
      `backend/src/main/java/mx/cotizador/repositorio/` (usa T006)
- [X] T008 [P] Escribir pruebas JUnit de cálculo (importe de línea, base imponible, IVA
      al 16%, total, y redondeo mitad-hacia-arriba incluyendo el caso $2.345 → $2.35) en
      `backend/src/test/java/mx/cotizador/servicio/CalculoServiceTest.java` — deben
      fallar antes de implementar T010
- [X] T009 [P] Escribir pruebas JUnit de numeración (primer número del año `AAAA-001`,
      consecutivos sin saltos ni repeticiones, reinicio a `001` en año nuevo) en
      `backend/src/test/java/mx/cotizador/servicio/NumeracionServiceTest.java` — deben
      fallar antes de implementar T011
- [X] T010 [P] Implementar `CalculoService` (usa `BigDecimal` con
      `RoundingMode.HALF_UP`) en `backend/src/main/java/mx/cotizador/servicio/CalculoService.java`
      para que pasen las pruebas de T008
- [X] T011 [P] Implementar `NumeracionService` en
      `backend/src/main/java/mx/cotizador/servicio/NumeracionService.java` para que
      pasen las pruebas de T009 (usa T007 para el contador por año)
- [X] T012 Configurar el manejo global de errores (`@RestControllerAdvice`) que traduce
      validaciones, "no encontrado" y "cotización bloqueada" a HTTP 400/404/409 con
      mensajes en español de México, en
      `backend/src/main/java/mx/cotizador/web/ManejadorErrores.java`
- [X] T013 Crear el servicio Angular `ApiService` (llamadas HTTP al backend) y el
      enrutamiento base con la pantalla de bienvenida cuando no hay perfil, catálogo,
      clientes ni cotizaciones, en `frontend/src/app/core/api.service.ts` y
      `frontend/src/app/app.routes.ts` (usa T001-T005)

**Checkpoint**: `mvn test` pasa en verde; el backend expone una API vacía y el frontend
puede navegar entre pantallas vacías.

---

## Phase 3: User Story 1 - Crear una cotización y descargarla en PDF (Priority: P1) 🎯 MVP

**Goal**: el freelancer crea una cotización con líneas, ve el cálculo automático de
base/IVA/total, elige o da de alta un cliente, y descarga un PDF generado por el
backend; la cotización queda bloqueada después.

**Independent Test**: crear una cotización con dos líneas manuales desde Angular,
verificar que el total coincide con el ejemplo de la spec ($2,320.00) tal como lo
devuelve el backend, y descargar el PDF con el desglose completo.

### Implementation for User Story 1

- [X] T014 [P] [US1] Implementar `ClienteService` (crear, listar) y `ClienteController`
      (`GET/POST /api/clientes`) en
      `backend/src/main/java/mx/cotizador/servicio/ClienteService.java` y
      `.../web/ClienteController.java` (usa T007)
- [X] T015 [US1] Implementar `CotizacionService` (crear borrador con número y fechas
      automáticas, agregar/editar/eliminar línea, recalcular totales, cambiar cliente,
      exigir mínimo 1 línea para el PDF, marcar como bloqueada) en
      `backend/src/main/java/mx/cotizador/servicio/CotizacionService.java` (usa T007,
      T010, T011, T014)
- [X] T016 [US1] Implementar `PdfService` (genera el PDF con OpenPDF según
      `contracts/pdf-contract.md`, leyendo el `Perfil`) en
      `backend/src/main/java/mx/cotizador/servicio/PdfService.java` (usa T015)
- [X] T017 [US1] Implementar `CotizacionController` con todos los endpoints de
      `contracts/api-rest.md` (crear, detalle, líneas, cambiar cliente, pdf) en
      `backend/src/main/java/mx/cotizador/web/CotizacionController.java` (usa T015, T016)
- [X] T018 [US1] Construir en Angular la pantalla "Nueva Cotización" (elegir cliente
      existente o dar de alta uno nuevo, agregar/editar/eliminar líneas manuales,
      totales en vivo, botón "Descargar PDF" deshabilitado sin líneas, bloqueo visual
      tras generar) en `frontend/src/app/cotizaciones/cotizacion-form/` (usa T013, T017)
- [X] T019 [P] [US1] Construir en Angular la pantalla "Mis Cotizaciones" (FR-013: lista
      con número, cliente, total y estado; abrir un borrador o crear una nueva) en
      `frontend/src/app/cotizaciones/cotizacion-lista/` (usa T013, T017)
- [X] T020 [US1] Conectar la navegación de Angular a las pantallas de Cotización y Lista
      de Cotizaciones en `frontend/src/app/app.routes.ts` (usa T013, T018, T019)

**Checkpoint**: la Historia 1 funciona de punta a punta contra el backend real
(Escenario 1 de `quickstart.md`).

---

## Phase 4: User Story 2 - Configurar el perfil de marca del freelancer (Priority: P2)

**Goal**: el freelancer guarda su nombre, correo, teléfono y logo una sola vez, y esos
datos aparecen automáticamente en cada PDF nuevo.

**Independent Test**: configurar el perfil con un logo, crear una cotización y
descargar su PDF; verificar que el logo y los datos de contacto aparecen. Repetir sin
logo y verificar que aparece el nombre en su lugar.

### Implementation for User Story 2

- [X] T021 [P] [US2] Implementar `PerfilService` (guardar, obtener) y
      `PerfilController` (`GET/PUT /api/perfil`) en
      `backend/src/main/java/mx/cotizador/servicio/PerfilService.java` y
      `.../web/PerfilController.java` (usa T007)
- [X] T022 [US2] Construir en Angular la pantalla "Mi Perfil" (formulario de nombre,
      correo, teléfono y carga de logo) en `frontend/src/app/perfil/` (usa T013, T021)
- [X] T023 [US2] Incluir el logo (o el nombre si no hay logo) y los datos de contacto
      del freelancer en el encabezado del PDF, según `contracts/pdf-contract.md`, en
      `backend/src/main/java/mx/cotizador/servicio/PdfService.java` (usa T016, T021) —
      ya cubierto por el diseño de T016, que lee el `Perfil` en cada generación

**Checkpoint**: las Historias 1 y 2 funcionan juntas: toda cotización nueva sale con la
marca del freelancer (Escenario 2 de `quickstart.md`).

---

## Phase 5: User Story 3 - Mantener un catálogo de servicios reutilizables (Priority: P3)

**Goal**: el freelancer da de alta servicios con precio por defecto y los agrega a una
cotización en un par de clics.

**Independent Test**: crear un servicio en el catálogo, agregarlo como línea en una
cotización nueva y verificar que la descripción y el precio se precargan; editar
después el precio del servicio en el catálogo y verificar que la cotización ya creada
no cambia.

### Implementation for User Story 3

- [X] T024 [P] [US3] Implementar `ServicioService` (crear, editar, eliminar, listar) y
      `ServicioController` (`GET/POST/PUT/DELETE /api/servicios`) en
      `backend/src/main/java/mx/cotizador/servicio/ServicioService.java` y
      `.../web/ServicioController.java` (usa T007)
- [X] T025 [US3] Construir en Angular la pantalla "Catálogo de Servicios" (lista con
      crear/editar/eliminar) en `frontend/src/app/catalogo/` (usa T013, T024)
- [X] T026 [US3] Agregar la opción "Agregar desde catálogo" en la pantalla de
      Cotización de Angular: al elegir un servicio, copiar su descripción y precio como
      una línea nueva en `frontend/src/app/cotizaciones/cotizacion-form/` (usa T018,
      T024)

**Checkpoint**: las tres historias funcionan juntas de forma independiente (Escenario 3
de `quickstart.md`).

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: pulido final y publicación.

- [X] T027 [P] Revisar el CSS responsivo de Angular en las tres pantallas principales
      (Cotización, Perfil, Catálogo) para que se usen cómodamente en un celular
- [X] T028 [P] Actualizar `README.md` con los pasos para correr backend y frontend en
      desarrollo (`mvn spring-boot:run`, `ng serve`) y para empaquetar/publicar el JAR
      único que sirve ambos
- [X] T029 Ejecutar los 6 escenarios de `quickstart.md` contra el backend real
      (idealmente con Playwright, como en la versión anterior) y corregir cualquier
      desviación encontrada

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias, se puede empezar de inmediato.
- **Foundational (Phase 2)**: depende de que termine Setup; bloquea a todas las
  historias.
- **User Stories (Phase 3-5)**: todas dependen de que termine Foundational.
- **Polish (Phase 6)**: depende de que estén listas las historias que se quieran
  publicar.

### User Story Dependencies

- **US1 (P1)**: sin dependencias de otras historias.
- **US2 (P2)**: se integra con el `PdfService` de US1 (T023 modifica el mismo archivo
  que T016), pero US1 ya funciona sin ella (con nombre en vez de logo).
- **US3 (P3)**: se integra con la pantalla de Cotización de US1 (T026 modifica el mismo
  archivo que T018), pero US1 ya funciona sin catálogo (líneas manuales).

### Parallel Opportunities

- T002, T003, T004, T005 (Setup) en paralelo tras T001.
- T006, T008, T009 (Foundational) en paralelo; luego T007, T010, T011 según sus
  dependencias.
- T014 (US1) y T021 (US2) y T024 (US3) tocan archivos distintos del backend y pueden
  avanzar en paralelo una vez lista la fase Foundational.
- T019 (US1) en paralelo con T018 una vez lista T017.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (bloquea todo lo demás)
3. Completar Phase 3: User Story 1
4. **Detenerse y validar**: correr el Escenario 1 de `quickstart.md` contra el backend
   real
5. Empaquetar el JAR único y publicarlo — ya es un producto usable

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
- Las pruebas JUnit (T008, T009) se escriben antes que su implementación (T010, T011) y
  deben fallar primero.
- Confirmar cada checkpoint operando la aplicación (Principio IV) antes de avanzar a la
  siguiente fase.
- Evitar: tareas vagas, dos tareas [P] tocando el mismo archivo, o dependencias que
  rompan la independencia de una historia.
