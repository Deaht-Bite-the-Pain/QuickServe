import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InsumoResponse {
  id: number;
  nombre: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  stockMinimo: number;
  bajoStock: boolean;
  fechaActualizacion: string;
}

export interface InsumoRequest {
  nombre: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  stockMinimo: number;
}

export interface AjusteStockRequest {
  cantidad: number; // positivo = entrada, negativo = salida
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private base = '/api/inventory';

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  listar(): Observable<InsumoResponse[]> {
    return this.http.get<InsumoResponse[]>(this.base, { headers: this.headers() });
  }

  obtener(id: number): Observable<InsumoResponse> {
    return this.http.get<InsumoResponse>(`${this.base}/${id}`, { headers: this.headers() });
  }

  crear(req: InsumoRequest): Observable<InsumoResponse> {
    return this.http.post<InsumoResponse>(this.base, req, { headers: this.headers() });
  }

  actualizar(id: number, req: InsumoRequest): Observable<InsumoResponse> {
    return this.http.put<InsumoResponse>(`${this.base}/${id}`, req, { headers: this.headers() });
  }

  ajustarStock(id: number, req: AjusteStockRequest): Observable<InsumoResponse> {
    return this.http.put<InsumoResponse>(`${this.base}/${id}/ajuste`, req, { headers: this.headers() });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`, { headers: this.headers() });
  }
}
