// Catálogo de servicios reutilizables. Ver data-model.md, entidad "Servicio".
// Editar o eliminar un servicio no afecta las líneas de cotizaciones ya creadas,
// porque una línea copia la descripción y el precio al momento de agregarse.
import { getServicios, setServicios, generarId } from "../storage/store.js";

export function listarServicios() {
  return getServicios();
}

export function crearServicio({ nombre, precioDefault }) {
  const servicio = { id: generarId(), nombre, precioDefault };
  setServicios([...getServicios(), servicio]);
  return servicio;
}

export function editarServicio(id, cambios) {
  const servicios = getServicios().map((servicio) =>
    servicio.id === id ? { ...servicio, ...cambios } : servicio
  );
  setServicios(servicios);
  return servicios.find((servicio) => servicio.id === id) || null;
}

export function eliminarServicio(id) {
  setServicios(getServicios().filter((servicio) => servicio.id !== id));
}
