// Cotizaciones: borrador editable hasta que se genera su PDF (FR-012).
// Ver data-model.md, entidades "Cotización" y "Línea de Cotización".
import {
  getCotizaciones,
  setCotizaciones,
  getContadorAnual,
  setContadorAnual,
  generarId,
} from "../storage/store.js";
import { siguienteNumero } from "./numeracion.js";
import { calcularBaseImponible, calcularIVA, calcularTotal } from "./calculos.js";

const DIAS_VALIDEZ = 30;

function calcularFechaValidez(fechaEmisionISO) {
  const fecha = new Date(fechaEmisionISO);
  fecha.setDate(fecha.getDate() + DIAS_VALIDEZ);
  return fecha.toISOString();
}

function recalcularTotales(cotizacion) {
  const baseImponible = calcularBaseImponible(cotizacion.lineas);
  const iva = calcularIVA(baseImponible);
  const total = calcularTotal(baseImponible, iva);
  return { ...cotizacion, baseImponible, iva, total };
}

function requerirBorrador(cotizacion) {
  if (cotizacion.pdfGenerado) {
    throw new Error(
      "Esta cotización ya fue generada y no se puede editar. Crea una cotización nueva para reflejar el cambio."
    );
  }
}

export function listarCotizaciones() {
  return getCotizaciones();
}

export function obtenerCotizacion(id) {
  return getCotizaciones().find((cotizacion) => cotizacion.id === id) || null;
}

export function crearBorrador(clienteId) {
  const ahora = new Date();
  const { numero, contador } = siguienteNumero(ahora, getContadorAnual());
  const cotizacion = recalcularTotales({
    id: generarId(),
    numero,
    clienteId,
    fechaEmision: ahora.toISOString(),
    fechaValidez: calcularFechaValidez(ahora.toISOString()),
    lineas: [],
    pdfGenerado: false,
  });
  setContadorAnual(contador);
  setCotizaciones([...getCotizaciones(), cotizacion]);
  return cotizacion;
}

function actualizar(id, transformar) {
  const cotizaciones = getCotizaciones();
  const indice = cotizaciones.findIndex((cotizacion) => cotizacion.id === id);
  if (indice === -1) throw new Error("La cotización no existe.");
  requerirBorrador(cotizaciones[indice]);
  const actualizada = recalcularTotales(transformar(cotizaciones[indice]));
  cotizaciones[indice] = actualizada;
  setCotizaciones(cotizaciones);
  return actualizada;
}

export function agregarLinea(cotizacionId, { descripcion, cantidad, precioUnitario, origen = "manual", servicioId = null }) {
  return actualizar(cotizacionId, (cotizacion) => ({
    ...cotizacion,
    lineas: [
      ...cotizacion.lineas,
      { id: generarId(), descripcion, cantidad, precioUnitario, origen, servicioId },
    ],
  }));
}

export function editarLinea(cotizacionId, lineaId, cambios) {
  return actualizar(cotizacionId, (cotizacion) => ({
    ...cotizacion,
    lineas: cotizacion.lineas.map((linea) => (linea.id === lineaId ? { ...linea, ...cambios } : linea)),
  }));
}

export function eliminarLinea(cotizacionId, lineaId) {
  return actualizar(cotizacionId, (cotizacion) => ({
    ...cotizacion,
    lineas: cotizacion.lineas.filter((linea) => linea.id !== lineaId),
  }));
}

export function cambiarCliente(cotizacionId, clienteId) {
  return actualizar(cotizacionId, (cotizacion) => ({ ...cotizacion, clienteId }));
}

export function puedeGenerarPdf(cotizacion) {
  return cotizacion.lineas.length > 0;
}

export function marcarPdfGenerado(cotizacionId) {
  const cotizaciones = getCotizaciones();
  const indice = cotizaciones.findIndex((cotizacion) => cotizacion.id === cotizacionId);
  if (indice === -1) throw new Error("La cotización no existe.");
  cotizaciones[indice] = { ...cotizaciones[indice], pdfGenerado: true };
  setCotizaciones(cotizaciones);
  return cotizaciones[indice];
}
