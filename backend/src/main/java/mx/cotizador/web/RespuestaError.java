package mx.cotizador.web;

/** Formato de error de la API, ver contracts/api-rest.md. */
public record RespuestaError(String mensaje) {
}
