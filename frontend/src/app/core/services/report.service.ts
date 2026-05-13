import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface GenerarReporteRequest {
  tipo: string;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface ReporteResponse {
  id: number;
  nombre: string;
  tipo: string;
  descripcion: string;
  fechaCreacion: string;
  usuarioId: number;
  datosJson: string;
}

export interface PlantillaReporte {
  tipo: string;
  nombre: string;
  descripcion: string;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private base = '/api/reports';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken() || ''}` });
  }

  obtenerPlantillas(): Observable<PlantillaReporte[]> {
    return this.http.get<PlantillaReporte[]>(`${this.base}/plantillas`);
  }

  listar(): Observable<ReporteResponse[]> {
    return this.http.get<ReporteResponse[]>(this.base, { headers: this.headers() });
  }

  generar(req: GenerarReporteRequest): Observable<ReporteResponse> {
    return this.http.post<ReporteResponse>(this.base, req, { headers: this.headers() });
  }

  obtener(id: number): Observable<ReporteResponse> {
    return this.http.get<ReporteResponse>(`${this.base}/${id}`, { headers: this.headers() });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`, { headers: this.headers() });
  }
}
