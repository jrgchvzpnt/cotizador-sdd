# Cómo publicar Cotizador en línea

Esta guía lista, opción por opción, qué se necesita para publicar la aplicación en
distintos proveedores de hosting — gratuitos y de paga. No cambia nada del código ni
de la arquitectura actual (single JAR, base de datos H2 embebida); solo documenta
cómo llevar lo que ya existe a cada proveedor.

> **Nota**: los planes gratuitos y los precios de estos proveedores cambian con el
> tiempo. Antes de decidir, confirma en el sitio de cada proveedor sus condiciones
> actuales — esta guía te dice qué buscar y qué pasos seguir, no garantiza precios.

## Lo que la aplicación necesita del hosting (léelo primero)

Sin importar el proveedor que elijas, revisa estos cuatro puntos:

1. **Poder ejecutar Java 25**: el servidor debe poder correr
   `java -jar backend/target/*.jar` (el archivo que genera `node build.js`). No hace
   falta instalar un servidor de aplicaciones aparte (Tomcat, etc.) — el JAR ya lo
   trae incluido.
2. **Un disco que no se borre solo — el punto más importante**: el perfil, el
   catálogo, los clientes y las cotizaciones se guardan en un archivo
   (`backend/data/cotizador.mv.db`), no en una base de datos externa. Si el hosting
   borra los archivos del servidor cada vez que se reinicia o se vuelve a publicar
   (esto pasa en varios planes "gratis" de tipo contenedor efímero), **se perderían
   las cotizaciones guardadas**. Es lo primero que hay que verificar de cada opción.
3. **Un puerto configurable**: la aplicación ya está preparada para esto — respeta la
   variable de entorno `PORT` si el hosting se la asigna
   (`server.port=${PORT:8080}` en `application.properties`), así que no hay que tocar
   código para la mayoría de los proveedores.
4. **Sin base de datos externa que contratar aparte**: al usar una base de datos
   embebida (H2 en archivo), no hace falta instalar ni pagar un servidor de base de
   datos por separado — es justo la simplicidad que busca la Decisión 3 de
   `specs/001-cotizaciones-freelancer-pdf/research.md`.

Los proveedores están ordenados de más simples a más flexibles dentro de cada grupo.

---

## Opciones gratuitas

### 1. Oracle Cloud — capa "Always Free" (servidor virtual propio)

Qué se necesita, paso por paso:

1. Crear una cuenta en Oracle Cloud (pide una tarjeta para verificar identidad, pero
   la capa "Always Free" no cobra mientras te quedes dentro de sus límites).
2. Crear una instancia de cómputo gratuita (una VM tipo Ampere/ARM, incluida siempre
   sin costo en esa capa).
3. Instalar Java 25 en esa máquina (o usar una imagen del sistema operativo que ya lo
   traiga).
4. Copiar el JAR generado (`backend/target/*.jar`) a la máquina, por ejemplo con
   `scp`.
5. Ejecutarlo con `java -jar nombre-del-archivo.jar`, idealmente registrado como
   servicio del sistema (`systemd`) para que se reinicie solo si el servidor se
   reinicia.
6. Abrir el puerto de la aplicación (por ejemplo 8080) tanto en el firewall interno
   de la máquina como en la configuración de red de Oracle Cloud.

- **Ventaja**: el disco es persistente y el servidor no se apaga solo — es la opción
  gratuita de esta lista más parecida a tener un servidor propio de verdad.
- **Desventaja**: es la que más pasos manuales de administración de servidor pide (no
  hay un botón de "subir y ya").

### 2. Fly.io (capa gratuita limitada)

Qué se necesita:

1. Crear una cuenta en Fly.io.
2. Instalar su herramienta de línea de comandos (`flyctl`).
3. Crear un `Dockerfile` sencillo para el proyecto (copia el JAR generado y define el
   comando de arranque) — este proyecto no trae uno todavía.
4. Correr `fly launch` desde la carpeta del proyecto para crear la app en Fly.io.
5. Crear un volumen persistente con `fly volumes create` y montarlo en la ruta donde
   vive `backend/data/` — sin este paso, los datos se perderían en cada despliegue.
6. Publicar con `fly deploy`.

- **Ventaja**: incluye una asignación gratuita mensual y soporta volúmenes
  persistentes de verdad.
- **Desventaja**: requiere escribir un `Dockerfile` propio y aprender su línea de
  comandos.

### 3. Render.com (capa gratuita)

Qué se necesita:

1. Crear una cuenta en Render y conectar el repositorio de GitHub del proyecto.
2. Crear un "Web Service" nuevo, eligiendo entorno Java (o Docker).
3. Configurar el comando de build (equivalente a `node build.js`, o los pasos de
   Maven por separado) y el comando de arranque (`java -jar backend/target/*.jar`).
4. Tener en cuenta que el plan gratuito **no incluye disco persistente**: cada vez
   que Render reinicie o vuelva a desplegar el servicio, se perderían las
   cotizaciones guardadas, salvo que se contrate un disco persistente (ya de paga).

