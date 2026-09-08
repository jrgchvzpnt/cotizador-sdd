# Data Model: Cotizaciones en PDF para Freelancers

Todas las entidades se guardan en el almacenamiento local del navegador (`localStorage`),
como datos en formato JSON. No hay base de datos ni servidor: esto es simplemente la forma
en que se organiza la información dentro del propio dispositivo del freelancer.

## Perfil del Freelancer

Un único registro por instalación de la aplicación (FR-001).

| Campo | Tipo | Reglas |
|---|---|---|
| nombre | texto | requerido, no vacío |
| correoElectronico | texto | requerido, formato de correo válido |
| telefono | texto | requerido |
| logo | imagen (opcional) | si no existe, el PDF muestra el nombre en su lugar (Aclaraciones, PA2) |

## Servicio (Catálogo)

Colección de servicios reutilizables del freelancer (FR-002).

| Campo | Tipo | Reglas |
|---|---|---|
| id | identificador único | generado por el sistema |
| nombre | texto | requerido, no vacío |
| precioDefault | monto en MXN | requerido, mayor o igual a 0, hasta 2 decimales |

Relación: una línea de cotización puede referenciar un Servicio al momento de crearse
(FR-004), pero copia su descripción y precio en ese instante. Editar o eliminar un
Servicio después **no** modifica las líneas de cotizaciones ya creadas (Historia 3,
escenario 2) — la línea de cotización no queda "enlazada en vivo" al catálogo.

## Cliente

Colección reutilizable de clientes (Clarifications, sesión 2026-09-05).

| Campo | Tipo | Reglas |
|---|---|---|
| id | identificador único | generado por el sistema |
| nombre | texto | requerido, no vacío |
| correoElectronico | texto | requerido, formato de correo válido |
| telefono | texto | requerido |

Se crea automáticamente la primera vez que el freelancer captura sus datos al hacer una
cotización, y queda disponible para elegirse (sin volver a escribirlo) en cotizaciones
futuras (FR-003, SC-006). Esta v0 no incluye una pantalla separada para editar o eliminar
clientes ya guardados (ver Assumptions de la spec).

## Cotización

El documento central de la aplicación (FR-005, FR-006, FR-007, FR-012).

| Campo | Tipo | Reglas |
|---|---|---|
| id | identificador único | generado por el sistema |
| numero | texto, formato `AAAA-NNN` | autogenerado y secuencial dentro del año de emisión; reinicia en `001` cada año nuevo; **inmutable** una vez asignado (Aclaraciones, PA3) |
| clienteId | referencia a Cliente | requerido |
| fechaEmision | fecha | autogenerada al crear la cotización |
| fechaValidez | fecha | = fechaEmision + 30 días naturales, calculada automáticamente |
| lineas | lista de Línea de Cotización | mínimo 0 mientras está en edición; se exige mínimo 1 para poder generar el PDF (FR-009) |
| baseImponible | monto en MXN | calculado: suma de (cantidad × precioUnitario) de todas las líneas |
| iva | monto en MXN | calculado: baseImponible × 16% |
| total | monto en MXN | calculado: baseImponible + iva |
| pdfGenerado | verdadero/falso | por defecto falso; pasa a verdadero la primera vez que se descarga el PDF |

**Regla de bloqueo** (FR-012, SC-007): mientras `pdfGenerado` sea falso, la cotización es
editable: se pueden agregar, editar o eliminar líneas, y cambiar el cliente. En cuanto
`pdfGenerado` pasa a verdadero, la cotización queda **bloqueada de forma permanente**: ya
no se pueden editar sus líneas ni su cliente. Un cambio posterior implica crear una
cotización nueva (con su propio número consecutivo).

**Transición de estado**:

```text
[Borrador] --(freelancer descarga el PDF, con >=1 línea)--> [Bloqueada] (estado final)
```

No existe transición de vuelta a "Borrador"; tampoco existe un estado de "eliminada" para
cotizaciones ya numeradas (no está en la spec — no se construye, Principio III).

## Línea de Cotización

Un renglón dentro de una Cotización (FR-004, FR-008).

| Campo | Tipo | Reglas |
|---|---|---|
| id | identificador único | generado por el sistema |
| descripcion | texto | requerido, no vacío |
| cantidad | número | requerido, mayor a 0 |
| precioUnitario | monto en MXN | requerido, mayor o igual a 0, hasta 2 decimales |
| origen | `catalogo` \| `manual` | indica si la línea partió de un Servicio del catálogo o se escribió a mano |
| importe | monto en MXN | calculado: cantidad × precioUnitario, redondeado a 2 decimales (mitad hacia arriba) |

Editable y eliminable libremente mientras la Cotización esté en estado "Borrador"
(FR-008); no editable una vez que la Cotización pasa a "Bloqueada" (FR-012).

## Reglas de cálculo (aplican a toda Cotización)

1. `importe` de cada línea = `cantidad × precioUnitario`, redondeado a 2 decimales.
2. `baseImponible` = suma de los `importe` de todas las líneas.
3. `iva` = `baseImponible × 16%`, redondeado a 2 decimales.
4. `total` = `baseImponible + iva`.
5. Todo redondeo usa la regla "mitad hacia arriba" (por ejemplo, $2.345 redondea a $2.35).

## Numeración automática

- Formato: `AAAA-NNN` (por ejemplo, `2026-001`, `2026-002`, …).
- `AAAA` es el año de la fecha de emisión.
- `NNN` es un contador secuencial de 3 dígitos que empieza en `001` el primer día de cada
  año y sube de uno en uno con cada cotización nueva creada ese año, sin saltos ni
  repeticiones (SC-003).
- El número se asigna al crear la cotización (no al generar el PDF) y nunca cambia
  después, ni siquiera a mano (Aclaraciones, PA3).
