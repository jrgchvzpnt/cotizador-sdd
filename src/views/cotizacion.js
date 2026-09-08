// Vista "Nueva Cotización" / edición de un borrador. Ver spec.md, Historia 1.
import { listarClientes, crearCliente, buscarClientePorId } from "../models/clientes.js";
import {
  obtenerCotizacion,
  crearBorrador,
  agregarLinea,
  editarLinea,
  eliminarLinea,
  cambiarCliente,
  puedeGenerarPdf,
  marcarPdfGenerado,
} from "../models/cotizaciones.js";
import { descargarPdfCotizacion } from "../pdf/generarPdf.js";
import { listarServicios } from "../models/servicios.js";
import { registrarVista, navegarA } from "../router.js";

const formatoMoneda = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
const formatoFecha = new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "long", year: "numeric" });

function campo(etiquetaTexto, input) {
  const contenedor = document.createElement("div");
  contenedor.className = "campo";
  const etiqueta = document.createElement("label");
  etiqueta.textContent = etiquetaTexto;
  contenedor.appendChild(etiqueta);
  contenedor.appendChild(input);
  return contenedor;
}

function aviso(texto, tipo = "info") {
  const div = document.createElement("div");
  div.className = `aviso ${tipo}`;
  div.textContent = texto;
  return div;
}

