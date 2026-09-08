# Research & Decisiones Técnicas: Cotizaciones en PDF para Freelancers

Este documento explica, en lenguaje de negocio, las decisiones importantes que definen
cómo se va a construir la v1.0, por qué se tomaron y qué alternativas se descartaron.
Ninguna de estas decisiones añade funcionalidad no pedida en la spec (Principio III);
solo determinan la forma más simple de construir exactamente lo que la spec pide
(Principio I).

## Decisión 1: Aplicación web sin servidor propio (solo lo que corre en el navegador)

**Decisión**: Construir la herramienta como una página web que funciona enteramente en el
navegador del freelancer, sin un servidor propio detrás que procese información.

**Por qué**: El usuario pidió que la v1.0 se pueda "publicar online enseguida" y que no se
agregue infraestructura que la spec no requiera. Una página que corre solo en el navegador
se puede subir a un servicio de hosting gratuito o de bajo costo y quedar accesible por una
dirección web en minutos, sin contratar ni mantener un servidor.

**Alternativas consideradas**:
- *Aplicación con servidor y base de datos propios* (por ejemplo, para centralizar la
  información): se descarta porque la spec indica explícitamente "sin base de datos en la
  nube" y "sin cuentas de usuario"; montar un servidor añadiría costo, tiempo de puesta en
  marcha y mantenimiento que nadie pidió.
- *Aplicación de escritorio instalable*: se descarta porque el usuario pidió que funcione
  de forma responsiva en el navegador del móvil, no una instalación aparte por dispositivo.

## Decisión 2: Los datos viven en el dispositivo del freelancer, no en la nube

**Decisión**: El perfil del freelancer, su catálogo de servicios, su lista de clientes y
sus cotizaciones se guardan dentro del propio navegador donde se usa la aplicación.

**Por qué**: Es exactamente lo que pide la spec ("los datos viven en el dispositivo del
freelancer") y lo que reforzó el usuario al pedir "sin base de datos en la nube para esta
versión". Guardar la información en el navegador es la forma más simple de cumplir esto:
no hace falta ningún servicio externo para almacenar ni recuperar datos.

**Consecuencia visible para el negocio**: si el freelancer cambia de computadora o de
navegador, no vuelve a ver sus cotizaciones anteriores ahí — tal como ya lo advierte la
sección "Fuera de Alcance" de la spec. No es un error, es la forma en que esta v1.0 decide
mantenerse simple.

**Alternativas consideradas**:
- *Guardar todo en un servicio en la nube compartido entre dispositivos*: se descarta
  porque exige cuentas de usuario (para saber de quién son los datos) y un backend con
  base de datos — ambos fuera de alcance explícito de esta versión.

## Decisión 3: El PDF se genera también en el navegador, no en un servidor

**Decisión**: El documento PDF de la cotización se arma directamente en el navegador del
freelancer al momento de descargarlo, usando una pieza de software ya hecha para esa tarea
(una "librería" que se agrega a la página, sin necesidad de instalar nada aparte).

**Por qué**: Si el PDF se generara en un servidor, habría que mantener ese servidor
funcionando y pagar por su operación — algo que no aporta valor adicional al freelancer y
contradice "no agregar infraestructura que la spec no requiera". Generarlo en el navegador
es más simple, más barato de operar y funciona igual de bien en celular que en computadora.

## Decisión 4: Diseño responsivo (una sola versión que se adapta a cualquier pantalla)

**Decisión**: Se construye una única versión de la aplicación cuyo diseño se ajusta
automáticamente al tamaño de la pantalla, priorizando que se vea y use bien en un celular.

**Por qué**: El usuario pidió explícitamente que funcione "de manera responsiva en el
móvil". Mantener una sola versión (en vez de una web y una app de celular aparte) es la
opción más simple: un solo lugar donde corregir errores o agregar mejoras futuras.

**Alternativas consideradas**:
- *Apps nativas para iPhone/Android*: se descarta por ser mucho más trabajo (dos
  aplicaciones adicionales, publicación en tiendas de aplicaciones) para un beneficio que
  el navegador móvil ya cubre.

## Decisión 5: Sin herramientas de construcción complejas ("build pipeline")

**Decisión**: El código de la aplicación se escribe de forma que el navegador lo pueda
ejecutar directamente, sin pasos intermedios de compilación o empaquetado.

**Por qué**: Menos piezas móviles en el proceso de construcción significa menos cosas que
puedan fallar al publicar la aplicación, y una puesta en marcha más rápida — alineado con
"debe poder publicarse online enseguida" y con el Principio I de la constitución
(simplicidad ante todo).

## Decisión 6: Pruebas automáticas solo donde el dinero puede fallar

**Decisión**: Se escriben comprobaciones automáticas únicamente para los cálculos de
dinero (base imponible, IVA, total, redondeo) y para la numeración automática de
cotizaciones. El resto de la aplicación se verifica usándola directamente, siguiendo los
criterios de aceptación de la spec.

**Por qué**: Los cálculos de dinero y la numeración son los únicos puntos donde un error
pequeño (un centavo mal redondeado, un número de cotización repetido) tendría consecuencias
serias para el negocio del freelancer. Añadir pruebas automáticas para el resto de la
aplicación sería una inversión no pedida por la spec (Principio III); en su lugar, cada
criterio de aceptación se puede comprobar operando la aplicación (Principio IV), como se
detalla en `quickstart.md`.

## Resumen de lo que NO se construye (y por qué)

Para que quede explícito y nadie lo dé por hecho más adelante:

- No hay servidor propio ni base de datos en la nube.
- No hay cuentas de usuario ni inicio de sesión.
- No hay sincronización entre dispositivos.
- No hay apps nativas de celular; solo el navegador.
- No hay un sistema de compilación/empaquetado que mantener.

Cualquiera de estos puntos puede proponerse como una mejora futura, pero no se construye en
esta v1.0 porque no está en la spec (Principio III: cero alcance fantasma).
