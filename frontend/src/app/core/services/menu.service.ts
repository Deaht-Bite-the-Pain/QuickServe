import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProductoResponse {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: 'PIZZAS' | 'PASTAS' | 'BEBIDAS' | 'POSTRES' | 'ENTRADAS';
  disponible: boolean;
}

export interface ProductoRequest {
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  disponible: boolean;
}

@Injectable({ providedIn: 'root' })
export class MenuService {
  private base = '/api/menu';

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  listar(): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(this.base);
  }

  listarDisponibles(): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(`${this.base}?soloDisponibles=true`, { headers: this.headers() });
  }

  crear(req: ProductoRequest): Observable<ProductoResponse> {
    return this.http.post<ProductoResponse>(this.base, req, { headers: this.headers() });
  }

  editar(id: number, req: ProductoRequest): Observable<ProductoResponse> {
    return this.http.put<ProductoResponse>(`${this.base}/${id}`, req, { headers: this.headers() });
  }

  toggleDisponibilidad(id: number): Observable<ProductoResponse> {
    return this.http.put<ProductoResponse>(`${this.base}/${id}/disponibilidad`, {}, { headers: this.headers() });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`, { headers: this.headers() });
  }
}
