package mx.cotizador.web.dto;

import mx.cotizador.modelo.Perfil;

public record PerfilDto(String nombre, String correoElectronico, String telefono, String logo) {

    public static PerfilDto desde(Perfil perfil) {
        return new PerfilDto(perfil.getNombre(), perfil.getCorreoElectronico(), perfil.getTelefono(), perfil.getLogo());
    }
}