export function renderCotizacion(datos) {
  const raiz = document.createElement("div");
  let cotizacionId = datos?.cotizacionId || null;
  let mensajeError = "";
  let lineaEditandoId = null;

  function repintar() {
    raiz.innerHTML = "";
    if (!cotizacionId) {
      raiz.appendChild(renderSeleccionCliente());
    } else {
      raiz.appendChild(renderEdicion());
    }
  }

  function renderSeleccionCliente() {
    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta";

    const h2 = document.createElement("h2");
    h2.textContent = "Nueva cotización — elige un cliente";
    tarjeta.appendChild(h2);

    if (mensajeError) tarjeta.appendChild(aviso(mensajeError, "error"));

    const clientes = listarClientes();
    if (clientes.length > 0) {
      const select = document.createElement("select");
      const opcionVacia = document.createElement("option");
      opcionVacia.value = "";
      opcionVacia.textContent = "-- Elegir cliente guardado --";
      select.appendChild(opcionVacia);
      clientes.forEach((cliente) => {
        const opcion = document.createElement("option");
        opcion.value = cliente.id;
        opcion.textContent = cliente.nombre;
        select.appendChild(opcion);
      });
      tarjeta.appendChild(campo("Cliente guardado", select));

      const btnContinuar = document.createElement("button");
      btnContinuar.className = "primario";
      btnContinuar.textContent = "Continuar con este cliente";
      btnContinuar.addEventListener("click", () => {
        if (!select.value) {
          mensajeError = "Elige un cliente de la lista o crea uno nuevo abajo.";
          repintar();
          return;
        }
        const nueva = crearBorrador(select.value);
        cotizacionId = nueva.id;
        mensajeError = "";
        repintar();
      });
      tarjeta.appendChild(btnContinuar);
    }

    const hr = document.createElement("hr");
    tarjeta.appendChild(hr);

    const h3 = document.createElement("h3");
    h3.textContent = "O da de alta un cliente nuevo";
    tarjeta.appendChild(h3);

    const inputNombre = document.createElement("input");
    inputNombre.type = "text";
    inputNombre.placeholder = "Nombre del cliente";
    tarjeta.appendChild(campo("Nombre", inputNombre));

    const inputCorreo = document.createElement("input");
    inputCorreo.type = "email";
    inputCorreo.placeholder = "correo@ejemplo.com";
    tarjeta.appendChild(campo("Correo electrónico", inputCorreo));

    const inputTelefono = document.createElement("input");
    inputTelefono.type = "tel";
    inputTelefono.placeholder = "55 1234 5678";
    tarjeta.appendChild(campo("Teléfono", inputTelefono));

    const btnCrear = document.createElement("button");
    btnCrear.className = "primario";
    btnCrear.textContent = "Crear cliente y continuar";
    btnCrear.addEventListener("click", () => {
      const nombre = inputNombre.value.trim();
      const correoElectronico = inputCorreo.value.trim();
      const telefono = inputTelefono.value.trim();
      if (!nombre || !correoElectronico || !telefono) {
        mensajeError = "Completa nombre, correo y teléfono del cliente nuevo.";
        repintar();
        return;
      }
      const cliente = crearCliente({ nombre, correoElectronico, telefono });
      const nueva = crearBorrador(cliente.id);
      cotizacionId = nueva.id;
      mensajeError = "";
      repintar();
    });
    tarjeta.appendChild(btnCrear);

    return tarjeta;
  }

  function renderEdicion() {
    const cotizacion = obtenerCotizacion(cotizacionId);
    if (!cotizacion) {
      cotizacionId = null;
      return renderSeleccionCliente();
    }
    const cliente = buscarClientePorId(cotizacion.clienteId);
    const contenedor = document.createElement("div");

    const tarjetaInfo = document.createElement("div");
    tarjetaInfo.className = "tarjeta";
    const h2 = document.createElement("h2");
    h2.textContent = `Cotización ${cotizacion.numero}`;
    tarjetaInfo.appendChild(h2);

    const estado = document.createElement("span");
    estado.className = `etiqueta-estado ${cotizacion.pdfGenerado ? "generada" : "borrador"}`;
    estado.textContent = cotizacion.pdfGenerado ? "Generada" : "Borrador";
    tarjetaInfo.appendChild(estado);

    const pCliente = document.createElement("p");
    pCliente.textContent = `Cliente: ${cliente?.nombre || "(sin datos)"}`;
    tarjetaInfo.appendChild(pCliente);

    const pFechas = document.createElement("p");
    pFechas.textContent = `Emisión: ${formatoFecha.format(new Date(cotizacion.fechaEmision))} · Válida hasta: ${formatoFecha.format(new Date(cotizacion.fechaValidez))}`;
    tarjetaInfo.appendChild(pFechas);

    if (cotizacion.pdfGenerado) {
      tarjetaInfo.appendChild(
        aviso("Esta cotización ya fue generada y está bloqueada. Crea una cotización nueva para reflejar cualquier cambio.", "info")
      );
    } else {
      const clientes = listarClientes();
      if (clientes.length > 1) {
        const selectCliente = document.createElement("select");
        clientes.forEach((c) => {
          const opcion = document.createElement("option");
          opcion.value = c.id;
          opcion.textContent = c.nombre;
          if (c.id === cotizacion.clienteId) opcion.selected = true;
          selectCliente.appendChild(opcion);
        });
        selectCliente.addEventListener("change", () => {
          cambiarCliente(cotizacion.id, selectCliente.value);
          repintar();
        });
        tarjetaInfo.appendChild(campo("Cambiar cliente", selectCliente));
      }
    }
    contenedor.appendChild(tarjetaInfo);

    if (mensajeError) contenedor.appendChild(aviso(mensajeError, "error"));

    if (!cotizacion.pdfGenerado) {
      if (listarServicios().length > 0) {
        contenedor.appendChild(renderFormularioDesdeCatalogo(cotizacion));
      }
      contenedor.appendChild(renderFormularioLinea(cotizacion));
    }

    contenedor.appendChild(renderTablaLineas(cotizacion));

    const acciones = document.createElement("div");
    acciones.className = "fila-acciones";

    const btnPdf = document.createElement("button");
    btnPdf.className = "primario";
    btnPdf.textContent = cotizacion.pdfGenerado ? "Descargar PDF de nuevo" : "Descargar PDF";
    const sinLineas = !puedeGenerarPdf(cotizacion);
    btnPdf.disabled = sinLineas;
    btnPdf.addEventListener("click", () => {
      if (sinLineas) return;
      descargarPdfCotizacion(cotizacion, cliente);
      if (!cotizacion.pdfGenerado) marcarPdfGenerado(cotizacion.id);
      repintar();
    });
    acciones.appendChild(btnPdf);

    if (sinLineas) {
      acciones.appendChild(aviso("Agrega al menos una línea para poder descargar el PDF.", "error"));
    }

    const btnNueva = document.createElement("button");
    btnNueva.textContent = "Crear otra cotización";
    btnNueva.addEventListener("click", () => navegarA("cotizacion"));
    acciones.appendChild(btnNueva);

    contenedor.appendChild(acciones);
    return contenedor;
  }

  function renderFormularioDesdeCatalogo(cotizacion) {
    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta";
    const h3 = document.createElement("h3");
    h3.textContent = "Agregar desde catálogo";
    tarjeta.appendChild(h3);

    const servicios = listarServicios();
    const select = document.createElement("select");
    servicios.forEach((servicio) => {
      const opcion = document.createElement("option");
      opcion.value = servicio.id;
      opcion.textContent = `${servicio.nombre} — ${formatoMoneda.format(servicio.precioDefault)}`;
      select.appendChild(opcion);
    });
    tarjeta.appendChild(campo("Servicio", select));

    const btnAgregar = document.createElement("button");
    btnAgregar.className = "primario";
    btnAgregar.textContent = "Agregar línea desde catálogo";
    btnAgregar.addEventListener("click", () => {
      const servicio = servicios.find((s) => s.id === select.value);
      if (!servicio) return;
      // Se copian descripción y precio; la línea queda independiente del catálogo (Historia 3, escenario 2).
      agregarLinea(cotizacion.id, {
        descripcion: servicio.nombre,
        cantidad: 1,
        precioUnitario: servicio.precioDefault,
        origen: "catalogo",
        servicioId: servicio.id,
      });
      repintar();
    });
    tarjeta.appendChild(btnAgregar);

    return tarjeta;
  }

  function renderFormularioLinea(cotizacion) {
    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta";
    const h3 = document.createElement("h3");
    h3.textContent = "Agregar línea";
    tarjeta.appendChild(h3);

    const inputDescripcion = document.createElement("input");
    inputDescripcion.type = "text";
    inputDescripcion.placeholder = "Descripción del trabajo";
    tarjeta.appendChild(campo("Descripción", inputDescripcion));

    const inputCantidad = document.createElement("input");
    inputCantidad.type = "number";
    inputCantidad.min = "0.01";
    inputCantidad.step = "0.01";
    inputCantidad.value = "1";
    tarjeta.appendChild(campo("Cantidad", inputCantidad));

    const inputPrecio = document.createElement("input");
    inputPrecio.type = "number";
    inputPrecio.min = "0";
    inputPrecio.step = "0.01";
    inputPrecio.placeholder = "0.00";
    tarjeta.appendChild(campo("Precio unitario (MXN)", inputPrecio));

    const btnAgregar = document.createElement("button");
    btnAgregar.className = "primario";
    btnAgregar.textContent = "Agregar línea";
    btnAgregar.addEventListener("click", () => {
      const descripcion = inputDescripcion.value.trim();
      const cantidad = Number(inputCantidad.value);
      const precioUnitario = Number(inputPrecio.value);
      if (!descripcion || !(cantidad > 0) || !(precioUnitario >= 0)) {
        mensajeError = "Escribe una descripción, una cantidad mayor a 0 y un precio válido.";
        repintar();
        return;
      }
      agregarLinea(cotizacion.id, { descripcion, cantidad, precioUnitario, origen: "manual" });
      mensajeError = "";
      repintar();
    });
    tarjeta.appendChild(btnAgregar);

    return tarjeta;
  }

  function renderTablaLineas(cotizacion) {
    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta";

    if (cotizacion.lineas.length === 0) {
      tarjeta.appendChild(aviso("Todavía no hay líneas en esta cotización.", "info"));
      return tarjeta;
    }

    const scroll = document.createElement("div");
    scroll.className = "tabla-scroll";
    const tabla = document.createElement("table");
    const encabezado = document.createElement("tr");
    ["Descripción", "Cant.", "Precio unit.", "Importe", ""].forEach((texto) => {
      const th = document.createElement("th");
      th.textContent = texto;
      encabezado.appendChild(th);
    });
    tabla.appendChild(encabezado);

    cotizacion.lineas.forEach((linea) => {
      if (!cotizacion.pdfGenerado && lineaEditandoId === linea.id) {
        tabla.appendChild(construirFilaEdicion(cotizacion, linea));
        return;
      }

      const fila = document.createElement("tr");
      const importe = linea.cantidad * linea.precioUnitario;
      [linea.descripcion, linea.cantidad, formatoMoneda.format(linea.precioUnitario), formatoMoneda.format(importe)].forEach((valor) => {
        const td = document.createElement("td");
        td.textContent = valor;
        fila.appendChild(td);
      });
      const tdAcciones = document.createElement("td");
      if (!cotizacion.pdfGenerado) {
        const btnEditar = document.createElement("button");
        btnEditar.textContent = "Editar";
        btnEditar.addEventListener("click", () => {
          lineaEditandoId = linea.id;
          repintar();
        });
        tdAcciones.appendChild(btnEditar);

        const btnEliminar = document.createElement("button");
        btnEliminar.textContent = "Eliminar";
        btnEliminar.addEventListener("click", () => {
          eliminarLinea(cotizacion.id, linea.id);
          repintar();
        });
        tdAcciones.appendChild(btnEliminar);
      }
      fila.appendChild(tdAcciones);
      tabla.appendChild(fila);
    });
    scroll.appendChild(tabla);
    tarjeta.appendChild(scroll);

    const totales = document.createElement("div");
    totales.className = "totales";
    totales.appendChild(renderLineaTotal("Base imponible", cotizacion.baseImponible));
    totales.appendChild(renderLineaTotal("IVA (16%)", cotizacion.iva));
    const total = renderLineaTotal("Total a pagar", cotizacion.total);
    total.classList.add("total");
    totales.appendChild(total);
    tarjeta.appendChild(totales);

    return tarjeta;
  }

  function construirFilaEdicion(cotizacion, linea) {
    const fila = document.createElement("tr");

    const tdDescripcion = document.createElement("td");
    const inputDescripcion = document.createElement("input");
    inputDescripcion.type = "text";
    inputDescripcion.value = linea.descripcion;
    tdDescripcion.appendChild(inputDescripcion);
    fila.appendChild(tdDescripcion);

    const tdCantidad = document.createElement("td");
    const inputCantidad = document.createElement("input");
    inputCantidad.type = "number";
    inputCantidad.min = "0.01";
    inputCantidad.step = "0.01";
    inputCantidad.value = String(linea.cantidad);
    tdCantidad.appendChild(inputCantidad);
    fila.appendChild(tdCantidad);

    const tdPrecio = document.createElement("td");
    const inputPrecio = document.createElement("input");
    inputPrecio.type = "number";
    inputPrecio.min = "0";
    inputPrecio.step = "0.01";
    inputPrecio.value = String(linea.precioUnitario);
    tdPrecio.appendChild(inputPrecio);
    fila.appendChild(tdPrecio);

    fila.appendChild(document.createElement("td")); // el importe se recalcula al guardar

    const tdAcciones = document.createElement("td");
    const btnGuardar = document.createElement("button");
    btnGuardar.className = "primario";
    btnGuardar.textContent = "Guardar";
    btnGuardar.addEventListener("click", () => {
      const descripcion = inputDescripcion.value.trim();
      const cantidad = Number(inputCantidad.value);
      const precioUnitario = Number(inputPrecio.value);
      if (!descripcion || !(cantidad > 0) || !(precioUnitario >= 0)) {
        mensajeError = "Escribe una descripción, una cantidad mayor a 0 y un precio válido.";
        repintar();
        return;
      }
      editarLinea(cotizacion.id, linea.id, { descripcion, cantidad, precioUnitario });
      lineaEditandoId = null;
      mensajeError = "";
      repintar();
    });
    tdAcciones.appendChild(btnGuardar);

    const btnCancelar = document.createElement("button");
    btnCancelar.textContent = "Cancelar";
    btnCancelar.addEventListener("click", () => {
      lineaEditandoId = null;
      repintar();
    });
    tdAcciones.appendChild(btnCancelar);

    fila.appendChild(tdAcciones);
    return fila;
  }

  function renderLineaTotal(etiqueta, monto) {
    const p = document.createElement("p");
    p.textContent = `${etiqueta}: ${formatoMoneda.format(monto)}`;
    return p;
  }

  repintar();
  return raiz;
}

registrarVista("cotizacion", renderCotizacion);
