package mx.cotizador.web.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import mx.cotizador.modelo.Cotizacion;

public record CotizacionDetalleDto(
        Long id,
        String numero,
        ClienteDto cliente,
        LocalDate fechaEmision,
        LocalDate fechaValidez,
        List<LineaDto> lineas,
        BigDecimal baseImponible,
        BigDecimal iva,
        BigDecimal total,
        boolean pdfGenerado) {

    public static CotizacionDetalleDto desde(Cotizacion cotizacion) {
        return new CotizacionDetalleDto(
                cotizacion.getId(),
                cotizacion.getNumero(),
                ClienteDto.desde(cotizacion.getCliente()),
                cotizacion.getFechaEmision(),
                cotizacion.getFechaValidez(),
                cotizacion.getLineas().stream().map(LineaDto::desde).toList(),
                cotizacion.getBaseImponible(),
                cotizacion.getIva(),
                cotizacion.getTotal(),
                cotizacion.isPdfGenerado());
    }
}
