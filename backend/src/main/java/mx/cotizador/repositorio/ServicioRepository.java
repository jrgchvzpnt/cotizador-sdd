package mx.cotizador.repositorio;

import mx.cotizador.modelo.Servicio;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServicioRepository extends JpaRepository<Servicio, Long> {
}
