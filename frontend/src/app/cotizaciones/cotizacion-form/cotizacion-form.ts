import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { ApiService } from '../../core/api.service';
import { Cliente, Cotizacion, OrigenLinea, Servicio } from '../../core/modelos';

@Component({
  selector: 'app-cotizacion-form',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
  ],
  templateUrl: './cotizacion-form.html',
})
export class CotizacionForm implements OnInit {
  protected readonly cotizacion = signal<Cotizacion | null>(null);
  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly servicios = signal<Servicio[]>([]);
  protected readonly lineaEditandoId = signal<number | null>(null);
  protected readonly columnas = ['descripcion', 'cantidad', 'precioUnitario', 'importe', 'acciones'];

  // Formulario "elegir/crear cliente" (solo cuando aún no existe la cotización)
  protected clienteSeleccionadoId: number | null = null;
  protected nuevoClienteNombre = '';
  protected nuevoClienteCorreo = '';
  protected nuevoClienteTelefono = '';

  // Formulario "agregar línea manual"
  protected lineaDescripcion = '';
  protected lineaCantidad = 1;
  protected lineaPrecio: number | null = null;

  // Formulario "agregar desde catálogo"
  protected servicioSeleccionadoId: number | null = null;

  // Edición en línea
  protected edicionDescripcion = '';
  protected edicionCantidad = 1;
  protected edicionPrecio = 0;

  constructor(
    private readonly api: ApiService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.api.listarClientes().subscribe((clientes) => this.clientes.set(clientes));
    this.api.listarServicios().subscribe((servicios) => this.servicios.set(servicios));

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.cargarCotizacion(Number(idParam));
    }
  }

  private cargarCotizacion(id: number): void {
    this.api.obtenerCotizacion(id).subscribe((cotizacion) => this.cotizacion.set(cotizacion));
  }

  private avisar(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 4000 });
  }

  protected continuarConCliente(): void {
    if (!this.clienteSeleccionadoId) {
      this.avisar('Elige un cliente de la lista o crea uno nuevo abajo.');
      return;
    }
    this.api.crearCotizacion(this.clienteSeleccionadoId).subscribe({
      next: (cotizacion) => this.router.navigate(['/cotizaciones', cotizacion.id]),
      error: (err) => this.avisar(this.textoError(err)),
    });
  }

  protected crearClienteYContinuar(): void {
    const nombre = this.nuevoClienteNombre.trim();
    const correoElectronico = this.nuevoClienteCorreo.trim();
    const telefono = this.nuevoClienteTelefono.trim();
    if (!nombre || !correoElectronico || !telefono) {
      this.avisar('Completa nombre, correo y teléfono del cliente nuevo.');
      return;
    }
    this.api.crearCliente({ nombre, correoElectronico, telefono }).subscribe({
      next: (cliente) => {
        this.api.crearCotizacion(cliente.id).subscribe({
          next: (cotizacion) => this.router.navigate(['/cotizaciones', cotizacion.id]),
          error: (err) => this.avisar(this.textoError(err)),
        });
      },
      error: (err) => this.avisar(this.textoError(err)),
    });
  }

  protected cambiarCliente(clienteId: string): void {
    const cotizacion = this.cotizacion();
    if (!cotizacion) return;
    this.api.cambiarClienteCotizacion(cotizacion.id, Number(clienteId)).subscribe({
      next: (actualizada) => this.cotizacion.set(actualizada),
      error: (err) => this.avisar(this.textoError(err)),
    });
  }

  protected agregarLinea(): void {
    const cotizacion = this.cotizacion();
    if (!cotizacion) return;
    const descripcion = this.lineaDescripcion.trim();
    if (!descripcion || !(this.lineaCantidad > 0) || this.lineaPrecio === null || this.lineaPrecio < 0) {
      this.avisar('Escribe una descripción, una cantidad mayor a 0 y un precio válido.');
      return;
    }
    this.api
      .agregarLinea(cotizacion.id, {
        descripcion,
        cantidad: this.lineaCantidad,
        precioUnitario: this.lineaPrecio,
        origen: 'MANUAL' as OrigenLinea,
      })
      .subscribe({
        next: (actualizada) => {
          this.cotizacion.set(actualizada);
          this.lineaDescripcion = '';
          this.lineaCantidad = 1;
          this.lineaPrecio = null;
        },
        error: (err) => this.avisar(this.textoError(err)),
      });
  }

  protected agregarDesdeCatalogo(): void {
    const cotizacion = this.cotizacion();
    const servicio = this.servicios().find((s) => s.id === this.servicioSeleccionadoId);
    if (!cotizacion || !servicio) return;
    this.api
      .agregarLinea(cotizacion.id, {
        descripcion: servicio.nombre,
        cantidad: 1,
        precioUnitario: servicio.precioDefault,
        origen: 'CATALOGO' as OrigenLinea,
        servicioId: servicio.id,
      })
      .subscribe({
        next: (actualizada) => this.cotizacion.set(actualizada),
        error: (err) => this.avisar(this.textoError(err)),
      });
  }

  protected iniciarEdicion(lineaId: number): void {
    const linea = this.cotizacion()?.lineas.find((l) => l.id === lineaId);
    if (!linea) return;
    this.edicionDescripcion = linea.descripcion;
    this.edicionCantidad = linea.cantidad;
    this.edicionPrecio = linea.precioUnitario;
    this.lineaEditandoId.set(lineaId);
  }

  protected cancelarEdicion(): void {
    this.lineaEditandoId.set(null);
  }

  protected guardarEdicion(lineaId: number): void {
    const cotizacion = this.cotizacion();
    if (!cotizacion) return;
    if (!this.edicionDescripcion.trim() || !(this.edicionCantidad > 0) || this.edicionPrecio < 0) {
      this.avisar('Escribe una descripción, una cantidad mayor a 0 y un precio válido.');
      return;
    }
    this.api
      .editarLinea(cotizacion.id, lineaId, {
        descripcion: this.edicionDescripcion.trim(),
        cantidad: this.edicionCantidad,
        precioUnitario: this.edicionPrecio,
      })
      .subscribe({
        next: (actualizada) => {
          this.cotizacion.set(actualizada);
          this.lineaEditandoId.set(null);
        },
        error: (err) => this.avisar(this.textoError(err)),
      });
  }

  protected eliminarLinea(lineaId: number): void {
    const cotizacion = this.cotizacion();
    if (!cotizacion) return;
    this.api.eliminarLinea(cotizacion.id, lineaId).subscribe({
      next: (actualizada) => this.cotizacion.set(actualizada),
      error: (err) => this.avisar(this.textoError(err)),
    });
  }

  protected descargarPdf(): void {
    const cotizacion = this.cotizacion();
    if (!cotizacion || cotizacion.lineas.length === 0) return;
    this.api.descargarPdf(cotizacion.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = `${cotizacion.numero}.pdf`;
        enlace.click();
        URL.revokeObjectURL(url);
        this.cargarCotizacion(cotizacion.id);
      },
      error: (err) => this.avisar(this.textoError(err)),
    });
  }

  protected crearOtraCotizacion(): void {
    this.router.navigate(['/cotizaciones/nueva']);
  }

  protected importe(cantidad: number, precioUnitario: number): number {
    return Math.round(cantidad * precioUnitario * 100) / 100;
  }

  private textoError(err: unknown): string {
    const httpError = err as { error?: { mensaje?: string } };
    return httpError?.error?.mensaje ?? 'Ocurrió un error inesperado. Intenta de nuevo.';
  }
}
