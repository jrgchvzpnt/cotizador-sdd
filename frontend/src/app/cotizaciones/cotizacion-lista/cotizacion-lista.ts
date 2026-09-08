import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ApiService, CotizacionResumen } from '../../core/api.service';

/** FR-013: lista de cotizaciones guardadas, para abrir un borrador o crear una nueva. */
@Component({
  selector: 'app-cotizacion-lista',
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule, MatChipsModule, MatIconModule, MatListModule],
  templateUrl: './cotizacion-lista.html',
})
export class CotizacionLista implements OnInit {
  protected readonly cotizaciones = signal<CotizacionResumen[]>([]);

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.api.listarCotizaciones().subscribe((cotizaciones) =>
      this.cotizaciones.set([...cotizaciones].sort((a, b) => (a.numero < b.numero ? 1 : -1))),
    );
  }
}
