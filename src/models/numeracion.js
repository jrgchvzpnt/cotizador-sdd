// Numeración automática de cotizaciones. Ver data-model.md, sección "Numeración automática".
// Formato AAAA-NNN; el contador reinicia en 001 cada año y nunca se edita a mano.

export function siguienteNumero(fechaEmision, contadorAnual) {
  const anio = fechaEmision.getFullYear();
  const anterior = contadorAnual[anio] || 0;
  const siguiente = anterior + 1;
  const numero = `${anio}-${String(siguiente).padStart(3, "0")}`;
  const contador = { ...contadorAnual, [anio]: siguiente };
  return { numero, contador };
}
