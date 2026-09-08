package mx.cotizador.web.dto;

import java.math.BigDecimal;
import mx.cotizador.modelo.OrigenLinea;

public record LineaRequest(
        String descripcion,
        BigDecimal cantidad,
        BigDecimal precioUnitario,
        OrigenLinea origen,
        Long servicioId) {
}
