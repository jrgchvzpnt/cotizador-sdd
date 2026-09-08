// Acceso a localStorage. Ver contracts/storage-schema.md para el formato de cada clave.
// Sin servidor ni base de datos: todo vive en el navegador del freelancer.

const CLAVES = {
  perfil: "cotizador:perfil",
  servicios: "cotizador:servicios",
  clientes: "cotizador:clientes",
  cotizaciones: "cotizador:cotizaciones",
  contadorAnual: "cotizador:contadorAnual",
};

function leer(clave, porDefecto) {
  try {
    const crudo = localStorage.getItem(clave);
    if (crudo === null) return porDefecto;
    return JSON.parse(crudo);
  } catch {
    return porDefecto;
  }
}

function escribir(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}

export function getPerfil() {
  return leer(CLAVES.perfil, null);
}

export function setPerfil(perfil) {
  escribir(CLAVES.perfil, perfil);
}

export function getServicios() {
  return leer(CLAVES.servicios, []);
}

export function setServicios(servicios) {
  escribir(CLAVES.servicios, servicios);
}

export function getClientes() {
  return leer(CLAVES.clientes, []);
}

export function setClientes(clientes) {
  escribir(CLAVES.clientes, clientes);
}

export function getCotizaciones() {
  return leer(CLAVES.cotizaciones, []);
}

export function setCotizaciones(cotizaciones) {
  escribir(CLAVES.cotizaciones, cotizaciones);
}

export function getContadorAnual() {
  return leer(CLAVES.contadorAnual, {});
}

export function setContadorAnual(contador) {
  escribir(CLAVES.contadorAnual, contador);
}

export function generarId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
