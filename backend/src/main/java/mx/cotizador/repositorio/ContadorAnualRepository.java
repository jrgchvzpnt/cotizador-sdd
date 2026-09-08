package mx.cotizador.repositorio;

import mx.cotizador.modelo.ContadorAnual;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContadorAnualRepository extends JpaRepository<ContadorAnual, Integer> {
}
