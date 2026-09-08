<!--
Sync Impact Report
- Version change: 1.0.0 → 2.0.0
- Enmienda: se adopta Angular (frontend) y Java con Spring Boot (backend) como
  arquitectura estándar del proyecto, a petición explícita del usuario.
- Principios modificados (redefinición incompatible → MAJOR):
  1. Simplicidad ante todo → ya no excluye frameworks/backend por defecto;
     ahora exige simplicidad DENTRO de la arquitectura estándar adoptada
     (Angular + Java/Spring Boot), no la ausencia total de framework/backend.
- Secciones modificadas: Restricciones Adicionales (se agrega la arquitectura
  estándar del proyecto y su implicación en persistencia de datos).
- Principios sin cambio: II (Idioma y mercado), III (Cero alcance fantasma),
  IV (Verificable por una persona no técnica), V (Datos del usuario).
- Secciones añadidas/eliminadas: ninguna.
- Plantillas dependientes: no se modifican en este comando. El plan y las
  tareas de la funcionalidad `001-cotizaciones-freelancer-pdf` (ya implementada
  sobre una arquitectura sin backend) deberán revisarse con /speckit-plan y
  /speckit-tasks contra esta versión; su spec.md contiene supuestos ("sin
  base de datos en la nube", "persistencia local") que quedan en conflicto con
  la nueva arquitectura estándar y requerirán resolución explícita (spec o
  excepción documentada) antes de replanificar.
- TODOs diferidos: ninguno.
-->

# Cotizador-SDD Constitution

## Core Principles

### I. Simplicidad ante todo
Dentro de la arquitectura estándar del proyecto (frontend en Angular, backend
en Java con Spring Boot — ver Restricciones Adicionales), ante dos soluciones
que cumplan el mismo requisito, se DEBE elegir siempre la más simple de
implementar y de mantener. NO se DEBE anticipar complejidad para necesidades
futuras hipotéticas más allá de lo que esa arquitectura estándar ya requiere
(sin microservicios adicionales, sin capas de abstracción "por si acaso", sin
patrones de diseño, módulos o librerías extra que nadie ha pedido, sin
configurabilidad que nadie ha pedido). Si una solución requiere justificar
complejidad adicional a la de la arquitectura estándar, se prefiere la
alternativa más simple aunque sea menos elegante o menos "escalable" en
teoría.
**Razón**: adoptar Angular y Spring Boot como base responde a una decisión de
producto para tener una arquitectura cliente-servidor completa; pero dentro de
esa base, la complejidad anticipada sigue siendo el mayor riesgo de retraso y
de errores, así que se sigue resolviendo cada problema con el código más
simple posible dentro del stack elegido.

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

**Arquitectura estándar del proyecto**: el frontend se construye en Angular y
el backend en Java con Spring Boot (a la fecha de esta enmienda, versiones
Angular 22 y Java 25). Toda nueva funcionalidad DEBE construirse sobre esta
misma arquitectura, salvo excepción justificada por escrito en el plan
correspondiente. La persistencia de datos que antes vivía únicamente en el
navegador del freelancer pasa a resolverse a través del backend (Spring
Boot) con una base de datos gestionada por él; cualquier spec o plan que
todavía asuma almacenamiento exclusivo en el dispositivo (sin backend) DEBE
actualizarse explícitamente para reflejar este cambio antes de implementarse.

Toda funcionalidad de la aplicación hereda además las restricciones de los
Principios anteriores: interfaz y documentos en español de México con montos
en pesos mexicanos (Principio II); ausencia de credenciales o secretos en el
repositorio de código — las credenciales de la base de datos y cualquier
configuración sensible del backend se manejan por variables de entorno,
nunca embebidas (Principio V); y ninguna funcionalidad fuera de lo descrito
en la spec correspondiente (Principio III). Cualquier dependencia, librería o
servicio adicional a los que ya trae la arquitectura estándar (Angular /
Spring Boot) DEBE justificarse con la solución más simple disponible para el
requisito en cuestión (Principio I).

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

**Version**: 2.0.0 | **Ratified**: 2026-09-05 | **Last Amended**: 2026-09-07
