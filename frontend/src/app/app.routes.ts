import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./inicio/inicio').then((m) => m.Inicio) },
  {
    path: 'cotizaciones',
    loadComponent: () => import('./cotizaciones/cotizacion-lista/cotizacion-lista').then((m) => m.CotizacionLista),
  },
  {
    path: 'cotizaciones/nueva',
    loadComponent: () => import('./cotizaciones/cotizacion-form/cotizacion-form').then((m) => m.CotizacionForm),
  },
  {
    path: 'cotizaciones/:id',
    loadComponent: () => import('./cotizaciones/cotizacion-form/cotizacion-form').then((m) => m.CotizacionForm),
  },
  { path: 'catalogo', loadComponent: () => import('./catalogo/catalogo').then((m) => m.Catalogo) },
  { path: 'perfil', loadComponent: () => import('./perfil/perfil').then((m) => m.Perfil) },
];
