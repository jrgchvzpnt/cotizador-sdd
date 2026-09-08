import { test } from "node:test";
import assert from "node:assert/strict";
import { siguienteNumero } from "../../src/models/numeracion.js";

test("el primer número del año es AAAA-001", () => {
  const { numero, contador } = siguienteNumero(new Date(2026, 2, 10), {});
  assert.equal(numero, "2026-001");
  assert.deepEqual(contador, { 2026: 1 });
});

test("los números consecutivos suben de uno en uno sin saltos", () => {
  let contador = {};
  const primero = siguienteNumero(new Date(2026, 0, 5), contador);
  contador = primero.contador;
  const segundo = siguienteNumero(new Date(2026, 5, 1), contador);
  contador = segundo.contador;
  const tercero = siguienteNumero(new Date(2026, 11, 31), contador);

  assert.equal(primero.numero, "2026-001");
  assert.equal(segundo.numero, "2026-002");
  assert.equal(tercero.numero, "2026-003");
});

test("el contador reinicia en 001 al cambiar de año", () => {
  let contador = { 2026: 5 };
  const { numero } = siguienteNumero(new Date(2027, 0, 1), contador);
  assert.equal(numero, "2027-001");
});
