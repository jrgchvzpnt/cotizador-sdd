package mx.cotizador.web;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Traduce las excepciones de negocio a respuestas HTTP con mensajes en español de
 * México, según contracts/api-rest.md.
 */
@RestControllerAdvice
public class ManejadorErrores {

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<RespuestaError> manejarNoEncontrado(RecursoNoEncontradoException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new RespuestaError(ex.getMessage()));
    }

    @ExceptionHandler(CotizacionBloqueadaException.class)
    public ResponseEntity<RespuestaError> manejarBloqueada(CotizacionBloqueadaException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new RespuestaError(ex.getMessage()));
    }

    @ExceptionHandler(SolicitudInvalidaException.class)
    public ResponseEntity<RespuestaError> manejarInvalida(SolicitudInvalidaException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new RespuestaError(ex.getMessage()));
    }
}
