// Modelos que reflejan las entidades del backend (ver data-model.md).

export interface Perfil {
  id?: number;
  nombre: string;
  correoElectronico: string;
  telefono: string;
  logo?: string | null;
}

export interface Servicio {
  id: number;
  nombre: string;
  precioDefault: number;
}

export interface Cliente {
  id: number;
  nombre: string;
  correoElectronico: string;
  telefono: string;
}

export type OrigenLinea = 'CATALOGO' | 'MANUAL';

export interface LineaCotizacion {
  id?: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  origen: OrigenLinea;
  servicioId?: number | null;
}

export interface Cotizacion {
  id: number;
  numero: string;
  cliente: Cliente;
  fechaEmision: string;
  fechaValidez: string;
  lineas: LineaCotizacion[];
  baseImponible: number;
  iva: number;
  total: number;
  pdfGenerado: boolean;
}
