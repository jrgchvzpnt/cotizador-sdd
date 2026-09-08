package mx.cotizador.web;

import java.util.List;
import mx.cotizador.servicio.ClienteService;
import mx.cotizador.web.dto.ClienteDto;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping("/api/clientes")
    public List<ClienteDto> listar() {
        return clienteService.listar().stream().map(ClienteDto::desde).toList();
    }

    @PostMapping("/api/clientes")
    @ResponseStatus(HttpStatus.CREATED)
    public ClienteDto crear(@RequestBody ClienteDto solicitud) {
        if (solicitud.nombre() == null || solicitud.nombre().isBlank()
                || solicitud.correoElectronico() == null || solicitud.correoElectronico().isBlank()
                || solicitud.telefono() == null || solicitud.telefono().isBlank()) {
            throw new SolicitudInvalidaException("El cliente requiere nombre, correo electrónico y teléfono.");
        }
        return ClienteDto.desde(clienteService.crear(solicitud.nombre(), solicitud.correoElectronico(), solicitud.telefono()));
    }
}
