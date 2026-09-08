package mx.cotizador.servicio;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import mx.cotizador.modelo.Cliente;
import mx.cotizador.modelo.Cotizacion;
import mx.cotizador.modelo.LineaCotizacion;
import mx.cotizador.modelo.OrigenLinea;
import mx.cotizador.repositorio.CotizacionRepository;
import mx.cotizador.web.CotizacionBloqueadaException;
import mx.cotizador.web.RecursoNoEncontradoException;
import mx.cotizador.web.SolicitudInvalidaException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Cotizaciones: borrador editable hasta que se genera su PDF (FR-005 a FR-009, FR-012).
 * Ver data-model.md, entidades "Cotización" y "Línea de Cotización".
 */
@Service
public class CotizacionService {

    private static final int DIAS_VALIDEZ = 30;

    private final CotizacionRepository cotizacionRepository;
    private final ClienteService clienteService;
    private final CalculoService calculoService;
    private final NumeracionService numeracionService;

    public CotizacionService(
            CotizacionRepository cotizacionRepository,
            ClienteService clienteService,
            CalculoService calculoService,
            NumeracionService numeracionService) {
        this.cotizacionRepository = cotizacionRepository;
        this.clienteService = clienteService;
        this.calculoService = calculoService;
        this.numeracionService = numeracionService;
    }

    public List<Cotizacion> listar() {
        return cotizacionRepository.findAll();
    }

    public Cotizacion obtener(Long id) {
        return cotizacionRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("La cotización no existe."));
    }

    @Transactional
    public Cotizacion crearBorrador(Long clienteId) {
        Cliente cliente = clienteService.obtener(clienteId);

        LocalDate hoy = LocalDate.now();
        Cotizacion cotizacion = new Cotizacion();
        cotizacion.setCliente(cliente);
        cotizacion.setNumero(numeracionService.siguienteNumero(hoy));
        cotizacion.setFechaEmision(hoy);
        cotizacion.setFechaValidez(hoy.plusDays(DIAS_VALIDEZ));
        recalcularTotales(cotizacion);
        return cotizacionRepository.save(cotizacion);
    }

    @Transactional
    public Cotizacion agregarLinea(Long cotizacionId, String descripcion, BigDecimal cantidad,
            BigDecimal precioUnitario, OrigenLinea origen, Long servicioId) {
        Cotizacion cotizacion = obtenerBorrador(cotizacionId);
        validarLinea(descripcion, cantidad, precioUnitario);

        LineaCotizacion linea = new LineaCotizacion();
        linea.setCotizacion(cotizacion);
        linea.setDescripcion(descripcion);
        linea.setCantidad(cantidad);
        linea.setPrecioUnitario(precioUnitario);
        linea.setOrigen(origen);
        linea.setServicioId(servicioId);
        cotizacion.getLineas().add(linea);

        recalcularTotales(cotizacion);
        return cotizacionRepository.save(cotizacion);
    }

    @Transactional
    public Cotizacion editarLinea(Long cotizacionId, Long lineaId, String descripcion, BigDecimal cantidad,
            BigDecimal precioUnitario) {
        Cotizacion cotizacion = obtenerBorrador(cotizacionId);
        validarLinea(descripcion, cantidad, precioUnitario);

        LineaCotizacion linea = cotizacion.getLineas().stream()
                .filter(l -> l.getId().equals(lineaId))
                .findFirst()
                .orElseThrow(() -> new RecursoNoEncontradoException("La línea no existe."));
        linea.setDescripcion(descripcion);
        linea.setCantidad(cantidad);
        linea.setPrecioUnitario(precioUnitario);

        recalcularTotales(cotizacion);
        return cotizacionRepository.save(cotizacion);
    }

    @Transactional
    public Cotizacion eliminarLinea(Long cotizacionId, Long lineaId) {
        Cotizacion cotizacion = obtenerBorrador(cotizacionId);
        boolean eliminada = cotizacion.getLineas().removeIf(l -> l.getId().equals(lineaId));
        if (!eliminada) {
            throw new RecursoNoEncontradoException("La línea no existe.");
        }

        recalcularTotales(cotizacion);
        return cotizacionRepository.save(cotizacion);
    }

    @Transactional
    public Cotizacion cambiarCliente(Long cotizacionId, Long clienteId) {
        Cotizacion cotizacion = obtenerBorrador(cotizacionId);
        cotizacion.setCliente(clienteService.obtener(clienteId));
        return cotizacionRepository.save(cotizacion);
    }

    public boolean puedeGenerarPdf(Cotizacion cotizacion) {
        return !cotizacion.getLineas().isEmpty();
    }

    @Transactional
    public Cotizacion marcarPdfGenerado(Long cotizacionId) {
        Cotizacion cotizacion = obtener(cotizacionId);
        if (!puedeGenerarPdf(cotizacion)) {
            throw new SolicitudInvalidaException("Agrega al menos una línea antes de generar el PDF.");
        }
        cotizacion.setPdfGenerado(true);
        return cotizacionRepository.save(cotizacion);
    }

    private Cotizacion obtenerBorrador(Long cotizacionId) {
        Cotizacion cotizacion = obtener(cotizacionId);
        if (cotizacion.isPdfGenerado()) {
            throw new CotizacionBloqueadaException(
                    "Esta cotización ya fue generada y no se puede editar. Crea una cotización nueva para reflejar el cambio.");
        }
        return cotizacion;
    }

    private void validarLinea(String descripcion, BigDecimal cantidad, BigDecimal precioUnitario) {
        if (descripcion == null || descripcion.isBlank()) {
            throw new SolicitudInvalidaException("La línea necesita una descripción.");
        }
        if (cantidad == null || cantidad.signum() <= 0) {
            throw new SolicitudInvalidaException("La cantidad debe ser mayor a 0.");
        }
        if (precioUnitario == null || precioUnitario.signum() < 0) {
            throw new SolicitudInvalidaException("El precio unitario no puede ser negativo.");
        }
    }

    private void recalcularTotales(Cotizacion cotizacion) {
        BigDecimal base = calculoService.calcularBaseImponible(cotizacion.getLineas());
        BigDecimal iva = calculoService.calcularIVA(base);
        BigDecimal total = calculoService.calcularTotal(base, iva);
        cotizacion.setBaseImponible(base);
        cotizacion.setIva(iva);
        cotizacion.setTotal(total);
    }
}
