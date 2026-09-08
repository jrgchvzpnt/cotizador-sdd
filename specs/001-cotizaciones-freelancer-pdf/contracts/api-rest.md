# Contrato: API REST del Backend

El frontend en Angular solo se comunica con el backend a través de esta API JSON. No
hay otra forma de leer o cambiar los datos (ver `data-model.md` para las entidades).
Todas las respuestas de error usan el formato `{ "mensaje": "texto en español de México" }`.

## Perfil

| Método y ruta | Descripción | Códigos |
|---|---|---|
| `GET /api/perfil` | Devuelve el perfil guardado, o `null` si aún no se ha configurado (FR-001). | 200 |
| `PUT /api/perfil` | Crea o actualiza el perfil (nombre, correo, teléfono, logo). | 200, 400 si faltan campos requeridos |

## Servicios (catálogo)

| Método y ruta | Descripción | Códigos |
|---|---|---|
| `GET /api/servicios` | Lista el catálogo completo (FR-002). | 200 |
| `POST /api/servicios` | Crea un servicio (nombre, precioDefault). | 201, 400 |
| `PUT /api/servicios/{id}` | Edita un servicio existente. | 200, 404 |
| `DELETE /api/servicios/{id}` | Elimina un servicio; no afecta líneas ya creadas con él. | 204, 404 |

## Clientes

| Método y ruta | Descripción | Códigos |
|---|---|---|
| `GET /api/clientes` | Lista los clientes guardados, para elegir uno en una cotización nueva (FR-003, SC-006). | 200 |
| `POST /api/clientes` | Da de alta un cliente nuevo (nombre, correo, teléfono). | 201, 400 |

## Cotizaciones

| Método y ruta | Descripción | Códigos |
|---|---|---|
| `GET /api/cotizaciones` | Lista todas las cotizaciones (número, cliente, total, si ya se generó el PDF) — FR-013. | 200 |
| `POST /api/cotizaciones` | Crea una cotización en borrador dado un `clienteId`; el backend le asigna número (FR-006), fecha de emisión y fecha de validez (FR-007). | 201, 400, 404 si el cliente no existe |
| `GET /api/cotizaciones/{id}` | Devuelve el detalle completo (líneas, totales, estado) de una cotización. | 200, 404 |
| `POST /api/cotizaciones/{id}/lineas` | Agrega una línea (descripción, cantidad, precioUnitario, origen, servicioId opcional); el backend recalcula base/IVA/total (FR-005). | 201, 400, 409 si la cotización ya está bloqueada |
| `PUT /api/cotizaciones/{id}/lineas/{lineaId}` | Edita una línea existente (FR-008). | 200, 400, 404, 409 si está bloqueada |
| `DELETE /api/cotizaciones/{id}/lineas/{lineaId}` | Elimina una línea (FR-008) y devuelve la cotización actualizada. | 200, 404, 409 si está bloqueada |
| `PUT /api/cotizaciones/{id}/cliente` | Cambia el cliente asociado a una cotización en borrador. | 200, 404, 409 si está bloqueada |
| `GET /api/cotizaciones/{id}/pdf` | Genera y devuelve el PDF (`application/pdf`, ver `pdf-contract.md`); marca la cotización como bloqueada (`pdfGenerado = true`) la primera vez. Volver a llamarlo después solo re-descarga el mismo contenido. | 200, 400 si no tiene líneas (FR-009), 404 |

## Reglas del contrato

- Ninguna ruta requiere autenticación ni sesión (Fuera de Alcance de la spec: sin
  cuentas de usuario).
- Los montos (`precioUnitario`, `baseImponible`, `iva`, `total`) siempre son números con
  2 decimales, en pesos mexicanos.
- Un intento de modificar líneas o cliente de una cotización con `pdfGenerado = true`
  DEBE responder `409 Conflict` con un mensaje explicando que hay que crear una
  cotización nueva (FR-012).
- Un intento de pedir el PDF de una cotización sin líneas DEBE responder `400 Bad
  Request` con un mensaje pidiendo agregar al menos una línea (FR-009), sin generar el
  archivo.
