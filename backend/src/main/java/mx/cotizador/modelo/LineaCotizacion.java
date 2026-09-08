package mx.cotizador.modelo;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import java.math.BigDecimal;

/** Un renglón dentro de una Cotización (FR-004, FR-008). */
@Entity
public class LineaCotizacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Cotizacion cotizacion;

    private String descripcion;
    private BigDecimal cantidad;
    private BigDecimal precioUnitario;

    @Enumerated(EnumType.STRING)
    private OrigenLinea origen;

    /** Referencia informativa al Servicio de origen; no se enlaza en vivo (Historia 3). */
    private Long servicioId;

    public Long getId() {
        return id;
    }

    public Cotizacion getCotizacion() {
        return cotizacion;
    }

    public void setCotizacion(Cotizacion cotizacion) {
        this.cotizacion = cotizacion;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public BigDecimal getCantidad() {
        return cantidad;
    }

    public void setCantidad(BigDecimal cantidad) {
        this.cantidad = cantidad;
    }

    public BigDecimal getPrecioUnitario() {
        return precioUnitario;
    }

    public void setPrecioUnitario(BigDecimal precioUnitario) {
        this.precioUnitario = precioUnitario;
    }

    public OrigenLinea getOrigen() {
        return origen;
    }

    public void setOrigen(OrigenLinea origen) {
        this.origen = origen;
    }

    public Long getServicioId() {
        return servicioId;
    }

    public void setServicioId(Long servicioId) {
        this.servicioId = servicioId;
    }
}
