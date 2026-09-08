package mx.cotizador.servicio;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import java.io.ByteArrayOutputStream;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.Locale;
import mx.cotizador.modelo.Cotizacion;
import mx.cotizador.modelo.LineaCotizacion;
import mx.cotizador.modelo.Perfil;
import mx.cotizador.repositorio.PerfilRepository;
import org.springframework.stereotype.Service;

/**
 * Genera el PDF de una cotización según contracts/pdf-contract.md, usando OpenPDF.
 * Se genera en el backend (no en el navegador) para no duplicar el cálculo ni el
 * formato del documento en dos lenguajes (research.md, Decisión 2).
 */
@Service
public class PdfService {

    private static final Locale ES_MX = Locale.of("es", "MX");
    private static final DateTimeFormatter FORMATO_FECHA =
            DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy", ES_MX);

    private final PerfilRepository perfilRepository;

    public PdfService(PerfilRepository perfilRepository) {
        this.perfilRepository = perfilRepository;
    }

    public byte[] generar(Cotizacion cotizacion) {
        try {
            Document documento = new Document();
            ByteArrayOutputStream salida = new ByteArrayOutputStream();
            PdfWriter.getInstance(documento, salida);
            documento.open();

            Perfil perfil = perfilRepository.findAll().stream().findFirst().orElse(null);

            escribirEncabezadoFreelancer(documento, perfil);
            escribirDatosCotizacion(documento, cotizacion);
            escribirTablaLineas(documento, cotizacion);
            escribirDesglose(documento, cotizacion);

            documento.close();
            return salida.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("No se pudo generar el PDF.", e);
        }
    }

    private void escribirEncabezadoFreelancer(Document documento, Perfil perfil) throws Exception {
        String nombre = (perfil != null && perfil.getNombre() != null) ? perfil.getNombre() : "Freelancer";
        String contacto = perfil != null ? unir(perfil.getCorreoElectronico(), perfil.getTelefono()) : "";

        boolean logoAgregado = false;
        if (perfil != null && perfil.getLogo() != null && perfil.getLogo().startsWith("data:image")) {
            try {
                String base64 = perfil.getLogo().substring(perfil.getLogo().indexOf(',') + 1);
                Image logo = Image.getInstance(Base64.getDecoder().decode(base64));
                logo.scaleToFit(80, 80);
                documento.add(logo);
                logoAgregado = true;
            } catch (Exception ignorada) {
                logoAgregado = false;
            }
        }
        // Si no hay logo, se muestra el nombre en su lugar (Aclaraciones, PA2).
        if (!logoAgregado) {
            documento.add(new Paragraph(nombre, new Font(Font.HELVETICA, 14, Font.BOLD)));
        }
        documento.add(new Paragraph(contacto));
        documento.add(new Paragraph(" "));
    }

    private void escribirDatosCotizacion(Document documento, Cotizacion cotizacion) throws Exception {
        documento.add(new Paragraph("Cotización " + cotizacion.getNumero(), new Font(Font.HELVETICA, 12, Font.BOLD)));
        documento.add(new Paragraph("Fecha de emisión: " + FORMATO_FECHA.format(cotizacion.getFechaEmision())));
        documento.add(new Paragraph("Válida hasta: " + FORMATO_FECHA.format(cotizacion.getFechaValidez())));
        documento.add(new Paragraph(" "));

        documento.add(new Paragraph("Cliente", new Font(Font.HELVETICA, 11, Font.BOLD)));
        documento.add(new Paragraph(cotizacion.getCliente().getNombre()));
        documento.add(new Paragraph(unir(cotizacion.getCliente().getCorreoElectronico(), cotizacion.getCliente().getTelefono())));
        documento.add(new Paragraph(" "));
    }

    private void escribirTablaLineas(Document documento, Cotizacion cotizacion) throws Exception {
        NumberFormat moneda = NumberFormat.getCurrencyInstance(ES_MX);
        PdfPTable tabla = new PdfPTable(4);
        tabla.setWidthPercentage(100);
        tabla.setWidths(new float[] {4, 1, 1.5f, 1.5f});

        for (String encabezado : new String[] {"Descripción", "Cant.", "Precio unit.", "Importe"}) {
            PdfPCell celda = new PdfPCell(new Paragraph(encabezado, new Font(Font.HELVETICA, 10, Font.BOLD)));
            celda.setBorderWidthBottom(1);
            celda.setBorderWidthTop(0);
            celda.setBorderWidthLeft(0);
            celda.setBorderWidthRight(0);
            tabla.addCell(celda);
        }

        for (LineaCotizacion linea : cotizacion.getLineas()) {
            var importe = linea.getCantidad().multiply(linea.getPrecioUnitario());
            tabla.addCell(celdaSinBorde(linea.getDescripcion()));
            tabla.addCell(celdaSinBorde(linea.getCantidad().stripTrailingZeros().toPlainString()));
            tabla.addCell(celdaSinBorde(moneda.format(linea.getPrecioUnitario())));
            tabla.addCell(celdaSinBorde(moneda.format(importe)));
        }

        documento.add(tabla);
        documento.add(new Paragraph(" "));
    }

    private void escribirDesglose(Document documento, Cotizacion cotizacion) throws Exception {
        NumberFormat moneda = NumberFormat.getCurrencyInstance(ES_MX);
        PdfPTable tabla = new PdfPTable(2);
        tabla.setWidthPercentage(50);
        tabla.setHorizontalAlignment(Element.ALIGN_RIGHT);

        tabla.addCell(celdaSinBorde("Base imponible"));
        tabla.addCell(celdaSinBorde(moneda.format(cotizacion.getBaseImponible())));
        tabla.addCell(celdaSinBorde("IVA (16%)"));
        tabla.addCell(celdaSinBorde(moneda.format(cotizacion.getIva())));

        Font negritaTotal = new Font(Font.HELVETICA, 12, Font.BOLD);
        PdfPCell etiquetaTotal = new PdfPCell(new Paragraph("Total a pagar", negritaTotal));
        etiquetaTotal.setBorder(0);
        PdfPCell valorTotal = new PdfPCell(new Paragraph(moneda.format(cotizacion.getTotal()), negritaTotal));
        valorTotal.setBorder(0);
        tabla.addCell(etiquetaTotal);
        tabla.addCell(valorTotal);

        documento.add(tabla);
    }

    private PdfPCell celdaSinBorde(String texto) {
        PdfPCell celda = new PdfPCell(new Paragraph(texto));
        celda.setBorder(0);
        return celda;
    }

    private String unir(String a, String b) {
        String x = a == null ? "" : a;
        String y = b == null ? "" : b;
        return (x + "  " + y).trim();
    }
}
