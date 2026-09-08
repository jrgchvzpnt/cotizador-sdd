package mx.cotizador.servicio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import mx.cotizador.modelo.ContadorAnual;
import mx.cotizador.repositorio.ContadorAnualRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class NumeracionServiceTest {

    private ContadorAnualRepository repositorio;
    private NumeracionService numeracionService;
    private final Map<Integer, ContadorAnual> almacen = new HashMap<>();

    @BeforeEach
    void configurar() {
        almacen.clear();
        repositorio = mock(ContadorAnualRepository.class);
        when(repositorio.findById(any())).thenAnswer(inv -> Optional.ofNullable(almacen.get(inv.getArgument(0))));
        when(repositorio.save(any())).thenAnswer(inv -> {
            ContadorAnual contador = inv.getArgument(0);
            almacen.put(contador.getAnio(), contador);
            return contador;
        });
        numeracionService = new NumeracionService(repositorio);
    }

    @Test
    void elPrimerNumeroDelAnioEsAAAA001() {
        String numero = numeracionService.siguienteNumero(LocalDate.of(2026, 3, 10));
        assertThat(numero).isEqualTo("2026-001");
    }

    @Test
    void losNumerosConsecutivosSubenDeUnoEnUnoSinSaltos() {
        String primero = numeracionService.siguienteNumero(LocalDate.of(2026, 1, 5));
        String segundo = numeracionService.siguienteNumero(LocalDate.of(2026, 6, 1));
        String tercero = numeracionService.siguienteNumero(LocalDate.of(2026, 12, 31));

        assertThat(primero).isEqualTo("2026-001");
        assertThat(segundo).isEqualTo("2026-002");
        assertThat(tercero).isEqualTo("2026-003");
    }

    @Test
    void elContadorReiniciaEn001AlCambiarDeAnio() {
        almacen.put(2026, new ContadorAnual(2026, 5));

        String numero = numeracionService.siguienteNumero(LocalDate.of(2027, 1, 1));

        assertThat(numero).isEqualTo("2027-001");
    }
}
