# Cotizador

Herramienta web para que un freelancer cree cotizaciones profesionales (con su marca)
y las descargue en PDF para enviárselas a sus clientes. Español de México, montos en
pesos mexicanos (MXN).

## Cómo funciona

Es una aplicación web estática: no tiene servidor propio ni base de datos en la nube.
Todo el código (`index.html` + `src/`) corre directamente en el navegador, y los datos
del freelancer (perfil, catálogo, clientes, cotizaciones) se guardan únicamente en el
propio navegador (`localStorage`) del dispositivo donde se usa.

## Probarla en tu computadora

No requiere instalar dependencias ni compilar nada. Sirve la carpeta del proyecto con
cualquier servidor de archivos estático, por ejemplo:

```bash
npx serve .
# o
python -m http.server 8080
```

Y abre la URL que te indique en el navegador.

## Publicarla en línea

Como no tiene backend, publicarla es simplemente subir los archivos tal cual (sin ningún
paso de compilación) a un servicio de hosting estático. Por ejemplo, con cualquiera de
estos servicios (gratuitos para este tipo de proyecto):

- **Netlify / Vercel**: arrastra la carpeta del proyecto (o conéctala a un repositorio) y
  despliega; no hace falta configurar ningún "build command".
- **GitHub Pages**: sube el contenido a un repositorio de GitHub y activa Pages apuntando
  a la raíz del repositorio.

En los tres casos, basta con que `index.html` quede en la raíz del sitio publicado.

## Pruebas automáticas

Solo se prueban automáticamente los cálculos de dinero y la numeración de cotizaciones
(los puntos donde un error tendría consecuencias serias). El resto de la aplicación se
valida usándola directamente, siguiendo `specs/001-cotizaciones-freelancer-pdf/quickstart.md`.

```bash
npm test
```
