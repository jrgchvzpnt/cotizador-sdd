// Vista "Catálogo de Servicios". Ver spec.md, Historia 3.
import { listarServicios, crearServicio, editarServicio, eliminarServicio } from "../models/servicios.js";
import { registrarVista } from "../router.js";

const formatoMoneda = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

function campo(etiquetaTexto, input) {
  const contenedor = document.createElement("div");
  contenedor.className = "campo";
  const etiqueta = document.createElement("label");
  etiqueta.textContent = etiquetaTexto;
  contenedor.appendChild(etiqueta);
  contenedor.appendChild(input);
  return contenedor;
}

export function renderCatalogo() {
  const raiz = document.createElement("div");
  let mensajeError = "";
  let editandoId = null;

  function repintar() {
    raiz.innerHTML = "";
    raiz.appendChild(construirFormulario());
    raiz.appendChild(construirLista());
  }

  function construirFormulario() {
    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta";

    const servicioEditado = editandoId ? listarServicios().find((s) => s.id === editandoId) : null;

    const h2 = document.createElement("h2");
    h2.textContent = servicioEditado ? "Editar servicio" : "Nuevo servicio";
    tarjeta.appendChild(h2);

    if (mensajeError) {
      const aviso = document.createElement("div");
      aviso.className = "aviso error";
      aviso.textContent = mensajeError;
      tarjeta.appendChild(aviso);
    }

    const inputNombre = document.createElement("input");
    inputNombre.type = "text";
    inputNombre.placeholder = "Ej. Diseño de logotipo";
    inputNombre.value = servicioEditado?.nombre || "";
    tarjeta.appendChild(campo("Nombre del servicio", inputNombre));

    const inputPrecio = document.createElement("input");
    inputPrecio.type = "number";
    inputPrecio.min = "0";
    inputPrecio.step = "0.01";
    inputPrecio.placeholder = "0.00";
    inputPrecio.value = servicioEditado ? String(servicioEditado.precioDefault) : "";
    tarjeta.appendChild(campo("Precio por defecto (MXN)", inputPrecio));

    const btnGuardar = document.createElement("button");
    btnGuardar.className = "primario";
    btnGuardar.textContent = servicioEditado ? "Guardar cambios" : "Agregar servicio";
    btnGuardar.addEventListener("click", () => {
      const nombre = inputNombre.value.trim();
      const precioDefault = Number(inputPrecio.value);
      if (!nombre || !(precioDefault >= 0)) {
        mensajeError = "Escribe un nombre y un precio válido (0 o mayor).";
        repintar();
        return;
      }
      if (servicioEditado) {
        editarServicio(servicioEditado.id, { nombre, precioDefault });
      } else {
        crearServicio({ nombre, precioDefault });
      }
      mensajeError = "";
      editandoId = null;
      repintar();
    });
    tarjeta.appendChild(btnGuardar);

    if (servicioEditado) {
      const btnCancelar = document.createElement("button");
      btnCancelar.textContent = "Cancelar";
      btnCancelar.addEventListener("click", () => {
        editandoId = null;
        mensajeError = "";
        repintar();
      });
      tarjeta.appendChild(btnCancelar);
    }

    return tarjeta;
  }

  function construirLista() {
    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta";

    const h2 = document.createElement("h2");
    h2.textContent = "Servicios guardados";
    tarjeta.appendChild(h2);

    const servicios = listarServicios();
    if (servicios.length === 0) {
      const p = document.createElement("p");
      p.textContent = "Todavía no has agregado ningún servicio.";
      tarjeta.appendChild(p);
      return tarjeta;
    }

    const lista = document.createElement("ul");
    lista.className = "lista-simple";
    servicios.forEach((servicio) => {
      const item = document.createElement("li");
      const texto = document.createElement("div");
      texto.textContent = `${servicio.nombre} — ${formatoMoneda.format(servicio.precioDefault)}`;
      item.appendChild(texto);

      const fila = document.createElement("div");
      fila.className = "fila-acciones";

      const btnEditar = document.createElement("button");
      btnEditar.textContent = "Editar";
      btnEditar.addEventListener("click", () => {
        editandoId = servicio.id;
        repintar();
      });
      fila.appendChild(btnEditar);

      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "Eliminar";
      btnEliminar.addEventListener("click", () => {
        eliminarServicio(servicio.id);
        repintar();
      });
      fila.appendChild(btnEliminar);

      item.appendChild(fila);
      lista.appendChild(item);
    });
    tarjeta.appendChild(lista);

    return tarjeta;
  }

  repintar();
  return raiz;
}

registrarVista("catalogo", renderCatalogo);
