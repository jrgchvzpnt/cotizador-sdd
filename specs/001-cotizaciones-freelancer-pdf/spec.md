# Feature Specification: Cotizaciones en PDF para Freelancers

**Feature Branch**: `001-cotizaciones-freelancer-pdf`

**Created**: 2026-09-05

**Status**: Draft

**Input**: User description: "Especificación: Cotizador SDD v0 — herramienta para que un freelancer cree presupuestos/cotizaciones profesionales con su marca y los descargue en PDF para enviárselos a sus clientes. Incluye: perfil del freelancer (nombre, identificador fiscal, contacto, logo), catálogo de servicios con precio por defecto, creación de cotizaciones con líneas (de catálogo o manuales), cálculo automático de base imponible/impuesto/total, numeración automática AAAA-NNN reiniciada cada año, fecha de emisión y validez de 30 días, edición/eliminación de líneas antes de generar el PDF, generación de PDF con desglose completo, y persistencia local de perfil/catálogo/cotizaciones entre sesiones. Nota de resolución: el texto original mezclaba datos de Perú (IGV, soles) y España (IRPF, autónomo); mediante clarificación con el usuario se fijó México como mercado único (español de México, MXN, IVA), conforme al Principio II de la constitución del proyecto."

## Aclaraciones Resueltas Antes de Redactar

El documento de entrada mezclaba tres mercados distintos (Perú, España y México). Antes de
redactar esta especificación se resolvieron las siguientes preguntas con el usuario:

1. **País/moneda/impuesto**: se fija **México**, moneda **pesos mexicanos (MXN)**, sin
   retención de IRPF (concepto que no existe en México), conforme al Principio II de la
   constitución del proyecto (idioma español de México, moneda MXN).
2. **Tasa de impuesto**: **fija** (no editable por el freelancer en esta v0).
3. **Logo ausente en el PDF**: se muestra el **nombre del freelancer en texto** en el lugar
   del logo.
4. **Numeración de cotizaciones**: **intocable** — siempre automática y secuencial, nunca
   editable a mano.

## Clarifications

### Session 2026-09-05

- Q: ¿Los datos de un cliente se guardan como una lista reutilizable para elegirlos en cotizaciones futuras, o se capturan de nuevo cada vez que se crea una cotización? → A: Se guardan en una lista reutilizable; el freelancer puede elegir un cliente ya guardado o dar de alta uno nuevo al crear una cotización.
- Q: Una vez que se descarga el PDF de una cotización, ¿debe quedar bloqueada para editarse, o se puede seguir modificando después? → A: Queda bloqueada; una vez generado el PDF, sus líneas y su cliente ya no se pueden editar, y cualquier cambio requiere crear una cotización nueva.
- Q: ¿Qué datos de contacto exactos se piden del freelancer y del cliente para mostrarlos en el PDF? → A: Correo electrónico y teléfono.
- Q: Para poder crear varias cotizaciones y volver a una ya empezada (necesario para SC-003 y para el flujo normal de trabajo), ¿debe existir una pantalla que liste las cotizaciones guardadas? → A: Sí; se agrega como requisito explícito (FR-013) detectado durante `/speckit-analyze`, antes de implementarlo.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear una cotización y descargarla en PDF (Priority: P1)

Un freelancer, con un cliente esperando precio, abre la aplicación, crea una cotización
añadiendo una o varias líneas de trabajo (descripción, cantidad y precio unitario), ve
cómo se calculan automáticamente la base imponible, el IVA y el total, y descarga un PDF
con esa información lista para enviar por correo.

**Why this priority**: Es el valor central del producto — resolver la escena de "las once
de la noche, hay que mandar un precio mañana" sin errores de cálculo ni aspecto amateur.
Sin esta historia no hay producto.

**Independent Test**: Se puede probar por completo abriendo la aplicación, creando una
cotización con líneas escritas a mano (sin depender de un catálogo ni de un perfil ya
configurado) y descargando el PDF resultante con los importes correctos.

**Acceptance Scenarios**:

1. **Given** la aplicación abierta y ninguna cotización previa, **When** el freelancer
   añade las líneas "Diseño de página web" (cantidad 1, precio $1,500.00) y "Sesión de
   fotos de producto" (cantidad 1, precio $500.00), **Then** el sistema muestra base
   imponible $2,000.00, IVA (16%) $320.00 y total $2,320.00.
