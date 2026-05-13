import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

export interface LoginResponse {
  token: string;
  nombre: string;
  email: string;
  rol: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly API = '/api/users/auth';

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.API}/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('nombre', res.nombre);
        localStorage.setItem('email', res.email);
        localStorage.setItem('rol', res.rol);
      })
    );
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRol(): string | null {
    return localStorage.getItem('rol');
  }

  getNombre(): string | null {
    return localStorage.getItem('nombre');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  redirectByRol() {
    const rol = this.getRol();
    if (rol === 'ADMIN') this.router.navigate(['/admin']);
    else if (rol === 'MESERO') this.router.navigate(['/waiter']);
    else if (rol === 'COCINERO') this.router.navigate(['/kitchen']);
    else if (rol === 'CAJERO') this.router.navigate(['/cashier']);
    else this.router.navigate(['/login']);
  }
}
