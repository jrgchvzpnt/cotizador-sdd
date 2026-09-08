// Vista "Mis Cotizaciones" (FR-013): lista, abrir un borrador o crear una nueva.
import { listarCotizaciones } from "../models/cotizaciones.js";
import { buscarClientePorId } from "../models/clientes.js";
import { registrarVista, navegarA } from "../router.js";

const formatoMoneda = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

export function renderListaCotizaciones() {
  const contenedor = document.createElement("div");

  const tarjetaAcciones = document.createElement("div");
  tarjetaAcciones.className = "tarjeta";
  const h2 = document.createElement("h2");
  h2.textContent = "Mis Cotizaciones";
  tarjetaAcciones.appendChild(h2);

  const btnNueva = document.createElement("button");
  btnNueva.className = "primario";
  btnNueva.textContent = "Nueva cotización";
  btnNueva.addEventListener("click", () => navegarA("cotizacion"));
  tarjetaAcciones.appendChild(btnNueva);
  contenedor.appendChild(tarjetaAcciones);

  const cotizaciones = listarCotizaciones().slice().sort((a, b) => (a.numero < b.numero ? 1 : -1));

  const tarjetaLista = document.createElement("div");
  tarjetaLista.className = "tarjeta";

  if (cotizaciones.length === 0) {
    const p = document.createElement("p");
    p.textContent = "Todavía no has creado ninguna cotización. Crea la primera con el botón de arriba.";
    tarjetaLista.appendChild(p);
  } else {
    const lista = document.createElement("ul");
    lista.className = "lista-simple";
    cotizaciones.forEach((cotizacion) => {
      const cliente = buscarClientePorId(cotizacion.clienteId);
      const item = document.createElement("li");

      const encabezado = document.createElement("div");
      encabezado.innerHTML = "";
      const numero = document.createElement("strong");
      numero.textContent = cotizacion.numero;
      encabezado.appendChild(numero);
      encabezado.appendChild(document.createTextNode(` — ${cliente?.nombre || "(sin cliente)"} — ${formatoMoneda.format(cotizacion.total)} `));

      const estado = document.createElement("span");
      estado.className = `etiqueta-estado ${cotizacion.pdfGenerado ? "generada" : "borrador"}`;
      estado.textContent = cotizacion.pdfGenerado ? "Generada" : "Borrador";
      encabezado.appendChild(estado);
      item.appendChild(encabezado);

      const btnAbrir = document.createElement("button");
      btnAbrir.textContent = cotizacion.pdfGenerado ? "Ver" : "Continuar editando";
      btnAbrir.addEventListener("click", () => navegarA("cotizacion", { cotizacionId: cotizacion.id }));
      const fila = document.createElement("div");
      fila.className = "fila-acciones";
      fila.appendChild(btnAbrir);
      item.appendChild(fila);

      lista.appendChild(item);
    });
    tarjetaLista.appendChild(lista);
  }

  contenedor.appendChild(tarjetaLista);
  return contenedor;
}

registrarVista("cotizaciones", renderListaCotizaciones);
