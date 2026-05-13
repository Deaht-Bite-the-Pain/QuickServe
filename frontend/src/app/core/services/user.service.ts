import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface UserResponse {
  id: number;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'MESERO' | 'COCINERO' | 'CAJERO';
  activo: boolean;
}

export interface UserRequest {
  nombre: string;
  email: string;
  password?: string;
  rol: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {

  private readonly API = '/api/users';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  listar(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(this.API, { headers: this.headers() });
  }

  crear(user: UserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.API, user, { headers: this.headers() });
  }

  editar(id: number, user: UserRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.API}/${id}`, user, { headers: this.headers() });
  }

  cambiarEstado(id: number): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.API}/${id}/status`, {}, { headers: this.headers() });
  }
}
