// Armazón de la aplicación: navegación simple entre pantallas, sin framework ni build.
import { getPerfil, getServicios, getClientes, getCotizaciones } from "./storage/store.js";
import { registrarVista, obtenerVista, navegarA, vistaActualInfo, alCambiarVista } from "./router.js";

// Importar las vistas registra cada una en el router (efecto secundario al cargar el módulo).
import "./views/cotizacion.js";
import "./views/listaCotizaciones.js";
import "./views/perfil.js";
import "./views/catalogo.js";

function elApp() {
  return document.getElementById("app");
}

function renderShell(vistaActual) {
  const contenedor = document.createElement("div");

  const header = document.createElement("header");
  header.className = "app-header";
  const titulo = document.createElement("h1");
  titulo.textContent = "Cotizador";
  header.appendChild(titulo);
  contenedor.appendChild(header);

  const nav = document.createElement("nav");
  nav.className = "app-nav";
  const destinos = [
    { nombre: "cotizaciones", etiqueta: "Mis Cotizaciones" },
    { nombre: "catalogo", etiqueta: "Catálogo" },
    { nombre: "perfil", etiqueta: "Mi Perfil" },
  ];
  destinos.forEach(({ nombre, etiqueta }) => {
    const boton = document.createElement("button");
    boton.textContent = etiqueta;
    if (nombre === vistaActual) boton.classList.add("primario");
    boton.addEventListener("click", () => navegarA(nombre));
    nav.appendChild(boton);
  });
  contenedor.appendChild(nav);

  const contenido = document.createElement("div");
  contenido.id = "vista-actual";
  contenedor.appendChild(contenido);

  return contenedor;
}

function renderProximamente() {
  const div = document.createElement("div");
  div.className = "tarjeta";
  div.textContent = "Esta pantalla todavía no está disponible.";
  return div;
}

function renderBienvenida() {
  const div = document.createElement("div");
  div.className = "tarjeta";

  const h2 = document.createElement("h2");
  h2.textContent = "Bienvenido a Cotizador";
  div.appendChild(h2);

  const p = document.createElement("p");
  p.textContent =
    "Antes de crear tu primera cotización, configura tu perfil (nombre, correo, teléfono y logo) para que salga con tu marca. También puedes crear tu cotización primero si prefieres.";
  div.appendChild(p);

  const acciones = document.createElement("div");
  acciones.className = "fila-acciones";

  const btnPerfil = document.createElement("button");
  btnPerfil.className = "primario";
  btnPerfil.textContent = "Configurar mi perfil";
  btnPerfil.addEventListener("click", () => navegarA("perfil"));
  acciones.appendChild(btnPerfil);

  const btnCotizacion = document.createElement("button");
  btnCotizacion.textContent = "Crear mi primera cotización";
  btnCotizacion.addEventListener("click", () => navegarA("cotizacion"));
  acciones.appendChild(btnCotizacion);

  div.appendChild(acciones);
  return div;
}
registrarVista("bienvenida", renderBienvenida);

function esPrimerUso() {
  return (
    !getPerfil() &&
    getServicios().length === 0 &&
    getClientes().length === 0 &&
    getCotizaciones().length === 0
  );
}

function renderizar() {
  const { nombre, datos } = vistaActualInfo();
  const app = elApp();
  app.innerHTML = "";
  app.appendChild(renderShell(nombre));
  const contenido = document.getElementById("vista-actual");
  const render = obtenerVista(nombre) || renderProximamente;
  contenido.appendChild(render(datos));
}

function iniciar() {
  alCambiarVista(renderizar);
  navegarA(esPrimerUso() ? "bienvenida" : "cotizaciones");
}

document.addEventListener("DOMContentLoaded", iniciar);
