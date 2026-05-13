import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DetallePedidoRequest {
  productoId: number;
  nombreProducto: string;
  precioUnitario: number;
  cantidad: number;
}

export interface PedidoRequest {
  numeroMesa: string;
  detalles: DetallePedidoRequest[];
}

export interface DetallePedidoResponse {
  id: number;
  productoId: number;
  nombreProducto: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
}

export interface SolicitudClienteRequest {
  clienteNombre: string;
  // numeroMesa ya no va en el request — el servidor la asigna automáticamente
  detalles: DetallePedidoRequest[];
}

export interface PedidoResponse {
  id: number;
  meseroId: number;
  meseroNombre: string;
  clienteNombre: string;
  numeroMesa: string;
  estado: 'SOLICITUD_CLIENTE' | 'PENDIENTE' | 'EN_PREPARACION' | 'LISTO' | 'ENTREGADO' | 'CANCELADO';
  fechaCreacion: string;
  total: number;
  detalles: DetallePedidoResponse[];
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private base = '/api/orders';

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token') || ''}` });
  }

  crear(req: PedidoRequest): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(this.base, req, { headers: this.headers() });
  }

  enviarSolicitudCliente(req: SolicitudClienteRequest): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(`${this.base}/public`, req);
  }

  aceptarSolicitud(id: number): Observable<PedidoResponse> {
    return this.http.put<PedidoResponse>(`${this.base}/${id}/aceptar`, {}, { headers: this.headers() });
  }

  listarSolicitudes(): Observable<PedidoResponse[]> {
    return this.http.get<PedidoResponse[]>(`${this.base}/estado/SOLICITUD_CLIENTE`, { headers: this.headers() });
  }

  misPedidos(): Observable<PedidoResponse[]> {
    return this.http.get<PedidoResponse[]>(`${this.base}/mis-pedidos`, { headers: this.headers() });
  }

  listarActivos(): Observable<PedidoResponse[]> {
    return this.http.get<PedidoResponse[]>(this.base, { headers: this.headers() });
  }

  actualizarEstado(id: number, estado: string): Observable<PedidoResponse> {
    return this.http.put<PedidoResponse>(`${this.base}/${id}/estado`, { estado }, { headers: this.headers() });
  }

  cancelar(id: number): Observable<PedidoResponse> {
    return this.http.put<PedidoResponse>(`${this.base}/${id}/cancelar`, {}, { headers: this.headers() });
  }
}