2. **Given** una cotización con líneas cargadas, **When** el freelancer edita la cantidad
   o el precio de una línea, **Then** la base imponible, el IVA y el total se recalculan
   automáticamente.
3. **Given** una cotización con al menos una línea, **When** el freelancer descarga el
   PDF, **Then** el archivo incluye el número de cotización, la fecha de emisión, la
   fecha de validez (30 días después) y el desglose completo (base, IVA, total).
4. **Given** una cotización sin ninguna línea, **When** el freelancer intenta descargar
   el PDF, **Then** el sistema no genera el archivo y le avisa que debe añadir al menos
   una línea.
5. **Given** un cliente ya guardado de una cotización anterior, **When** el freelancer
   crea una cotización nueva, **Then** puede elegirlo de una lista en lugar de volver a
   capturar sus datos.
6. **Given** una cotización cuyo PDF ya fue generado, **When** el freelancer intenta
   editar sus líneas o cambiar su cliente, **Then** el sistema lo impide e indica que
   debe crear una cotización nueva para reflejar el cambio.
7. **Given** varias cotizaciones ya creadas, **When** el freelancer abre la lista de
   cotizaciones, **Then** ve el número, el cliente, el total y el estado
   (borrador/generada) de cada una, y puede abrir un borrador para seguir editándolo o
   crear una cotización nueva.

---

### User Story 2 - Configurar el perfil de marca del freelancer (Priority: P2)

Un freelancer configura una sola vez su nombre, datos de contacto y logo, para que todas
las cotizaciones que genere después salgan automáticamente con su imagen profesional sin
tener que volver a escribirlos.

**Why this priority**: Mejora directamente el criterio de éxito de negocio ("buena
imagen") pero el producto ya genera cotizaciones válidas sin esta historia (P1 funciona
con un perfil vacío, mostrando el nombre en lugar del logo).

**Independent Test**: Se puede probar configurando el perfil y verificando que una
cotización nueva, generada después, muestra esos datos y ese logo en el PDF.

**Acceptance Scenarios**:

1. **Given** un perfil vacío, **When** el freelancer guarda su nombre, datos de contacto
   y logo, **Then** los datos quedan disponibles para usarse en cualquier cotización
   nueva.
2. **Given** un perfil ya guardado, **When** el freelancer lo edita, **Then** los cambios
   se reflejan en las cotizaciones que se generen a partir de ese momento.
3. **Given** un perfil sin logo, **When** se genera un PDF, **Then** el PDF muestra el
   nombre del freelancer en el lugar donde iría el logo.

---

### User Story 3 - Mantener un catálogo de servicios reutilizables (Priority: P3)

Un freelancer guarda sus servicios habituales con un precio por defecto, para
añadirlos a una cotización con un par de clics en lugar de volver a escribir la
descripción y el precio cada vez.

**Why this priority**: Ahorra tiempo en cotizaciones frecuentes, pero no es
indispensable para el valor central: sin catálogo, el freelancer puede seguir
escribiendo líneas a mano (P1 ya lo permite).

**Independent Test**: Se puede probar dando de alta un servicio en el catálogo y
comprobando que aparece disponible para añadirse como línea al crear una cotización
nueva, con su precio por defecto precargado.

**Acceptance Scenarios**:

1. **Given** el catálogo vacío, **When** el freelancer crea un servicio con nombre y
   precio por defecto, **Then** el servicio queda disponible para usarse en cotizaciones
   futuras.
2. **Given** un servicio del catálogo, **When** el freelancer lo edita o lo elimina,
   **Then** el cambio no modifica las cotizaciones ya creadas anteriormente con ese
   servicio.
3. **Given** una cotización en creación, **When** el freelancer añade una línea desde el
   catálogo, **Then** la descripción y el precio por defecto se precargan y pueden
   ajustarse para esa cotización en concreto.

---

### Edge Cases

- ¿Qué pasa si el freelancer intenta descargar el PDF de una cotización sin ninguna
  línea? El sistema lo impide y avisa que debe añadir al menos una línea.
- ¿Qué pasa si se añade una línea escrita a mano que no corresponde a ningún servicio
  del catálogo? Se permite sin restricción; no todo encargo está catalogado.
- ¿Qué pasa si el freelancer genera un PDF sin haber subido un logo? Se muestra su
  nombre en texto en el lugar del logo.
