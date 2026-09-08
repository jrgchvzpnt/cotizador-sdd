package mx.cotizador.repositorio;

import mx.cotizador.modelo.Perfil;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PerfilRepository extends JpaRepository<Perfil, Long> {
}
