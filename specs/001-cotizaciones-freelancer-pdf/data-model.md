# Data Model: Cotizaciones en PDF para Freelancers (Angular + Spring Boot)

Todas las entidades se persisten en la base de datos del backend (H2 embebida, vía
Spring Data JPA). Este documento reemplaza al `data-model.md` de la versión sin backend
(que describía un esquema de `localStorage`); las reglas de negocio (cálculo,
numeración, bloqueo tras generar PDF) no cambian, solo dónde y cómo se guardan.

## Perfil

Un único registro por instalación del backend (FR-001).

| Campo | Tipo (Java/JPA) | Reglas |
|---|---|---|
| id | Long (PK, autogenerado) | único registro esperado en la tabla |
| nombre | String | requerido, no vacío |
| correoElectronico | String | requerido, formato de correo válido |
| telefono | String | requerido |
| logo | byte[] o referencia a archivo | opcional; si no existe, el PDF muestra el nombre en su lugar (Aclaraciones, PA2) |

## Servicio (Catálogo)

Colección de servicios reutilizables (FR-002).

| Campo | Tipo | Reglas |
|---|---|---|
| id | Long (PK, autogenerado) | |
| nombre | String | requerido, no vacío |
| precioDefault | BigDecimal | requerido, ≥ 0, 2 decimales (MXN) |

Relación: una `LineaCotizacion` puede referenciar el `Servicio` de origen (para
trazabilidad), pero copia su descripción y precio al crearse (FR-004). Editar o eliminar
un `Servicio` después no modifica líneas ya creadas (Historia 3, escenario 2) — la
relación es informativa, no una dependencia en cascada.

## Cliente

Colección reutilizable de clientes (Clarifications, sesión 2026-09-05).

| Campo | Tipo | Reglas |
|---|---|---|
| id | Long (PK, autogenerado) | |
| nombre | String | requerido, no vacío |
| correoElectronico | String | requerido, formato de correo válido |
| telefono | String | requerido |

Se crea al capturar sus datos por primera vez desde el formulario de cotización, y
queda disponible para elegirse en cotizaciones futuras (FR-003, SC-006). Sin endpoint de
edición/eliminación en esta versión (ver Assumptions de la spec).

## Cotización

El documento central (FR-005, FR-006, FR-007, FR-012).

| Campo | Tipo | Reglas |
|---|---|---|
| id | Long (PK, autogenerado) | |
| numero | String, formato `AAAA-NNN` | autogenerado y secuencial dentro del año de emisión; reinicia en `001` cada año; **inmutable** una vez asignado |
| cliente | relación ManyToOne → Cliente | requerido |
| fechaEmision | LocalDate | autogenerada al crear |
| fechaValidez | LocalDate | = fechaEmision + 30 días, calculada en el backend |
| lineas | relación OneToMany → LineaCotizacion | mínimo 0 mientras está en borrador; se exige mínimo 1 para generar el PDF (FR-009) |
| baseImponible | BigDecimal | calculado por el backend: suma de importes de línea |
| iva | BigDecimal | calculado: baseImponible × 16% |
| total | BigDecimal | calculado: baseImponible + iva |
| pdfGenerado | boolean | por defecto `false`; pasa a `true` la primera vez que se descarga el PDF |

**Regla de bloqueo** (FR-012, SC-007): el backend rechaza (HTTP 409) cualquier intento
de modificar `lineas` o `cliente` cuando `pdfGenerado = true`. El número de cotización
nunca se recalcula ni se reutiliza (SC-003).

**Transición de estado**:

```text
[Borrador] --(se descarga el PDF, con >=1 línea)--> [Generada] (estado final)
```

## LineaCotizacion

| Campo | Tipo | Reglas |
|---|---|---|
| id | Long (PK, autogenerado) | |
| cotizacion | relación ManyToOne → Cotizacion | requerido |
| descripcion | String | requerido, no vacío |
| cantidad | BigDecimal | requerido, > 0 |
| precioUnitario | BigDecimal | requerido, ≥ 0, 2 decimales |
| origen | enum (`CATALOGO`, `MANUAL`) | |
| servicioId | Long (opcional) | solo si `origen = CATALOGO`; referencia informativa al `Servicio` |

Editable/eliminable solo mientras la `Cotizacion` esté en estado "Borrador" (FR-008).

## Reglas de cálculo (sin cambio respecto a la versión anterior, ahora en el backend)

1. Importe de línea = `cantidad × precioUnitario`, redondeado a 2 decimales (mitad hacia
   arriba, `RoundingMode.HALF_UP` en `BigDecimal`).
2. `baseImponible` = suma de los importes de todas las líneas.
3. `iva` = `baseImponible × 16%`, redondeado a 2 decimales.
4. `total` = `baseImponible + iva`.

## Numeración automática

- Formato `AAAA-NNN`; `AAAA` es el año de `fechaEmision`, `NNN` un consecutivo de 3
  dígitos que reinicia en `001` cada año nuevo (SC-003).
- Se implementa con una tabla/registro auxiliar `ContadorAnual` (año → último
  consecutivo usado) o mediante una consulta atómica al crear la cotización, para evitar
  números repetidos si dos cotizaciones se crean casi al mismo tiempo.
