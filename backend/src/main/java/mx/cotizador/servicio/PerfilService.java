package mx.cotizador.servicio;

import mx.cotizador.modelo.Perfil;
import mx.cotizador.repositorio.PerfilRepository;
import org.springframework.stereotype.Service;

/** Un único registro por instalación del backend (FR-001). */
@Service
public class PerfilService {

    private final PerfilRepository perfilRepository;

    public PerfilService(PerfilRepository perfilRepository) {
        this.perfilRepository = perfilRepository;
    }

    public Perfil obtener() {
        return perfilRepository.findAll().stream().findFirst().orElse(null);
    }

    public Perfil guardar(String nombre, String correoElectronico, String telefono, String logo) {
        Perfil perfil = obtener();
        if (perfil == null) {
            perfil = new Perfil();
        }
        perfil.setNombre(nombre);
        perfil.setCorreoElectronico(correoElectronico);
        perfil.setTelefono(telefono);
        perfil.setLogo(logo);
        return perfilRepository.save(perfil);
    }
}
