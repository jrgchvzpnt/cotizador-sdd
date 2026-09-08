package mx.cotizador.web.dto;

import java.math.BigDecimal;
import mx.cotizador.modelo.Cotizacion;

/** Para la lista "Mis Cotizaciones" (FR-013). */
public record CotizacionResumenDto(Long id, String numero, String clienteNombre, BigDecimal total, boolean pdfGenerado) {

    public static CotizacionResumenDto desde(Cotizacion cotizacion) {
        return new CotizacionResumenDto(
                cotizacion.getId(),
                cotizacion.getNumero(),
                cotizacion.getCliente().getNombre(),
                cotizacion.getTotal(),
                cotizacion.isPdfGenerado());
    }
}