- ¿Qué pasa si un cálculo produce un importe con más de dos decimales (por ejemplo,
  resultado de $2.345)? El sistema redondea a 2 decimales usando redondeo estándar
  (mitad hacia arriba).
- ¿Qué ve el freelancer la primera vez que abre la aplicación, sin perfil ni catálogo
  configurados? Una pantalla de bienvenida que lo invita a configurar su perfil antes
  de crear su primera cotización.
- ¿Qué pasa si el freelancer cierra la aplicación y la vuelve a abrir? Su perfil, su
  catálogo y todas sus cotizaciones siguen disponibles tal como los dejó.
- ¿Qué pasa si el freelancer intenta editar una cotización después de haber generado su
  PDF? El sistema lo impide; para reflejar un cambio debe crear una cotización nueva.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST permitir guardar y editar el perfil del freelancer: nombre,
  correo electrónico, teléfono y logo.
- **FR-002**: El sistema MUST permitir crear, editar y eliminar servicios de un catálogo,
  cada uno con nombre y precio por defecto en pesos mexicanos (MXN).
- **FR-003**: El sistema MUST permitir crear una cotización eligiendo un cliente ya
  guardado de una lista o dando de alta uno nuevo (nombre, correo electrónico y
  teléfono), que queda disponible para elegirse en cotizaciones futuras.
- **FR-004**: Cada línea de una cotización MUST poder originarse desde el catálogo o
  escribirse a mano, con descripción, cantidad y precio unitario en pesos mexicanos.
- **FR-005**: El sistema MUST calcular automáticamente, en cada cotización: base
  imponible (suma de cantidad × precio unitario de todas las líneas), IVA (base imponible
  × 16%, tasa fija) y total (base imponible + IVA).
- **FR-006**: El sistema MUST numerar cada cotización automáticamente con el formato
  AAAA-NNN (por ejemplo, 2026-001), reiniciando el contador cada año; este número no
  puede editarse manualmente.
- **FR-007**: Cada cotización MUST mostrar su fecha de emisión y una fecha de validez de
  30 días naturales después de la emisión.
- **FR-008**: El sistema MUST permitir editar o eliminar cualquier línea de una
  cotización antes de generar su PDF, recalculando los totales automáticamente.
- **FR-009**: El sistema MUST impedir la generación del PDF de una cotización que no
  tenga al menos una línea, avisando al freelancer del motivo.
- **FR-010**: El sistema MUST generar un PDF, en español de México y con montos en
  pesos mexicanos, que incluya: logo (o nombre del freelancer si no hay logo), nombre y
  contacto (correo, teléfono) del freelancer, nombre y contacto del cliente, número de
  cotización, fecha de emisión, fecha de validez, la tabla de líneas y el desglose de
  base imponible, IVA y total.
- **FR-011**: El sistema MUST conservar el perfil del freelancer, su catálogo, su lista
  de clientes y todas sus cotizaciones entre sesiones, sin requerir cuenta de usuario ni
  conexión a internet.
- **FR-012**: El sistema MUST bloquear la edición de las líneas y del cliente de una
  cotización una vez que se ha generado su PDF; cualquier cambio posterior requiere
  crear una cotización nueva.
- **FR-013**: El sistema MUST mostrar una lista de todas las cotizaciones guardadas
  (número, cliente, total y estado borrador/generada), permitiendo abrir una cotización
  en borrador para seguir editándola o crear una cotización nueva desde ahí.

### Key Entities *(include if feature involves data)*

- **Perfil del Freelancer**: representa al usuario dueño de la cuenta local. Atributos:
  nombre, correo electrónico, teléfono, logo. Único por instalación de la aplicación.
- **Servicio (Catálogo)**: un tipo de trabajo que el freelancer ofrece habitualmente.
  Atributos: nombre, precio por defecto en MXN. Se usa como plantilla para líneas de
  cotización; los cambios posteriores no afectan cotizaciones ya emitidas.
- **Cliente**: la persona o negocio al que se le envía la cotización. Atributos: nombre,
  correo electrónico, teléfono. Se guarda de forma reutilizable y puede elegirse en
  cotizaciones futuras sin volver a capturarlo.
- **Cotización**: el documento generado para un cliente. Atributos: número (AAAA-NNN),
  fecha de emisión, fecha de validez, líneas, base imponible, IVA, total, indicador de
  si su PDF ya fue generado. Pertenece al freelancer y se asocia a un cliente. Una vez
  generado su PDF, sus líneas y su cliente asociado quedan bloqueados para edición.
