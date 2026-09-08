# Cotizador

Herramienta web para que un freelancer cree cotizaciones profesionales (con su marca)
y las descargue en PDF para enviárselas a sus clientes. Español de México, montos en
pesos mexicanos (MXN).

## Arquitectura

- **Frontend**: Angular 22 (`frontend/`).
- **Backend**: Java 25 + Spring Boot (`backend/`), con una base de datos H2 embebida en
  archivo (sin servidor de base de datos aparte) y generación de PDF con OpenPDF.
- Sin cuentas de usuario ni inicio de sesión: cada instalación del backend sirve a un
  solo freelancer.
- Un solo artefacto de despliegue: el backend sirve también el frontend ya compilado
  (ver "Publicar" más abajo).

Ver `specs/001-cotizaciones-freelancer-pdf/` para la especificación, el plan y las
decisiones de arquitectura completas.

## Requisitos

- **Java 25** (JDK). Verifica con `java -version`.
- **Node.js 24.15+ o 22.22.3+ o 26+** (requerido por Angular CLI 22). Verifica con
  `node --version`; si tu Node es más viejo, instala una versión más reciente desde
  https://nodejs.org/.
- Maven no es necesario instalarlo aparte: el proyecto incluye `backend/mvnw`.

## Desarrollo

Backend (puerto 8080):

```bash
cd backend
./mvnw spring-boot:run
```

Frontend, en otra terminal (puerto 4200, con proxy hacia el backend en `/api`):

```bash
cd frontend
npm install
npm start
```

Abre `http://localhost:4200`.

## Pruebas automáticas

Solo se prueban automáticamente los cálculos de dinero y la numeración de
cotizaciones (los puntos donde un error tendría consecuencias serias). El resto de la
aplicación se valida usándola directamente, siguiendo
`specs/001-cotizaciones-freelancer-pdf/quickstart.md`.

```bash
cd backend
./mvnw test
```

## Publicar (un solo artefacto)

```bash
node build.js
```

Esto compila el frontend, copia el resultado dentro de
`backend/src/main/resources/static/` y empaqueta el backend en un único JAR ejecutable
en `backend/target/*.jar`. Para correrlo:

```bash
java -jar backend/target/backend-0.0.1-SNAPSHOT.jar
```

La aplicación completa (interfaz + API) queda disponible en `http://localhost:8080`
(o el puerto que indique la variable de entorno `PORT`). Sube y ejecuta ese único JAR
en cualquier servidor con Java 25 instalado.

Para ver opciones concretas de dónde publicarlo (gratis y de paga, con los pasos de
cada una), ver [docs/hosting.md](docs/hosting.md).

## Configuración

Todo se configura por variables de entorno (nunca hay credenciales en el código):

- `PORT`: puerto del servidor (por defecto 8080).
- `COTIZADOR_DB_USER` / `COTIZADOR_DB_PASSWORD`: credenciales de la base de datos H2
  (por defecto usuario `sa` sin contraseña, adecuado para un solo freelancer local).
