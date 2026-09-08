package mx.cotizador.servicio;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import mx.cotizador.modelo.LineaCotizacion;
import org.springframework.stereotype.Service;

/**
 * Funciones puras de cálculo de dinero. Ver data-model.md, sección "Reglas de cálculo".
 * Es el único lugar del backend donde se calculan base imponible, IVA y total, para que
 * nunca haya dos implementaciones divergentes de la misma regla (Principio I).
 */
@Service
public class CalculoService {

    private static final BigDecimal TASA_IVA = new BigDecimal("0.16");

    /** Redondeo mitad hacia arriba a 2 decimales (Assumptions de la spec). */
    public BigDecimal redondear(BigDecimal valor) {
        return valor.setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal calcularImporteLinea(BigDecimal cantidad, BigDecimal precioUnitario) {
        return redondear(cantidad.multiply(precioUnitario));
    }

    public BigDecimal calcularBaseImponible(List<LineaCotizacion> lineas) {
        BigDecimal suma = lineas.stream()
                .map(linea -> calcularImporteLinea(linea.getCantidad(), linea.getPrecioUnitario()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return redondear(suma);
    }

    public BigDecimal calcularIVA(BigDecimal baseImponible) {
        return redondear(baseImponible.multiply(TASA_IVA));
    }

    public BigDecimal calcularTotal(BigDecimal baseImponible, BigDecimal iva) {
        return redondear(baseImponible.add(iva));
    }
}
