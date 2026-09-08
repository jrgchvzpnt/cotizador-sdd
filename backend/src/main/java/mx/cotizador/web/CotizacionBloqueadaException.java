package mx.cotizador.web;

/** Se lanza al intentar modificar líneas o cliente de una cotización ya generada (FR-012). */
public class CotizacionBloqueadaException extends RuntimeException {
    public CotizacionBloqueadaException(String mensaje) {
        super(mensaje);
    }
}
