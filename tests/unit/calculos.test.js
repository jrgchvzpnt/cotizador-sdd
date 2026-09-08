import { test } from "node:test";
import assert from "node:assert/strict";
import {
  redondear,
  calcularImporteLinea,
  calcularBaseImponible,
  calcularIVA,
  calcularTotal,
} from "../../src/models/calculos.js";

test("redondear aplica mitad hacia arriba a 2 decimales", () => {
  assert.equal(redondear(2.345), 2.35);
  assert.equal(redondear(2.344), 2.34);
  assert.equal(redondear(0), 0);
});

test("calcularImporteLinea multiplica cantidad por precio unitario y redondea", () => {
  assert.equal(calcularImporteLinea(1, 1500), 1500);
  assert.equal(calcularImporteLinea(3, 0.1), 0.3);
});

test("el ejemplo de referencia de la spec cuadra al centavo", () => {
  const lineas = [
    { cantidad: 1, precioUnitario: 1500 },
    { cantidad: 1, precioUnitario: 500 },
  ];
  const base = calcularBaseImponible(lineas);
  const iva = calcularIVA(base);
  const total = calcularTotal(base, iva);

  assert.equal(base, 2000);
  assert.equal(iva, 320);
  assert.equal(total, 2320);
});

test("calcularBaseImponible sin líneas es 0", () => {
  assert.equal(calcularBaseImponible([]), 0);
});
