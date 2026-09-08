// Vista "Mi Perfil". Ver spec.md, Historia 2.
import { obtenerPerfil, guardarPerfil } from "../models/perfil.js";
import { registrarVista } from "../router.js";

function campo(etiquetaTexto, input) {
  const contenedor = document.createElement("div");
  contenedor.className = "campo";
  const etiqueta = document.createElement("label");
  etiqueta.textContent = etiquetaTexto;
  contenedor.appendChild(etiqueta);
  contenedor.appendChild(input);
  return contenedor;
}

function leerArchivoComoDataUrl(archivo) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result);
    lector.onerror = reject;
    lector.readAsDataURL(archivo);
  });
}

export function renderPerfil() {
  const raiz = document.createElement("div");
  let mensaje = "";
  let logoActual = obtenerPerfil()?.logo || null;

  function repintar() {
    raiz.innerHTML = "";
    raiz.appendChild(construir());
  }

  function construir() {
    const perfil = obtenerPerfil();
    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta";

    const h2 = document.createElement("h2");
    h2.textContent = "Mi Perfil";
    tarjeta.appendChild(h2);

    if (mensaje) {
      const aviso = document.createElement("div");
      aviso.className = "aviso info";
      aviso.textContent = mensaje;
      tarjeta.appendChild(aviso);
    }

    const inputNombre = document.createElement("input");
    inputNombre.type = "text";
    inputNombre.value = perfil?.nombre || "";
    tarjeta.appendChild(campo("Nombre", inputNombre));

    const inputCorreo = document.createElement("input");
    inputCorreo.type = "email";
    inputCorreo.value = perfil?.correoElectronico || "";
    tarjeta.appendChild(campo("Correo electrónico", inputCorreo));

    const inputTelefono = document.createElement("input");
    inputTelefono.type = "tel";
    inputTelefono.value = perfil?.telefono || "";
    tarjeta.appendChild(campo("Teléfono", inputTelefono));

    if (logoActual) {
      const previa = document.createElement("img");
      previa.src = logoActual;
      previa.alt = "Logo actual";
      previa.style.maxWidth = "120px";
      previa.style.display = "block";
      previa.style.marginBottom = "8px";
      tarjeta.appendChild(previa);
    }

    const inputLogo = document.createElement("input");
    inputLogo.type = "file";
    inputLogo.accept = "image/png,image/jpeg";
    inputLogo.addEventListener("change", async () => {
      const archivo = inputLogo.files[0];
      if (archivo) {
        logoActual = await leerArchivoComoDataUrl(archivo);
      }
    });
    tarjeta.appendChild(campo("Logo (opcional)", inputLogo));

    if (logoActual) {
      const btnQuitar = document.createElement("button");
      btnQuitar.textContent = "Quitar logo";
      btnQuitar.addEventListener("click", () => {
        logoActual = null;
        repintar();
      });
      tarjeta.appendChild(btnQuitar);
    }

    const btnGuardar = document.createElement("button");
    btnGuardar.className = "primario";
    btnGuardar.textContent = "Guardar perfil";
    btnGuardar.addEventListener("click", () => {
      const nombre = inputNombre.value.trim();
      const correoElectronico = inputCorreo.value.trim();
      const telefono = inputTelefono.value.trim();
      if (!nombre || !correoElectronico || !telefono) {
        mensaje = "Completa nombre, correo y teléfono antes de guardar.";
        repintar();
        return;
      }
      guardarPerfil({ nombre, correoElectronico, telefono, logo: logoActual });
      mensaje = "Perfil guardado. Tus próximas cotizaciones saldrán con estos datos.";
      repintar();
    });
    tarjeta.appendChild(btnGuardar);

    return tarjeta;
  }

  repintar();
  return raiz;
}

registrarVista("perfil", renderPerfil);
