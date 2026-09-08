package mx.cotizador.web;

/** Se lanza cuando faltan datos requeridos o no cumplen una regla de negocio (p. ej. FR-009). */
public class SolicitudInvalidaException extends RuntimeException {
    public SolicitudInvalidaException(String mensaje) {
        super(mensaje);
    }
}