- **Ventaja**: el más fácil de conectar directo desde GitHub, casi sin usar terminal.
- **Desventaja**: en el plan gratis los datos no sobreviven a un redeploy — sirve
  para probar o hacer una demostración, no para el uso real del freelancer.

### 4. Google Cloud Run (capa gratuita)

Qué se necesita:

1. Crear una cuenta de Google Cloud (pide tarjeta, aunque la capa gratuita no cobra
   dentro de sus límites).
2. Empaquetar la aplicación en un contenedor Docker (hay que crear un `Dockerfile`
   sencillo, igual que en Fly.io).
3. Publicar la imagen con `gcloud run deploy`.
4. Tener en cuenta que, igual que en Render gratis, Cloud Run **no tiene disco
   persistente propio**; para no perder datos habría que reemplazar la base de datos
   embebida por una base de datos administrada aparte (por ejemplo Cloud SQL), lo
   cual ya es un cambio de arquitectura, no solo de hosting.

- **Ventaja**: escala solo y su capa gratuita de tráfico es generosa.
- **Desventaja**: la opción que más se aleja del diseño actual "todo en un JAR" —
  obligaría a separar la base de datos si se quiere usar en serio.

---

## Opciones de paga

### 5. Railway.app

Qué se necesita:

1. Crear una cuenta y conectar el repositorio de GitHub.
2. Railway detecta automáticamente que es un proyecto Java/Maven y arma el JAR solo
   (o se le indica el comando de build manualmente).
3. Agregar un "Volume" (disco persistente) desde su panel y montarlo en
   `backend/data/`.
4. Activar un plan de pago (cobra por uso; existe una prueba gratuita limitada, pero
   no es gratis de forma permanente).

- **Ventaja**: de los más simples de configurar con disco persistente real, sin
  escribir un `Dockerfile` a mano.
- **Costo aproximado**: desde unos pocos dólares al mes según el uso.

### 6. DigitalOcean Droplet (servidor virtual)

Qué se necesita:

1. Crear una cuenta y contratar un "Droplet" (servidor virtual) pequeño.
2. Instalar Java 25 en el servidor (por ejemplo, sobre Ubuntu).
3. Copiar el JAR al servidor y ejecutarlo, igual que en la opción de Oracle Cloud
   gratis.
4. Configurar el firewall para abrir el puerto que use la aplicación.
5. Opcional pero recomendable: configurar un dominio propio y HTTPS con Nginx +
   Let's Encrypt por delante del JAR.

- **Ventaja**: control total, disco persistente por naturaleza, precio bajo y
  predecible (planes desde unos pocos dólares al mes).
- **Desventaja**: tú administras el servidor (actualizaciones, seguridad) — no es un
  servicio administrado.

### 7. AWS (EC2 o Elastic Beanstalk)

Qué se necesita:

1. Crear una cuenta de AWS.
2. Opción sencilla: una instancia EC2 (una máquina virtual) — como con DigitalOcean:
   instalar Java, copiar el JAR, ejecutarlo, y adjuntar un volumen EBS persistente.
3. Opción administrada: Elastic Beanstalk con la plataforma Java — se sube el JAR
   directamente desde su consola o su CLI, y AWS administra el servidor; para que los
   datos persistan de verdad conviene un volumen EBS adjunto o migrar a una base de
   datos administrada (RDS).
4. Configurar los grupos de seguridad (firewall) para el puerto de la aplicación.

- **Ventaja**: el ecosistema más completo si el negocio crece (métricas, balanceo de
  carga, etc.).
- **Desventaja**: más pantallas y opciones que configurar; es fácil gastar de más si
  no se revisan los límites de uso.

### 8. Azure App Service (Java)

Qué se necesita:

1. Crear una cuenta de Azure.
2. Crear un recurso "App Service" eligiendo la pila Java 25 (o subir el JAR con
   soporte "Java SE").
3. Subir el JAR desde Azure CLI, la extensión de Azure en VS Code, o el portal web.
4. Para que los datos persistan de verdad, agregar un "Azure Files" o un disco
   administrado montado en la ruta de `backend/data/`, o migrar a una base de datos
   administrada de Azure (esto último ya sería un cambio de arquitectura).

- **Ventaja**: si el equipo ya usa Azure Repos/DevOps, se integra de forma natural
  con el resto de las herramientas.
- **Costo aproximado**: variable según el plan de App Service elegido.

---

## En resumen: ¿cuál elegir?

- **Para probar o mostrar algo rápido, sin gastar**: Render.com gratis o Fly.io
  (aceptando que en el nivel gratis de Render los datos no sobreviven a un
  redeploy).
- **Para uso real diario, sin pagar nada**: Oracle Cloud "Always Free" — es la única
  opción de esta lista con disco persistente de verdad y sin costo.
- **Para uso real, pagando algo simple**: Railway.app o un Droplet de DigitalOcean —
  ambos con disco persistente real y pasos mínimos.
- **Si el negocio crece o el equipo ya usa esa nube**: AWS o Azure.
