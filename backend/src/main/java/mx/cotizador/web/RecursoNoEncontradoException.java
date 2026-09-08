package mx.cotizador.web;

/** Se lanza cuando se pide un recurso (cliente, servicio, cotización...) que no existe. */
public class RecursoNoEncontradoException extends RuntimeException {
    public RecursoNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}
