import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';
import { ApiService } from '../core/api.service';

/**
 * Decide qué ve el freelancer al abrir la aplicación: si no hay nada configurado
 * todavía (perfil, catálogo, clientes ni cotizaciones), muestra la bienvenida
 * (Edge Case de la spec); si ya hay algo, va directo a "Mis Cotizaciones".
 */
@Component({
  selector: 'app-inicio',
  imports: [RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './inicio.html',
})
export class Inicio implements OnInit {
  protected readonly mostrarBienvenida = signal(false);

  constructor(private readonly api: ApiService, private readonly router: Router) {}

  ngOnInit(): void {
    forkJoin({
      perfil: this.api.obtenerPerfil(),
      servicios: this.api.listarServicios(),
      clientes: this.api.listarClientes(),
      cotizaciones: this.api.listarCotizaciones(),
    }).subscribe(({ perfil, servicios, clientes, cotizaciones }) => {
      const primerUso = !perfil && servicios.length === 0 && clientes.length === 0 && cotizaciones.length === 0;
      if (primerUso) {
        this.mostrarBienvenida.set(true);
      } else {
        this.router.navigateByUrl('/cotizaciones');
      }
    });
  }
}
