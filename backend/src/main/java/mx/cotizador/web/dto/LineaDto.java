package mx.cotizador.web.dto;

import java.math.BigDecimal;
import mx.cotizador.modelo.LineaCotizacion;
import mx.cotizador.modelo.OrigenLinea;

public record LineaDto(
        Long id,
        String descripcion,
        BigDecimal cantidad,
        BigDecimal precioUnitario,
        OrigenLinea origen,
        Long servicioId) {

    public static LineaDto desde(LineaCotizacion linea) {
        return new LineaDto(
                linea.getId(),
                linea.getDescripcion(),
                linea.getCantidad(),
                linea.getPrecioUnitario(),
                linea.getOrigen(),
                linea.getServicioId());
    }
}
