# Research & Decisiones Técnicas: Migración a Angular + Java/Spring Boot

Este documento reemplaza al `research.md` de la versión sin backend y explica, en
lenguaje de negocio, las decisiones de la nueva arquitectura pedida explícitamente por
el usuario y ya reflejada en la constitución v2.0.0.

## Decisión 1: Backend en Java con Spring Boot como fuente única de la verdad

**Decisión**: todo el cálculo (base imponible, IVA, total), la numeración automática y
la generación del PDF se mueven al backend. El frontend en Angular deja de calcular
nada por su cuenta; solo muestra lo que el backend responde.

**Por qué**: con un solo backend como responsable de las reglas de negocio, no hay
riesgo de que el cálculo del navegador y el del servidor lleguen a resultados distintos
con el tiempo. Es también la forma más simple de mantener una sola versión de la lógica
(Principio I), en vez de reescribirla en TypeScript y en Java a la vez.

## Decisión 2: El PDF se genera en el servidor, no en el navegador

**Decisión**: Angular pide el PDF a un endpoint del backend (`GET
/api/cotizaciones/{id}/pdf`) y simplemente descarga el archivo que le regresa; ya no
arma el documento en el navegador.

**Por qué**: como el backend ya calcula y guarda los totales, generarlo ahí evita
duplicar el formato del documento en dos lenguajes distintos. Se usa una librería madura
de Java (OpenPDF) en vez de escribir generación de PDF a mano.

**Alternativas consideradas**: mantener la generación en el navegador (como en la
versión anterior) — se descarta porque obligaría a mantener dos implementaciones del
mismo documento (una en Java para nada, ya que el dato vive en el backend, y otra en
TypeScript), lo que contradice la simplicidad dentro del nuevo stack.

## Decisión 3: Base de datos embebida (H2 en archivo) en vez de un servidor de base de datos aparte

**Decisión**: el backend usa una base de datos H2 que se guarda en un archivo, no un
servidor de base de datos independiente (como PostgreSQL o MySQL) que haya que instalar
y mantener por separado.

**Por qué**: la constitución ahora exige una base de datos gestionada por el backend,
pero no dice cuál. Elegir la más simple de operar — sin instalar nada aparte, sin
credenciales de un servidor externo que administrar — es la lectura más fiel del
Principio I dentro del nuevo stack obligatorio. Si en el futuro el negocio necesita algo
más robusto (por ejemplo, más de un freelancer por instalación), se puede migrar a
PostgreSQL sin cambiar el resto de la aplicación, pero eso no se construye ahora porque
nadie lo ha pedido (Principio III).

## Decisión 4: Un solo artefacto de despliegue (el backend sirve el frontend)

**Decisión**: al compilar el proyecto, los archivos ya construidos de Angular se copian
dentro del propio backend, de modo que al desplegar solo hay que subir y ejecutar un
único programa Java; ese mismo programa atiende tanto la página web como la API.

**Por qué**: operar un solo proceso es más simple que operar dos servicios por separado
(uno para el frontend, otro para el backend), y reduce a la mitad la cantidad de cosas
que hay que configurar para "tenerlo en línea".

**Alternativas consideradas**: desplegar el frontend y el backend como dos servicios
independientes (por ejemplo, el frontend en un hosting estático y el backend aparte) —
válido y común en otros proyectos, pero aquí implica más piezas que coordinar sin que la
spec pida esa separación; se prefiere la opción más simple.

## Decisión 5: Sin cuentas de usuario, aunque ahora hay un backend real

**Decisión**: seguir sin login ni cuentas. Cada instalación del backend sirve a un solo
freelancer.

**Por qué**: tener un backend no obliga a tener login — son decisiones independientes.
La spec nunca pidió cuentas de usuario, así que no se agregan solo porque ahora "hay
dónde ponerlas" (Principio III: cero alcance fantasma).

**Consecuencia visible para el negocio**: a diferencia de la versión anterior (donde
cambiar de computadora perdía el acceso a las cotizaciones guardadas), ahora los datos
viven en el backend y son accesibles desde cualquier dispositivo que apunte a esa misma
instalación — sin que el freelancer tenga que iniciar sesión para lograrlo.

## Decisión 6: Pruebas automáticas — se mantiene el mismo criterio, ahora en Java

**Decisión**: las pruebas automáticas siguen limitándose a la lógica donde un error
tendría consecuencias serias para el negocio: cálculo de dinero y numeración de
cotizaciones. Se escriben con JUnit 5 en el backend (donde ahora vive esa lógica). El
resto de la aplicación se sigue verificando manualmente contra `quickstart.md`.

**Por qué**: el criterio de la constitución no cambió, solo el lenguaje donde se aplica.

## Resumen de lo que NO cambia

- Los requisitos funcionales (FR-001 a FR-013) son los mismos; esta es una migración de
  arquitectura, no una nueva funcionalidad.
- Sigue sin haber cuentas de usuario, sin multidivisa, sin facturación electrónica y sin
  descuentos — todo lo que la spec ya excluía sigue excluido.
- El criterio de simplicidad sigue vigente; solo se redefinió qué cuenta como "simple"
  dentro de la arquitectura Angular + Spring Boot que la constitución ahora exige.
