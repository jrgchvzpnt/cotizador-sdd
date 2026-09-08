// Registro de vistas y navegación. Vive aparte de app.js para que las vistas
// puedan importar `registrarVista`/`navegarA` sin crear una dependencia circular
// con app.js (que a su vez importa las vistas).
const vistas = {};
let vistaActual = "cotizaciones";
let datosVistaActual;
let alCambiar = () => {};

export function registrarVista(nombre, render) {
  vistas[nombre] = render;
}

export function obtenerVista(nombre) {
  return vistas[nombre];
}

export function navegarA(nombre, datos) {
  vistaActual = nombre;
  datosVistaActual = datos;
  alCambiar();
}

export function vistaActualInfo() {
  return { nombre: vistaActual, datos: datosVistaActual };
}

export function alCambiarVista(fn) {
  alCambiar = fn;
}