- **Línea de Cotización**: un renglón dentro de una cotización. Atributos: descripción,
  cantidad, precio unitario, origen (catálogo o manual).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un freelancer puede crear una cotización con dos o más líneas y descargar
  su PDF en menos de 5 minutos desde que abre la aplicación.
- **SC-002**: En el 100% de las cotizaciones generadas, el total del PDF coincide al
  centavo con el resultado de calcular manualmente (base imponible + IVA al 16%).
- **SC-003**: El número de cotización nunca se repite ni se salta dentro del mismo año,
  verificado creando varias cotizaciones seguidas.
- **SC-004**: Después de cerrar y volver a abrir la aplicación, el 100% de los perfiles,
  catálogos y cotizaciones guardados previamente siguen disponibles y sin cambios.
- **SC-005**: Una persona sin conocimientos técnicos puede verificar cada uno de los
  criterios de aceptación anteriores usando únicamente la aplicación, sin leer código.
- **SC-006**: Un cliente registrado previamente puede seleccionarse en una cotización
  nueva sin volver a escribir sus datos, verificado en el 100% de los casos probados.
- **SC-007**: Una cotización con PDF ya generado no permite editar sus líneas ni su
  cliente en el 100% de los intentos probados.

## Fuera de Alcance (v0)

- No es un comprobante fiscal: no incluye facturación electrónica ni timbrado.
- Sin cuentas de usuario ni inicio de sesión con contraseña.
- Sin almacenamiento en la nube: los datos viven únicamente en el dispositivo donde se
  usa la aplicación; cambiar de computadora no traslada las cotizaciones guardadas.
- Sin multidivisa: únicamente pesos mexicanos (MXN).
- Sin envío del PDF por correo desde la aplicación; el freelancer lo descarga y lo envía
  por su cuenta.
- Sin descuentos por línea ni globales; si se agregan en el futuro, se especificarán por
  separado con su regla de cálculo y ejemplos.
- Sin distinción del tipo de cliente (empresa/particular) ni retenciones de impuestos:
  no aplican en México para este caso de uso (ver Assumptions).
- Sin tasa de impuesto editable: el 16% es fijo en esta v0.

## Assumptions

- **Mercado y constitución**: se adopta México como mercado único (idioma español de
  México, moneda pesos mexicanos), conforme al Principio II de la constitución del
  proyecto, resolviendo la mezcla de referencias a Perú y España del documento original.
- **Tasa de impuesto**: se usa IVA fijo al 16% (tasa general de servicios profesionales
  en México) para todas las cotizaciones de esta v0; no es editable por el freelancer.
- **Sin retención**: no se aplica ningún concepto de retención de impuestos (el IRPF del
  documento original es una figura española que no existe en México).
- **Tipo de cliente**: se elimina la distinción "empresa/autónomo" vs. "particular" del
  documento original, porque su único propósito era decidir si aplicaba la retención de
  IRPF, concepto que no existe en México; el cliente solo requiere nombre y datos de
  contacto.
- **Identificador fiscal del freelancer**: no se solicita en esta v0, ya que el PDF
  generado no es un comprobante fiscal (ver Fuera de Alcance) y el Principio V de la
  constitución exige pedir solo los datos necesarios.
- **Redondeo**: todos los importes monetarios se redondean a 2 decimales usando
  redondeo estándar (mitad hacia arriba).
- **Primer uso**: con el perfil y el catálogo vacíos, la aplicación muestra una pantalla
  de bienvenida que invita a configurar el perfil antes de crear la primera cotización.
- **Terminología**: se usa el término "cotización" en vez de "presupuesto", consistente
  con el nombre del producto (Cotizador) y el uso habitual en México.
- **Persistencia local**: la aplicación no requiere conexión a internet para guardar o
  consultar perfil, catálogo y cotizaciones; estos datos residen únicamente en el
  dispositivo donde se usa la aplicación.
- **Gestión de clientes**: los clientes se guardan automáticamente al capturarlos por
  primera vez en una cotización y quedan disponibles para elegirse en cotizaciones
  futuras; esta v0 no incluye una pantalla separada para editar o eliminar clientes ya
  guardados (podría proponerse como mejora futura).
