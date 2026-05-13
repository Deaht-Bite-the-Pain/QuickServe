import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  email = '';
  password = '';
  showPassword = false;
  loading = false;

  // Errores por campo
  errors: { email?: string; password?: string; general?: string } = {};

  // Regex de validación
  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.setAttribute('data-theme', 'dark');
  }

  ngOnDestroy() {
    document.documentElement.removeAttribute('data-theme');
    document.body.removeAttribute('data-theme');
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  // Validación campo email al perder el foco
  validateEmail() {
    const v = this.email.trim();
    if (!v) {
      this.errors.email = 'El correo electrónico es obligatorio.';
    } else if (!this.emailRegex.test(v)) {
      this.errors.email = 'Ingresá un correo con formato válido (ej: tu@correo.com).';
    } else {
      delete this.errors.email;
    }
  }

  // Validación campo password al perder el foco
  validatePassword() {
    if (!this.password) {
      this.errors.password = 'La contraseña es obligatoria.';
    } else if (this.password.length < 6) {
      this.errors.password = 'La contraseña debe tener al menos 6 caracteres.';
    } else {
      delete this.errors.password;
    }
  }

  get formValid(): boolean {
    return !this.errors.email && !this.errors.password &&
           !!this.email.trim() && !!this.password;
  }

  onLogin() {
    // Forzar validación de todos los campos antes de enviar
    this.validateEmail();
    this.validatePassword();
    delete this.errors.general;

    if (this.errors.email || this.errors.password) return;

    this.loading = true;

    this.authService.login(this.email.trim(), this.password).subscribe({
      next: () => {
        this.loading = false;
        this.authService.redirectByRol();
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 401 || err.status === 403) {
          this.errors.general = 'Credenciales incorrectas. Verificá tu correo y contraseña.';
        } else if (err.status === 0) {
          this.errors.general = 'No se pudo conectar al servidor. Verificá tu conexión.';
        } else {
          this.errors.general = 'Error inesperado. Intentá de nuevo en unos momentos.';
        }
      }
    });
  }
}
