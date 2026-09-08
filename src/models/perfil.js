// Perfil del freelancer: un único registro por instalación. Ver data-model.md.
import { getPerfil, setPerfil } from "../storage/store.js";

export function obtenerPerfil() {
  return getPerfil();
}

export function guardarPerfil({ nombre, correoElectronico, telefono, logo }) {
  const perfil = { nombre, correoElectronico, telefono, logo: logo || null };
  setPerfil(perfil);
  return perfil;
}
