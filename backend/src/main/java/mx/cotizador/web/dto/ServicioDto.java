package mx.cotizador.web.dto;

import java.math.BigDecimal;
import mx.cotizador.modelo.Servicio;

public record ServicioDto(Long id, String nombre, BigDecimal precioDefault) {

    public static ServicioDto desde(Servicio servicio) {
        return new ServicioDto(servicio.getId(), servicio.getNombre(), servicio.getPrecioDefault());
    }
}
