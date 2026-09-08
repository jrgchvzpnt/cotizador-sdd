# Contrato: Contenido del PDF de Cotización

El PDF descargable es el principal entregable visible para el cliente del freelancer, así
que su contenido es un "contrato" que la generación del documento debe cumplir siempre
(FR-010). Cualquier persona no técnica debe poder verificarlo abriendo el PDF y
comparándolo contra esta lista (Principio IV).

## Contenido obligatorio

1. **Encabezado del freelancer**: logo si existe; si no existe, el nombre del freelancer
   en texto en su lugar (Aclaraciones, PA2). Debajo o al lado: correo electrónico y
   teléfono del freelancer.
2. **Datos del cliente**: nombre, correo electrónico y teléfono.
3. **Número de cotización**: formato `AAAA-NNN` (p. ej. `2026-001`).
4. **Fecha de emisión**.
5. **Fecha de validez** (fecha de emisión + 30 días).
6. **Tabla de líneas**, una fila por línea, con columnas: descripción, cantidad, precio
   unitario, importe. Todos los montos en pesos mexicanos.
7. **Desglose final**: base imponible, IVA (16%) y total, cada uno en pesos mexicanos, con
   2 decimales.
8. **Idioma**: todo el texto del documento en español de México (Principio II).

## Reglas del contrato

- El total mostrado en el PDF debe coincidir, al centavo, con `total` calculado según las
  reglas de `data-model.md` (SC-002).
- El PDF no incluye ningún dato fuera de esta lista (por ejemplo: sin tipo de cliente, sin
  retención de impuestos, sin identificador fiscal) — conforme a "Fuera de Alcance" de la
  spec.
- Generar el PDF de una cotización sin líneas está prohibido; la aplicación debe impedirlo
  antes de intentar producir el documento (FR-009).
- Generar el PDF marca la cotización como bloqueada (`pdfGenerado: true`); volver a
  descargar el PDF de la misma cotización (sin haberla editado, porque ya no se puede)
  debe producir exactamente el mismo contenido cada vez.
