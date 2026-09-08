// Clientes reutilizables. Ver data-model.md, entidad "Cliente".
// Sin pantalla de edición/eliminación en esta v0 (ver Assumptions de la spec):
// un cliente se crea una vez y queda disponible para elegirse en futuras cotizaciones.
import { getClientes, setClientes, generarId } from "../storage/store.js";

export function listarClientes() {
  return getClientes();
}

export function buscarClientePorId(id) {
  return getClientes().find((cliente) => cliente.id === id) || null;
}

export function crearCliente({ nombre, correoElectronico, telefono }) {
  const cliente = {
    id: generarId(),
    nombre,
    correoElectronico,
    telefono,
  };
  setClientes([...getClientes(), cliente]);
  return cliente;
}
