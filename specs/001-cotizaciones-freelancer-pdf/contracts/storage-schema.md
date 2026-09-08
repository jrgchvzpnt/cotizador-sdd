# Contrato: Esquema de Almacenamiento Local

Como la aplicación no tiene backend, su única "interfaz" de datos es lo que guarda en el
almacenamiento local del navegador (`localStorage`). Este documento fija esa forma para
que cualquier parte de la aplicación que lea o escriba datos lo haga de manera consistente.

## Claves de almacenamiento

| Clave | Contenido |
|---|---|
| `cotizador:perfil` | Un único objeto Perfil del Freelancer (o ausente si no se ha configurado). |
| `cotizador:servicios` | Lista de objetos Servicio (catálogo). |
| `cotizador:clientes` | Lista de objetos Cliente. |
| `cotizador:cotizaciones` | Lista de objetos Cotización (cada una con sus líneas embebidas). |
| `cotizador:contadorAnual` | Objeto que asocia cada año con el último consecutivo usado, p. ej. `{ "2026": 2 }`, para calcular el siguiente número de cotización. |

## Formas de los objetos

```json
// cotizador:perfil
{
  "nombre": "string",
  "correoElectronico": "string",
  "telefono": "string",
  "logo": "string | null"
}
```

```json
// cotizador:servicios (lista)
{
  "id": "string",
  "nombre": "string",
  "precioDefault": 0
}
```

```json
// cotizador:clientes (lista)
{
  "id": "string",
  "nombre": "string",
  "correoElectronico": "string",
  "telefono": "string"
}
```

```json
// cotizador:cotizaciones (lista)
{
  "id": "string",
  "numero": "AAAA-NNN",
  "clienteId": "string",
  "fechaEmision": "ISO-8601",
  "fechaValidez": "ISO-8601",
  "lineas": [
    {
      "id": "string",
      "descripcion": "string",
      "cantidad": 0,
      "precioUnitario": 0,
      "origen": "catalogo | manual",
      "servicioId": "string | null"
    }
  ],
  "baseImponible": 0,
  "iva": 0,
  "total": 0,
  "pdfGenerado": false
}
```

## Reglas del contrato

- Ninguna de estas claves contiene información que no esté en `data-model.md`.
- Ninguna clave almacena contraseñas, tokens ni credenciales (Principio V) — no aplica,
  ya que esta aplicación no maneja secretos.
- Si una clave no existe todavía (primer uso de la aplicación), se trata como lista vacía
  u objeto ausente, y la aplicación debe mostrar la pantalla de bienvenida correspondiente
  (Edge Cases de la spec), no un error.
- Una Cotización con `pdfGenerado: true` no debe modificarse; cualquier función de
  guardado debe rechazar cambios a sus campos `lineas` o `clienteId` en ese caso (FR-012).
