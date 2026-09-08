// Script de build para un solo artefacto de despliegue (Principio I: simplicidad).
// 1) Compila el frontend Angular.
// 2) Copia el resultado dentro de los recursos estáticos del backend.
// 3) Empaqueta el backend (Spring Boot) en un único JAR que sirve todo.
//
// Uso: node build.js

const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const raiz = __dirname;
const frontend = path.join(raiz, "frontend");
const origenBuild = path.join(frontend, "dist", "frontend", "browser");
const destinoEstaticos = path.join(raiz, "backend", "src", "main", "resources", "static");

function ejecutar(comando, args, cwd) {
  console.log(`\n> ${comando} ${args.join(" ")} (en ${cwd})`);
  execFileSync(comando, args, { cwd, stdio: "inherit", shell: process.platform === "win32" });
}

function copiarDirectorio(origen, destino) {
  fs.rmSync(destino, { recursive: true, force: true });
  fs.mkdirSync(destino, { recursive: true });
  fs.cpSync(origen, destino, { recursive: true });
}

ejecutar("npm", ["run", "build"], frontend);

if (!fs.existsSync(origenBuild)) {
  throw new Error(`No se encontró el build de Angular en ${origenBuild}`);
}
copiarDirectorio(origenBuild, destinoEstaticos);
console.log(`\nFrontend copiado a ${destinoEstaticos}`);

const mvnw = process.platform === "win32" ? "mvnw.cmd" : "./mvnw";
ejecutar(mvnw, ["-DskipTests", "package"], path.join(raiz, "backend"));

console.log("\nListo. El JAR único queda en backend/target/*.jar");
