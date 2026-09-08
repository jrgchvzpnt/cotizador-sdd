package mx.cotizador.web.dto;

import mx.cotizador.modelo.Cliente;

public record ClienteDto(Long id, String nombre, String correoElectronico, String telefono) {

    public static ClienteDto desde(Cliente cliente) {
        return new ClienteDto(cliente.getId(), cliente.getNombre(), cliente.getCorreoElectronico(), cliente.getTelefono());
    }
}
