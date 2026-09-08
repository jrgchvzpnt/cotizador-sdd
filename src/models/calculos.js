// Funciones puras de cálculo de dinero. Ver data-model.md, sección "Reglas de cálculo".

const TASA_IVA = 0.16;

export function redondear(valor) {
  // Mitad hacia arriba a 2 decimales (evita el sesgo de punto flotante de toFixed).
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

export function calcularImporteLinea(cantidad, precioUnitario) {
  return redondear(cantidad * precioUnitario);
}

export function calcularBaseImponible(lineas) {
  const suma = lineas.reduce(
    (acumulado, linea) => acumulado + calcularImporteLinea(linea.cantidad, linea.precioUnitario),
    0
  );
  return redondear(suma);
}

export function calcularIVA(baseImponible, tasa = TASA_IVA) {
  return redondear(baseImponible * tasa);
}

export function calcularTotal(baseImponible, iva) {
  return redondear(baseImponible + iva);
}
