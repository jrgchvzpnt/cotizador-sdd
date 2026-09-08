package mx.cotizador.servicio;

import java.math.BigDecimal;
import java.util.List;
import mx.cotizador.modelo.Servicio;
import mx.cotizador.repositorio.ServicioRepository;
import mx.cotizador.web.RecursoNoEncontradoException;
import org.springframework.stereotype.Service;

/**
 * Catálogo de servicios reutilizables (FR-002). Editar o eliminar un servicio no
 * afecta líneas ya creadas, porque una línea copia la descripción y el precio.
 */
@Service
public class ServicioService {

    private final ServicioRepository servicioRepository;

    public ServicioService(ServicioRepository servicioRepository) {
        this.servicioRepository = servicioRepository;
    }

    public List<Servicio> listar() {
        return servicioRepository.findAll();
    }

    public Servicio crear(String nombre, BigDecimal precioDefault) {
        Servicio servicio = new Servicio();
        servicio.setNombre(nombre);
        servicio.setPrecioDefault(precioDefault);
        return servicioRepository.save(servicio);
    }

    public Servicio editar(Long id, String nombre, BigDecimal precioDefault) {
        Servicio servicio = servicioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("El servicio no existe."));
        servicio.setNombre(nombre);
        servicio.setPrecioDefault(precioDefault);
        return servicioRepository.save(servicio);
    }

    public void eliminar(Long id) {
        if (!servicioRepository.existsById(id)) {
            throw new RecursoNoEncontradoException("El servicio no existe.");
        }
        servicioRepository.deleteById(id);
    }
}
