import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cliente, Cotizacion, LineaCotizacion, Perfil, Servicio } from './modelos';

export interface CotizacionResumen {
  id: number;
  numero: string;
  clienteNombre: string;
  total: number;
  pdfGenerado: boolean;
}

/**
 * Única puerta de entrada del frontend al backend (ver contracts/api-rest.md).
 * Angular no calcula nada por su cuenta: todo lo que necesita lo pide aquí.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = '/api';

  constructor(private readonly http: HttpClient) {}

  // Perfil
  obtenerPerfil(): Observable<Perfil | null> {
    return this.http.get<Perfil | null>(`${this.base}/perfil`);
  }

  guardarPerfil(perfil: Perfil): Observable<Perfil> {
    return this.http.put<Perfil>(`${this.base}/perfil`, perfil);
  }

  // Servicios (catálogo)
  listarServicios(): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(`${this.base}/servicios`);
  }

  crearServicio(servicio: Partial<Servicio>): Observable<Servicio> {
    return this.http.post<Servicio>(`${this.base}/servicios`, servicio);
  }

  editarServicio(id: number, servicio: Partial<Servicio>): Observable<Servicio> {
    return this.http.put<Servicio>(`${this.base}/servicios/${id}`, servicio);
  }

  eliminarServicio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/servicios/${id}`);
  }

  // Clientes
  listarClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.base}/clientes`);
  }

  crearCliente(cliente: Partial<Cliente>): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.base}/clientes`, cliente);
  }

  // Cotizaciones
  listarCotizaciones(): Observable<CotizacionResumen[]> {
    return this.http.get<CotizacionResumen[]>(`${this.base}/cotizaciones`);
  }

  crearCotizacion(clienteId: number): Observable<Cotizacion> {
    return this.http.post<Cotizacion>(`${this.base}/cotizaciones`, { clienteId });
  }

  obtenerCotizacion(id: number): Observable<Cotizacion> {
    return this.http.get<Cotizacion>(`${this.base}/cotizaciones/${id}`);
  }

  agregarLinea(cotizacionId: number, linea: LineaCotizacion): Observable<Cotizacion> {
    return this.http.post<Cotizacion>(`${this.base}/cotizaciones/${cotizacionId}/lineas`, linea);
  }

  editarLinea(cotizacionId: number, lineaId: number, linea: Partial<LineaCotizacion>): Observable<Cotizacion> {
    return this.http.put<Cotizacion>(`${this.base}/cotizaciones/${cotizacionId}/lineas/${lineaId}`, linea);
  }

  eliminarLinea(cotizacionId: number, lineaId: number): Observable<Cotizacion> {
    return this.http.delete<Cotizacion>(`${this.base}/cotizaciones/${cotizacionId}/lineas/${lineaId}`);
  }

  cambiarClienteCotizacion(cotizacionId: number, clienteId: number): Observable<Cotizacion> {
    return this.http.put<Cotizacion>(`${this.base}/cotizaciones/${cotizacionId}/cliente`, { clienteId });
  }

  urlPdf(cotizacionId: number): string {
    return `${this.base}/cotizaciones/${cotizacionId}/pdf`;
  }

  descargarPdf(cotizacionId: number): Observable<Blob> {
    return this.http.get(this.urlPdf(cotizacionId), { responseType: 'blob' });
  }
}
