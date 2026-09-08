import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../core/api.service';
import { Servicio } from '../core/modelos';

@Component({
  selector: 'app-catalogo',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
  ],
  templateUrl: './catalogo.html',
})
export class Catalogo implements OnInit {
  protected readonly servicios = signal<Servicio[]>([]);
  protected readonly editandoId = signal<number | null>(null);

  protected nombre = '';
  protected precioDefault: number | null = null;

  constructor(private readonly api: ApiService, private readonly snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.api.listarServicios().subscribe((servicios) => this.servicios.set(servicios));
  }

  protected editar(servicio: Servicio): void {
    this.editandoId.set(servicio.id);
    this.nombre = servicio.nombre;
    this.precioDefault = servicio.precioDefault;
  }

  protected cancelar(): void {
    this.editandoId.set(null);
    this.nombre = '';
    this.precioDefault = null;
  }

  protected guardar(): void {
    if (!this.nombre.trim() || this.precioDefault === null || this.precioDefault < 0) {
      this.snackBar.open('Escribe un nombre y un precio válido (0 o mayor).', 'Cerrar', { duration: 4000 });
      return;
    }
    const datos = { nombre: this.nombre.trim(), precioDefault: this.precioDefault };
    const id = this.editandoId();
    const peticion = id ? this.api.editarServicio(id, datos) : this.api.crearServicio(datos);
    peticion.subscribe({
      next: () => {
        this.cancelar();
        this.cargar();
      },
      error: () => this.snackBar.open('Ocurrió un error inesperado. Intenta de nuevo.', 'Cerrar', { duration: 4000 }),
    });
  }

  protected eliminar(id: number): void {
    this.api.eliminarServicio(id).subscribe(() => this.cargar());
  }
}
