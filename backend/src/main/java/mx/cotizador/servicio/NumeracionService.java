package mx.cotizador.servicio;

import java.time.LocalDate;
import mx.cotizador.modelo.ContadorAnual;
import mx.cotizador.repositorio.ContadorAnualRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Numeración automática de cotizaciones (FR-006). Formato AAAA-NNN; el contador
 * reinicia en 001 cada año y nunca se edita a mano (Aclaraciones, PA3).
 */
@Service
public class NumeracionService {

    private final ContadorAnualRepository contadorAnualRepository;

    public NumeracionService(ContadorAnualRepository contadorAnualRepository) {
        this.contadorAnualRepository = contadorAnualRepository;
    }

    @Transactional
    public String siguienteNumero(LocalDate fechaEmision) {
        int anio = fechaEmision.getYear();
        ContadorAnual contador = contadorAnualRepository.findById(anio)
                .orElseGet(() -> new ContadorAnual(anio, 0));

        int siguienteConsecutivo = contador.getUltimoConsecutivo() + 1;
        contador.setUltimoConsecutivo(siguienteConsecutivo);
        contadorAnualRepository.save(contador);

        return "%d-%03d".formatted(anio, siguienteConsecutivo);
    }
}
