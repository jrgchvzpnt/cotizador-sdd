// Generación del PDF en el propio navegador (jsPDF, cargado vía CDN en index.html).
// Contenido obligatorio: ver contracts/pdf-contract.md.
import { getPerfil } from "../storage/store.js";
import { calcularImporteLinea } from "../models/calculos.js";

const formatoMoneda = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
const formatoFecha = new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "long", year: "numeric" });

function detectarFormatoImagen(dataUrl) {
  const coincidencia = /^data:image\/(png|jpeg|jpg)/i.exec(dataUrl || "");
  return coincidencia ? coincidencia[1].toUpperCase() : "PNG";
}

export function generarPdfCotizacion(cotizacion, cliente) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const perfil = getPerfil();

  const margenIzq = 14;
  const anchoTabla = 182;
  let y = 18;

  // Encabezado: logo si existe; si no, el nombre del freelancer en texto (Aclaraciones, PA2).
  if (perfil?.logo) {
    try {
      doc.addImage(perfil.logo, detectarFormatoImagen(perfil.logo), margenIzq, 10, 28, 28);
    } catch {
      doc.setFontSize(14);
      doc.text(perfil?.nombre || "Freelancer", margenIzq, y);
      y += 6;
    }
    doc.setFontSize(11);
    doc.text(perfil?.nombre || "", margenIzq + 34, 20);
    doc.setFontSize(10);
    doc.text(`${perfil?.correoElectronico || ""}  ${perfil?.telefono || ""}`.trim(), margenIzq + 34, 26);
    y = 46;
  } else {
    doc.setFontSize(14);
    doc.text(perfil?.nombre || "Freelancer", margenIzq, y);
    y += 6;
    doc.setFontSize(10);
    doc.text(`${perfil?.correoElectronico || ""}  ${perfil?.telefono || ""}`.trim(), margenIzq, y);
    y += 12;
  }

  // Número de cotización y fechas
  doc.setFontSize(12);
  doc.text(`Cotización ${cotizacion.numero}`, margenIzq, y);
  y += 6;
  doc.setFontSize(10);
  doc.text(`Fecha de emisión: ${formatoFecha.format(new Date(cotizacion.fechaEmision))}`, margenIzq, y);
  y += 5;
  doc.text(`Válida hasta: ${formatoFecha.format(new Date(cotizacion.fechaValidez))}`, margenIzq, y);
  y += 10;

  // Cliente
  doc.setFontSize(11);
  doc.text("Cliente", margenIzq, y);
  y += 5;
  doc.setFontSize(10);
  doc.text(cliente?.nombre || "", margenIzq, y);
  y += 5;
  doc.text(`${cliente?.correoElectronico || ""}  ${cliente?.telefono || ""}`.trim(), margenIzq, y);
  y += 10;

  // Tabla de líneas
  const columnas = [
    { titulo: "Descripción", x: margenIzq, ancho: 88 },
    { titulo: "Cant.", x: margenIzq + 92, ancho: 15 },
    { titulo: "Precio unit.", x: margenIzq + 112, ancho: 33 },
    { titulo: "Importe", x: margenIzq + 150, ancho: 32 },
  ];
  doc.setFontSize(10);
  doc.setFont(undefined, "bold");
  columnas.forEach((columna) => doc.text(columna.titulo, columna.x, y));
  doc.setFont(undefined, "normal");
  y += 2;
  doc.line(margenIzq, y, margenIzq + anchoTabla, y);
  y += 6;

  cotizacion.lineas.forEach((linea) => {
    const importe = calcularImporteLinea(linea.cantidad, linea.precioUnitario);
    doc.text(String(linea.descripcion), columnas[0].x, y, { maxWidth: columnas[0].ancho });
    doc.text(String(linea.cantidad), columnas[1].x, y);
    doc.text(formatoMoneda.format(linea.precioUnitario), columnas[2].x, y);
    doc.text(formatoMoneda.format(importe), columnas[3].x, y);
    y += 7;
  });

  y += 3;
  doc.line(margenIzq, y, margenIzq + anchoTabla, y);
  y += 8;

  // Desglose final
  const filas = [
    ["Base imponible", cotizacion.baseImponible, false],
    ["IVA (16%)", cotizacion.iva, false],
    ["Total a pagar", cotizacion.total, true],
  ];
  filas.forEach(([etiqueta, monto, esTotal]) => {
    doc.setFontSize(esTotal ? 12 : 10);
    doc.setFont(undefined, esTotal ? "bold" : "normal");
    doc.text(etiqueta, margenIzq + 112, y);
    doc.text(formatoMoneda.format(monto), margenIzq + 150, y);
    y += 7;
  });
  doc.setFont(undefined, "normal");

  return doc;
}

export function descargarPdfCotizacion(cotizacion, cliente) {
  const doc = generarPdfCotizacion(cotizacion, cliente);
  doc.save(`${cotizacion.numero}.pdf`);
}
