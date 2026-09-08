import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../core/api.service';

@Component({
  selector: 'app-perfil',
  imports: [CommonModule, FormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './perfil.html',
})
export class Perfil implements OnInit {
  protected nombre = '';
  protected correoElectronico = '';
  protected telefono = '';
  protected readonly logo = signal<string | null>(null);

  @ViewChild('inputArchivo') inputArchivo?: ElementRef<HTMLInputElement>;

  constructor(private readonly api: ApiService, private readonly snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.api.obtenerPerfil().subscribe((perfil) => {
      if (!perfil) return;
      this.nombre = perfil.nombre;
      this.correoElectronico = perfil.correoElectronico;
      this.telefono = perfil.telefono;
      this.logo.set(perfil.logo ?? null);
    });
  }

  protected onArchivoSeleccionado(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;
    const lector = new FileReader();
    lector.onload = () => this.logo.set(lector.result as string);
    lector.readAsDataURL(archivo);
  }

  protected quitarLogo(): void {
    this.logo.set(null);
    if (this.inputArchivo) this.inputArchivo.nativeElement.value = '';
  }

  protected guardar(): void {
    if (!this.nombre.trim() || !this.correoElectronico.trim() || !this.telefono.trim()) {
      this.snackBar.open('Completa nombre, correo y teléfono antes de guardar.', 'Cerrar', { duration: 4000 });
      return;
    }
    this.api
      .guardarPerfil({
        nombre: this.nombre.trim(),
        correoElectronico: this.correoElectronico.trim(),
        telefono: this.telefono.trim(),
        logo: this.logo(),
      })
      .subscribe(() =>
        this.snackBar.open('Perfil guardado. Tus próximas cotizaciones saldrán con estos datos.', 'Cerrar', {
          duration: 4000,
        }),
      );
  }
}
