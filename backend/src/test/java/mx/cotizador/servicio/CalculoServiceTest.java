package mx.cotizador.servicio;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.List;
import mx.cotizador.modelo.LineaCotizacion;
import org.junit.jupiter.api.Test;

class CalculoServiceTest {

    private final CalculoService calculoService = new CalculoService();

    private LineaCotizacion linea(String cantidad, String precioUnitario) {
        LineaCotizacion linea = new LineaCotizacion();
        linea.setCantidad(new BigDecimal(cantidad));
        linea.setPrecioUnitario(new BigDecimal(precioUnitario));
        return linea;
    }

    @Test
    void redondearAplicaMitadHaciaArribaA2Decimales() {
        assertThat(calculoService.redondear(new BigDecimal("2.345"))).isEqualByComparingTo("2.35");
        assertThat(calculoService.redondear(new BigDecimal("2.344"))).isEqualByComparingTo("2.34");
    }

    @Test
    void calcularImporteLineaMultiplicaCantidadPorPrecioUnitario() {
        assertThat(calculoService.calcularImporteLinea(new BigDecimal("1"), new BigDecimal("1500")))
                .isEqualByComparingTo("1500.00");
        assertThat(calculoService.calcularImporteLinea(new BigDecimal("3"), new BigDecimal("0.10")))
                .isEqualByComparingTo("0.30");
    }

    @Test
    void elEjemploDeReferenciaDeLaSpecCuadraAlCentavo() {
        List<LineaCotizacion> lineas = List.of(
                linea("1", "1500"),
                linea("1", "500"));

        BigDecimal base = calculoService.calcularBaseImponible(lineas);
        BigDecimal iva = calculoService.calcularIVA(base);
        BigDecimal total = calculoService.calcularTotal(base, iva);

        assertThat(base).isEqualByComparingTo("2000.00");
        assertThat(iva).isEqualByComparingTo("320.00");
        assertThat(total).isEqualByComparingTo("2320.00");
    }

    @Test
    void calcularBaseImponibleSinLineasEsCero() {
        assertThat(calculoService.calcularBaseImponible(List.of())).isEqualByComparingTo("0.00");
    }
}
