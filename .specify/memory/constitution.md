<!--
Sync Impact Report
- Version change: N/A (plantilla sin ratificar) → 1.0.0
- Ratificación inicial de la constitución del proyecto cotizador-sdd.
- Principios añadidos:
  1. Simplicidad ante todo
  2. Idioma y mercado (español de México / MXN)
  3. Cero alcance fantasma
  4. Verificable por una persona no técnica
  5. Datos del usuario
- Secciones añadidas: Restricciones Adicionales, Flujo de Desarrollo y Calidad, Governance
- Secciones eliminadas: ninguna (primera versión)
- Plantillas dependientes: no se modifican en este comando (se leen en tiempo de
  ejecución); revisar en el próximo /speckit-plan y /speckit-tasks que referencien
  estos principios (simplicidad, idioma/moneda, alcance de spec, verificabilidad,
  manejo mínimo de datos) al validar Constitution Check.
- TODOs diferidos: ninguno.
-->

# Cotizador-SDD Constitution

## Core Principles

### I. Simplicidad ante todo
Ante dos soluciones que cumplan el mismo requisito, se DEBE elegir siempre la más
simple de implementar y de mantener. Esta es una versión inicial del producto:
NO se DEBE anticipar complejidad para necesidades futuras hipotéticas (sin
arquitecturas genéricas, sin capas de abstracción "por si acaso", sin
configurabilidad que nadie ha pedido). Si una solución requiere justificar su
complejidad, se prefiere la alternativa más simple aunque sea menos elegante o
menos "escalable" en teoría.
**Razón**: en una v1, la complejidad anticipada es el mayor riesgo de retraso y
de errores; resolver el problema de hoy con el código más simple posible
mantiene el producto entregable y comprensible.

### II. Idioma y mercado
Todo el producto —interfaz, mensajes, textos de ayuda, correos, PDFs generados
y cualquier contenido visible para el usuario final— DEBE estar en español de
México. La moneda utilizada en cotizaciones, totales, precios y cualquier
cálculo monetario DEBE ser el peso mexicano (MXN). No se DEBEN mezclar idiomas
ni monedas en la misma pantalla o documento generado.
**Razón**: el producto está dirigido a freelancers del mercado mexicano; la
consistencia de idioma y moneda evita confusión y errores de facturación.

### III. Cero alcance fantasma
NO se DEBE implementar ninguna funcionalidad, pantalla, campo o comportamiento
que no esté descrito explícitamente en la especificación (spec) vigente de la
funcionalidad en curso. Si durante el desarrollo surge una idea nueva o una
mejora, se DEBE proponer (documentarla para su evaluación) en lugar de
construirla directamente. Ninguna tarea de implementación puede justificarse
solo por "ya que estamos" o "podría servir después".
**Razón**: mantener el alcance exactamente igual al acordado evita retrabajo,
mantiene los plazos y asegura que cada línea de código tiene un requisito que
la respalda.

### IV. Verificable por una persona no técnica
Cada criterio de aceptación de cada spec DEBE poder comprobarse usando la
aplicación en ejecución (haciendo clic, llenando formularios, descargando el
PDF resultante, etc.), sin necesidad de leer código, logs técnicos ni consultas
a bases de datos. Si un criterio de aceptación no se puede verificar así, DEBE
reescribirse hasta que lo sea antes de aprobarse.
**Razón**: el negocio (freelancers, dueños de producto, revisores no técnicos)
debe poder confirmar por sí mismo que una funcionalidad quedó bien hecha, sin
depender de un desarrollador que le explique el código.

### V. Datos del usuario
La aplicación DEBE solicitar únicamente los datos estrictamente necesarios para
generar el presupuesto/cotización (por ejemplo: datos del freelancer, datos del
cliente, conceptos, precios); no se DEBE pedir información adicional "por si
se usa después". El código fuente NO DEBE contener claves, contraseñas,
tokens ni ningún otro secreto embebido; cualquier credencial DEBE manejarse
mediante variables de entorno o mecanismos de configuración fuera del
repositorio.
**Razón**: minimizar los datos solicitados reduce la carga para el usuario y el
riesgo de manejar información sensible innecesaria; mantener los secretos
fuera del código evita filtraciones de seguridad.

## Restricciones Adicionales

Toda funcionalidad de la aplicación hereda directamente las restricciones de
los Principios anteriores: interfaz y documentos en español de México con
montos en pesos mexicanos (Principio II); ausencia de credenciales o secretos
en el repositorio de código (Principio V); y ninguna funcionalidad fuera de lo
descrito en la spec correspondiente (Principio III). Cualquier dependencia,
librería o servicio externo que se incorpore DEBE justificarse con la solución
más simple disponible para el requisito en cuestión (Principio I).

## Flujo de Desarrollo y Calidad

Cada nueva funcionalidad sigue el flujo: especificación (spec) → criterios de
aceptación verificables por una persona no técnica (Principio IV) → plan →
tareas → implementación limitada estrictamente a lo especificado (Principio
III). Antes de aprobar una spec o un plan, se DEBE revisar que cada criterio de
aceptación se pueda comprobar operando la aplicación. Ideas nuevas detectadas
durante la implementación se registran como propuestas separadas, no se
incorporan a la tarea en curso.

## Governance

Esta constitución prevalece sobre cualquier otra práctica, plantilla o
convención usada en el proyecto. Cualquier plan, spec o tarea que la
contradiga DEBE ajustarse o justificar explícitamente la excepción antes de
continuar.

**Procedimiento de enmienda**: los cambios a esta constitución se proponen
documentando el principio o sección afectada y la razón del cambio; se
registran en este archivo junto con un Sync Impact Report actualizado.

**Política de versionado**: esta constitución usa versionado semántico
(MAJOR.MINOR.PATCH):
- MAJOR: eliminación o redefinición incompatible de un principio existente.
- MINOR: adición de un nuevo principio o sección, o ampliación material de
  una guía existente.
- PATCH: aclaraciones de redacción, correcciones de forma o ajustes que no
  cambian el significado.

**Revisión de cumplimiento**: toda spec, plan o revisión de código DEBE
verificar que cumple estos cinco principios antes de aprobarse. La
complejidad que se aparte del Principio I DEBE justificarse por escrito en el
propio plan.

**Version**: 1.0.0 | **Ratified**: 2026-09-05 | **Last Amended**: 2026-09-05
