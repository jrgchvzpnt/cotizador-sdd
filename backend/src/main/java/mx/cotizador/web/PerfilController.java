package mx.cotizador.web;

import mx.cotizador.servicio.PerfilService;
import mx.cotizador.web.dto.PerfilDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PerfilController {

    private final PerfilService perfilService;

    public PerfilController(PerfilService perfilService) {
        this.perfilService = perfilService;
    }

    @GetMapping("/api/perfil")
    public PerfilDto obtener() {
        var perfil = perfilService.obtener();
        return perfil == null ? null : PerfilDto.desde(perfil);
    }

    @PutMapping("/api/perfil")
    public PerfilDto guardar(@RequestBody PerfilDto solicitud) {
        if (solicitud.nombre() == null || solicitud.nombre().isBlank()
                || solicitud.correoElectronico() == null || solicitud.correoElectronico().isBlank()
                || solicitud.telefono() == null || solicitud.telefono().isBlank()) {
            throw new SolicitudInvalidaException("Completa nombre, correo y teléfono antes de guardar.");
        }
        return PerfilDto.desde(perfilService.guardar(
                solicitud.nombre(), solicitud.correoElectronico(), solicitud.telefono(), solicitud.logo()));
    }
}
