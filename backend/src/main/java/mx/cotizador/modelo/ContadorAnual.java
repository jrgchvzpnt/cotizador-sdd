package mx.cotizador.modelo;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

/** Último consecutivo de cotización usado en un año, para la numeración AAAA-NNN. */
@Entity
public class ContadorAnual {

    @Id
    private Integer anio;

    private int ultimoConsecutivo;

    public ContadorAnual() {
    }

    public ContadorAnual(Integer anio, int ultimoConsecutivo) {
        this.anio = anio;
        this.ultimoConsecutivo = ultimoConsecutivo;
    }

    public Integer getAnio() {
        return anio;
    }

    public int getUltimoConsecutivo() {
        return ultimoConsecutivo;
    }

    public void setUltimoConsecutivo(int ultimoConsecutivo) {
        this.ultimoConsecutivo = ultimoConsecutivo;
    }
}
