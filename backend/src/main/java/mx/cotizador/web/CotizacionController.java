package mx.cotizador.web;

import java.util.List;
import mx.cotizador.modelo.Cotizacion;
import mx.cotizador.servicio.CotizacionService;
import mx.cotizador.servicio.PdfService;
import mx.cotizador.web.dto.CambiarClienteRequest;
import mx.cotizador.web.dto.CotizacionDetalleDto;
import mx.cotizador.web.dto.CotizacionResumenDto;
import mx.cotizador.web.dto.CrearCotizacionRequest;
import mx.cotizador.web.dto.LineaRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Ver contracts/api-rest.md para el contrato completo de estos endpoints. */
@RestController
public class CotizacionController {

    private final CotizacionService cotizacionService;
    private final PdfService pdfService;

    public CotizacionController(CotizacionService cotizacionService, PdfService pdfService) {
        this.cotizacionService = cotizacionService;
        this.pdfService = pdfService;
    }

    @GetMapping("/api/cotizaciones")
    public List<CotizacionResumenDto> listar() {
        return cotizacionService.listar().stream().map(CotizacionResumenDto::desde).toList();
    }

    @PostMapping("/api/cotizaciones")
    @ResponseStatus(HttpStatus.CREATED)
    public CotizacionDetalleDto crear(@RequestBody CrearCotizacionRequest solicitud) {
        if (solicitud.clienteId() == null) {
            throw new SolicitudInvalidaException("Debes elegir o crear un cliente para la cotización.");
        }
        return CotizacionDetalleDto.desde(cotizacionService.crearBorrador(solicitud.clienteId()));
    }

    @GetMapping("/api/cotizaciones/{id}")
    public CotizacionDetalleDto obtener(@PathVariable Long id) {
        return CotizacionDetalleDto.desde(cotizacionService.obtener(id));
    }

    @PostMapping("/api/cotizaciones/{id}/lineas")
    @ResponseStatus(HttpStatus.CREATED)
    public CotizacionDetalleDto agregarLinea(@PathVariable Long id, @RequestBody LineaRequest solicitud) {
        Cotizacion actualizada = cotizacionService.agregarLinea(
                id, solicitud.descripcion(), solicitud.cantidad(), solicitud.precioUnitario(),
                solicitud.origen(), solicitud.servicioId());
        return CotizacionDetalleDto.desde(actualizada);
    }

    @PutMapping("/api/cotizaciones/{id}/lineas/{lineaId}")
    public CotizacionDetalleDto editarLinea(@PathVariable Long id, @PathVariable Long lineaId,
            @RequestBody LineaRequest solicitud) {
        Cotizacion actualizada = cotizacionService.editarLinea(
                id, lineaId, solicitud.descripcion(), solicitud.cantidad(), solicitud.precioUnitario());
        return CotizacionDetalleDto.desde(actualizada);
    }

    @DeleteMapping("/api/cotizaciones/{id}/lineas/{lineaId}")
    public CotizacionDetalleDto eliminarLinea(@PathVariable Long id, @PathVariable Long lineaId) {
        return CotizacionDetalleDto.desde(cotizacionService.eliminarLinea(id, lineaId));
    }

    @PutMapping("/api/cotizaciones/{id}/cliente")
    public CotizacionDetalleDto cambiarCliente(@PathVariable Long id, @RequestBody CambiarClienteRequest solicitud) {
        return CotizacionDetalleDto.desde(cotizacionService.cambiarCliente(id, solicitud.clienteId()));
    }

    @GetMapping("/api/cotizaciones/{id}/pdf")
    public ResponseEntity<byte[]> pdf(@PathVariable Long id) {
        Cotizacion cotizacion = cotizacionService.obtener(id);
        if (!cotizacionService.puedeGenerarPdf(cotizacion)) {
            throw new SolicitudInvalidaException("Agrega al menos una línea antes de generar el PDF.");
        }
        byte[] pdf = pdfService.generar(cotizacion);
        if (!cotizacion.isPdfGenerado()) {
            cotizacionService.marcarPdfGenerado(id);
        }
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + cotizacion.getNumero() + ".pdf\"")
                .body(pdf);
    }
}
