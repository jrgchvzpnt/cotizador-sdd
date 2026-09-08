package mx.cotizador.web;

import java.util.List;
import mx.cotizador.servicio.ServicioService;
import mx.cotizador.web.dto.ServicioDto;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ServicioController {

    private final ServicioService servicioService;

    public ServicioController(ServicioService servicioService) {
        this.servicioService = servicioService;
    }

    @GetMapping("/api/servicios")
    public List<ServicioDto> listar() {
        return servicioService.listar().stream().map(ServicioDto::desde).toList();
    }

    @PostMapping("/api/servicios")
    @ResponseStatus(HttpStatus.CREATED)
    public ServicioDto crear(@RequestBody ServicioDto solicitud) {
        validar(solicitud);
        return ServicioDto.desde(servicioService.crear(solicitud.nombre(), solicitud.precioDefault()));
    }

    @PutMapping("/api/servicios/{id}")
    public ServicioDto editar(@PathVariable Long id, @RequestBody ServicioDto solicitud) {
        validar(solicitud);
        return ServicioDto.desde(servicioService.editar(id, solicitud.nombre(), solicitud.precioDefault()));
    }

    @DeleteMapping("/api/servicios/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        servicioService.eliminar(id);
    }

    private void validar(ServicioDto solicitud) {
        if (solicitud.nombre() == null || solicitud.nombre().isBlank()) {
            throw new SolicitudInvalidaException("Escribe un nombre para el servicio.");
        }
        if (solicitud.precioDefault() == null || solicitud.precioDefault().signum() < 0) {
            throw new SolicitudInvalidaException("El precio por defecto no puede ser negativo.");
        }
    }
}
