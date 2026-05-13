import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PagoRequest {
  pedidoId: number;
  numeroMesa?: string;
  monto: number;
  metodoPago?: string;
  notas?: string;
}

export interface PagoResponse {
  id: number;
  pedidoId: number;
  numeroMesa: string;
  monto: number;
  estado: 'PENDIENTE' | 'PAGADO' | 'RECHAZADO';
  fechaCreacion: string;
  fechaPago?: string;
  metodoPago?: string;
  notas?: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private base = '/api/payments';

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token') || ''}` });
  }

  listarPendientes(): Observable<PagoResponse[]> {
    return this.http.get<PagoResponse[]>(`${this.base}/pendientes`, { headers: this.headers() });
  }

  listarTodos(): Observable<PagoResponse[]> {
    return this.http.get<PagoResponse[]>(this.base, { headers: this.headers() });
  }

  crear(req: PagoRequest): Observable<PagoResponse> {
    return this.http.post<PagoResponse>(this.base, req, { headers: this.headers() });
  }

  procesar(id: number, metodoPago: string): Observable<PagoResponse> {
    return this.http.put<PagoResponse>(`${this.base}/${id}/procesar`, { metodoPago }, { headers: this.headers() });
  }

  rechazar(id: number): Observable<PagoResponse> {
    return this.http.put<PagoResponse>(`${this.base}/${id}/rechazar`, {}, { headers: this.headers() });
  }

  obtenerPorPedido(pedidoId: number): Observable<PagoResponse> {
    return this.http.get<PagoResponse>(`${this.base}/pedido/${pedidoId}`, { headers: this.headers() });
  }
}
