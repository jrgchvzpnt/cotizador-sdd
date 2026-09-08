package mx.cotizador.servicio;

import java.util.List;
import mx.cotizador.modelo.Cliente;
import mx.cotizador.repositorio.ClienteRepository;
import mx.cotizador.web.RecursoNoEncontradoException;
import org.springframework.stereotype.Service;

/** Clientes reutilizables (FR-003, SC-006). Ver data-model.md, entidad "Cliente". */
@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    public List<Cliente> listar() {
        return clienteRepository.findAll();
    }

    public Cliente crear(String nombre, String correoElectronico, String telefono) {
        Cliente cliente = new Cliente();
        cliente.setNombre(nombre);
        cliente.setCorreoElectronico(correoElectronico);
        cliente.setTelefono(telefono);
        return clienteRepository.save(cliente);
    }

    public Cliente obtener(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("El cliente no existe."));
    }
}
