# Implementation Plan: Cotizaciones en PDF para Freelancers

**Branch**: `001-cotizaciones-freelancer-pdf` | **Date**: 2026-09-07 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-cotizaciones-freelancer-pdf/spec.md`

**Nota de re-planificación (2026-09-07)**: este plan reemplaza al anterior (aplicación
estática sin backend). La constitución se enmendó a la v2.0.0 para adoptar Angular
(frontend) y Java con Spring Boot (backend) como arquitectura estándar del proyecto, a
petición explícita del usuario. La spec se actualizó en consecuencia (FR-011, Fuera de
Alcance y Assumptions) para reflejar que los datos ahora se guardan en una base de datos
del backend en vez de en el navegador.

## Summary

Se migra la misma funcionalidad (cotizaciones con cálculo automático de IVA, numeración
automática y PDF descargable) a una arquitectura cliente-servidor: un frontend en
Angular que consume una API REST expuesta por un backend en Java con Spring Boot, el
cual concentra el cálculo, la numeración, la persistencia en base de datos y la
generación del PDF. El backend sirve también los archivos estáticos ya compilados del
frontend, de modo que el despliegue sigue siendo un solo proceso.

## Technical Context

**Language/Version**: TypeScript con Angular 22 (frontend); Java 25 (backend).

**Primary Dependencies**: Angular Material (componentes de interfaz: tarjetas,
formularios, tablas, botones) y Tailwind CSS (utilidades de layout/espaciado), a
petición explícita del usuario para una interfaz más moderna — ambas son librerías
estándar del ecosistema Angular, no infraestructura adicional, y evitan construir a
mano componentes que Material ya resuelve; Spring Boot (última versión estable
compatible con Java 25) con Spring Web y Spring Data JPA (backend); OpenPDF para
generar el PDF en el servidor (evita reimplementar el mismo cálculo y formato en dos
lenguajes).

**Storage**: base de datos relacional embebida H2 en modo archivo, gestionada por Spring
Data JPA. Es la opción más simple que sigue siendo una base de datos real: no requiere
instalar ni operar un servidor de base de datos aparte (Principio I), y puede
sustituirse por PostgreSQL más adelante si el negocio lo pide explícitamente (no antes,
Principio III).

**Testing**: backend — JUnit 5 (incluido en `spring-boot-starter-test`) para las
funciones de cálculo, IVA, numeración y para los endpoints REST (`MockMvc`); frontend —
el framework de pruebas que trae por defecto Angular CLI, usado únicamente para la
lógica de presentación crítica (p. ej., que el total mostrado coincida con la respuesta
del backend). El resto de la aplicación se valida de forma manual con `quickstart.md`
(Principio IV).

**Target Platform**: navegador web de escritorio y celular (Angular, responsivo) +
backend Java desplegado como un único proceso (JAR ejecutable) que también sirve los
archivos estáticos del frontend compilado.

**Project Type**: aplicación web con frontend y backend separados en el código fuente,
mismo despliegue.

**Performance Goals**: interacciones cotidianas percibidas como instantáneas (por debajo
de 1 segundo) en un dispositivo de gama media, incluida la generación del PDF.

**Constraints**: debe verse y usarse bien en pantallas de celular; sin cuentas de
usuario ni inicio de sesión (Fuera de Alcance de la spec); sin más servicios externos
que el propio backend y su base de datos.

**Scale/Scope**: un freelancer por instalación del backend; volumen esperado de decenas
de servicios, cientos de clientes y cientos de cotizaciones por año — muy por debajo de
lo que maneja sin esfuerzo una base de datos relacional embebida.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación | Cómo se cumple |
|---|---|---|
| I. Simplicidad ante todo | PASS | Dentro de la arquitectura estándar (Angular + Spring Boot), se elige la opción más simple en cada punto: una sola aplicación Spring Boot (sin microservicios), una base de datos embebida (sin servidor de BD aparte), sin librería de UI adicional en Angular, un solo artefacto de despliegue (el backend sirve el frontend compilado). |
| II. Idioma y mercado | PASS | La interfaz Angular, los mensajes de la API y el PDF generado por el backend siguen en español de México, con montos en pesos mexicanos (MXN). |
| III. Cero alcance fantasma | PASS | La migración reproduce exactamente los mismos requisitos funcionales (FR-001 a FR-013) sin añadir cuentas de usuario, sincronización multiusuario, ni funcionalidad nueva no pedida. |
| IV. Verificable por una persona no técnica | PASS | Sigue siendo una aplicación web operable desde el navegador; cada criterio de aceptación se comprueba haciendo clic y revisando el PDF, sin leer código (ver `quickstart.md` actualizado). |
| V. Datos del usuario | PASS | Solo se piden los datos ya definidos en la spec. Las credenciales de la base de datos y cualquier configuración sensible del backend se manejan por variables de entorno (`application.properties` sobrescribible por variables de entorno), nunca embebidas en el código. |

No hay violaciones que justificar.

**Re-chequeo posterior al diseño (Fase 1)**: tras generar `data-model.md`, `contracts/`
y `quickstart.md`, se confirma que ningún artefacto de diseño introduce infraestructura
adicional (sin colas de mensajes, sin caché, sin autenticación, sin microservicios). Los
cinco principios se mantienen en PASS.

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
backend/
├── src/main/java/mx/cotizador/
│   ├── modelo/            # Entidades JPA: Perfil, Servicio, Cliente, Cotizacion, LineaCotizacion
│   ├── repositorio/        # Interfaces Spring Data JPA
│   ├── servicio/           # Lógica de negocio: cálculo, numeración, generación de PDF
│   ├── web/                # Controladores REST (uno por recurso)
│   └── CotizadorApplication.java
├── src/main/resources/
│   ├── application.properties
│   └── static/             # Aquí se copia el build de Angular al empaquetar (mismo JAR)
└── src/test/java/mx/cotizador/   # Pruebas JUnit (cálculo, numeración, controladores)

frontend/
├── src/app/
│   ├── perfil/              # Pantalla "Mi Perfil"
│   ├── catalogo/            # Pantalla "Catálogo de Servicios"
│   ├── cotizaciones/        # Lista de cotizaciones + formulario de cotización
│   ├── core/                # Servicios Angular que llaman a la API REST
│   └── shared/              # Componentes/formatos compartidos (moneda, fechas)
└── ...  (estructura estándar generada por Angular CLI)
```

**Structure Decision**: separación estándar `backend/` (Spring Boot) y `frontend/`
(Angular) en el mismo repositorio, con un único artefacto de despliegue: el build de
Angular se empaqueta dentro del JAR de Spring Boot como recursos estáticos, de modo que
solo hay un proceso que levantar (Principio I).

## Complexity Tracking

> No aplica — el Constitution Check no encontró violaciones que justificar dentro de la
> arquitectura estándar adoptada.
