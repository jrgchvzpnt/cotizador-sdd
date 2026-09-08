# Quickstart: Validar Cotizaciones en PDF para Freelancers

Esta guía permite comprobar que la aplicación cumple la spec **usándola directamente**,
sin leer código (Principio IV de la constitución). Sirve tanto para probarla en la
computadora del desarrollador como ya publicada en línea.

## Requisitos previos

- Un navegador web moderno (de escritorio o de celular).
- El backend corriendo (Java 25 + Spring Boot): en desarrollo, `./mvnw spring-boot:run`
  desde `backend/`; en producción, el JAR ejecutable ya construido. El backend sirve
  también el frontend compilado, así que basta con abrir la URL que expone (por defecto
  `http://localhost:8080`).
- Si se trabaja el frontend por separado durante el desarrollo (`ng serve` en
  `frontend/`), debe apuntar al backend local para las llamadas a la API.
- No se requiere ninguna cuenta ni contraseña. La base de datos (H2 embebida) la crea el
  propio backend automáticamente la primera vez que se ejecuta.

## Escenario 1 — Crear y descargar una cotización (Historia 1, P1)

1. Abrir la aplicación por primera vez (perfil y catálogo vacíos).
2. Verificar que aparece una pantalla de bienvenida invitando a configurar el perfil o a
   crear una cotización.
3. Crear una cotización nueva. Dar de alta un cliente nuevo con nombre, correo y teléfono.
4. Agregar dos líneas escritas a mano:
   - "Diseño de página web", cantidad 1, precio $1,500.00
   - "Sesión de fotos de producto", cantidad 1, precio $500.00
5. **Verificar**: la aplicación muestra base imponible **$2,000.00**, IVA (16%)
   **$320.00** y total **$2,320.00** (spec, sección de ejemplo; SC-002).
6. Editar la cantidad de una línea y verificar que los tres totales se recalculan solos.
7. Descargar el PDF y verificar que contiene: logo o nombre del freelancer, datos del
   cliente, número de cotización (`2026-001` si es la primera del año), fecha de emisión,
   fecha de validez (30 días después) y el desglose completo — ver
   `contracts/pdf-contract.md` para la lista completa.
8. Intentar editar una línea o cambiar el cliente de esa misma cotización.
   **Verificar**: la aplicación lo impide e indica que debe crearse una cotización nueva
   (FR-012, SC-007).
9. Crear una segunda cotización con al menos una línea y descargar su PDF.
   **Verificar**: su número es `2026-002` (SC-003).
10. Crear una cotización sin ninguna línea e intentar descargar el PDF.
    **Verificar**: la aplicación lo impide y avisa que falta agregar al menos una línea
    (FR-009).

## Escenario 2 — Configurar el perfil de marca (Historia 2, P2)

1. Ir a la pantalla de perfil y guardar nombre, correo, teléfono y un logo.
2. Crear una cotización nueva y descargar su PDF.
   **Verificar**: el PDF muestra el logo y los datos de contacto guardados.
3. Borrar el logo del perfil (dejarlo vacío) y generar el PDF de otra cotización nueva.
   **Verificar**: el PDF muestra el nombre del freelancer en texto en el lugar del logo.

## Escenario 3 — Catálogo de servicios reutilizable (Historia 3, P3)

1. Ir al catálogo y crear un servicio, por ejemplo "Diseño de logotipo", precio $800.00.
2. Crear una cotización nueva y agregar una línea desde el catálogo.
   **Verificar**: la descripción y el precio se precargan solos y pueden ajustarse.
3. Editar el precio por defecto de ese servicio en el catálogo.
   **Verificar**: la cotización ya creada anteriormente con ese servicio no cambia de
   precio (los cambios del catálogo no afectan cotizaciones existentes).

## Escenario 4 — Reutilizar un cliente ya guardado

1. Crear una cotización nueva.
2. Al elegir el cliente, verificar que aparece en una lista el cliente creado en el
   Escenario 1, sin tener que volver a escribir sus datos (SC-006).

## Escenario 5 — Persistencia entre sesiones (SC-004)

1. Con perfil, catálogo, clientes y varias cotizaciones ya creados, cerrar por completo
   el navegador (o la pestaña) y volver a abrir la aplicación.
2. **Verificar**: el perfil, el catálogo, los clientes y todas las cotizaciones siguen
   presentes exactamente como se dejaron.

## Escenario 6 — Uso en celular (responsivo)

1. Abrir la aplicación en un navegador de celular (o simulando un ancho de pantalla
   angosto en las herramientas de desarrollador del navegador).
2. Repetir el Escenario 1 completo.
   **Verificar**: todos los formularios, botones y la tabla de líneas se ven y se usan
   correctamente sin necesidad de hacer zoom ni desplazarse horizontalmente.

## Resultado esperado

Si los seis escenarios se cumplen tal como se describen, la v1.0 cumple los criterios de
éxito medibles de la spec (SC-001 a SC-007) y puede considerarse lista para publicarse.
