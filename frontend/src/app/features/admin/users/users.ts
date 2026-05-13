import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UserResponse, UserRequest } from '../../../core/services/user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html'
})
export class UsersComponent implements OnInit {
  users: UserResponse[] = [];
  filteredUsers: UserResponse[] = [];
  searchQuery = '';
  filterStatus: 'all' | 'active' | 'inactive' = 'all';

  showModal = false;
  editingUser: UserResponse | null = null;
  form: UserRequest = { nombre: '', email: '', password: '', rol: 'MESERO' };
  saving = false;

  // Errores por campo
  fieldErrors: Record<string, string> = {};

  // Regex
  private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  private nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ ]+$/;

  clearError(key: string) { delete this.fieldErrors[key]; }

  constructor(private userService: UserService) {}

  ngOnInit() { this.loadUsers(); }

  loadUsers() {
    this.userService.listar().subscribe({
      next: (users) => { this.users = users; this.applyFilters(); },
      error: () => console.error('Error cargando usuarios')
    });
  }

  applyFilters() {
    let result = this.users;
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(u =>
        u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    if (this.filterStatus === 'active')   result = result.filter(u => u.activo);
    if (this.filterStatus === 'inactive') result = result.filter(u => !u.activo);
    this.filteredUsers = result;
  }

  openCreate() {
    this.editingUser = null;
    this.form = { nombre: '', email: '', password: '', rol: 'MESERO' };
    this.fieldErrors = {};
    this.showModal = true;
  }

  openEdit(user: UserResponse) {
    this.editingUser = user;
    this.form = { nombre: user.nombre, email: user.email, password: '', rol: user.rol };
    this.fieldErrors = {};
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingUser = null;
    this.fieldErrors = {};
  }

  // ── Validaciones por campo ──────────────────────────────────────────────

  validateNombre(): boolean {
    const v = this.form.nombre?.trim() || '';
    if (!v) {
      this.fieldErrors['nombre'] = 'El nombre es obligatorio.';
    } else if (v.length < 2) {
      this.fieldErrors['nombre'] = 'El nombre debe tener al menos 2 caracteres.';
    } else if (v.length > 100) {
      this.fieldErrors['nombre'] = 'El nombre no puede superar 100 caracteres.';
    } else if (!this.nombreRegex.test(v)) {
      this.fieldErrors['nombre'] = 'Solo se permiten letras y espacios (sin números ni símbolos).';
    } else {
      delete this.fieldErrors['nombre'];
      return true;
    }
    return false;
  }

  validateEmail(): boolean {
    const v = this.form.email?.trim() || '';
    if (!v) {
      this.fieldErrors['email'] = 'El correo electrónico es obligatorio.';
    } else if (!this.emailRegex.test(v)) {
      this.fieldErrors['email'] = 'Ingresá un correo con formato válido (ej: juan@correo.com).';
    } else if (v.length > 150) {
      this.fieldErrors['email'] = 'El correo no puede superar 150 caracteres.';
    } else {
      delete this.fieldErrors['email'];
      return true;
    }
    return false;
  }

  validatePassword(): boolean {
    const v = this.form.password || '';
    // Al editar, la contraseña es opcional
    if (this.editingUser && !v) {
      delete this.fieldErrors['password'];
      return true;
    }
    if (!v) {
      this.fieldErrors['password'] = 'La contraseña es obligatoria para nuevos usuarios.';
    } else if (v.length < 8) {
      this.fieldErrors['password'] = 'La contraseña debe tener al menos 8 caracteres.';
    } else if (!/[A-Z]/.test(v)) {
      this.fieldErrors['password'] = 'Debe incluir al menos una letra mayúscula.';
    } else if (!/[0-9]/.test(v)) {
      this.fieldErrors['password'] = 'Debe incluir al menos un número.';
    } else {
      delete this.fieldErrors['password'];
      return true;
    }
    return false;
  }

  validateRol(): boolean {
    if (!this.form.rol) {
      this.fieldErrors['rol'] = 'El rol es obligatorio.';
      return false;
    }
    delete this.fieldErrors['rol'];
    return true;
  }

  get passwordStrength(): 'weak' | 'medium' | 'strong' | null {
    const v = this.form.password;
    if (!v) return null;
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Z]/.test(v)) score++;
    if (/[0-9]/.test(v)) score++;
    if (/[^a-zA-Z0-9]/.test(v)) score++;
    if (score <= 1) return 'weak';
    if (score === 2) return 'medium';
    return 'strong';
  }

  saveUser() {
    // Validar todos los campos
    const ok = [
      this.validateNombre(),
      this.validateEmail(),
      this.validatePassword(),
      this.validateRol()
    ].every(Boolean);

    if (!ok) return;

    this.saving = true;

    const request = { ...this.form, nombre: this.form.nombre.trim(), email: this.form.email.trim() };
    if (this.editingUser && !request.password) delete request.password;

    const obs = this.editingUser
      ? this.userService.editar(this.editingUser.id, request)
      : this.userService.crear(request);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.loadUsers();
      },
      error: (err) => {
        this.saving = false;
        const msg = err?.error?.message || err?.error || '';
        if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('correo')) {
          this.fieldErrors['email'] = 'Este correo ya está registrado en el sistema.';
        } else {
          this.fieldErrors['general'] = msg || 'Error al guardar el usuario. Intentá de nuevo.';
        }
      }
    });
  }

  toggleStatus(user: UserResponse) {
    this.userService.cambiarEstado(user.id).subscribe({ next: () => this.loadUsers() });
  }

  getRolLabel(rol: string): string {
    const labels: Record<string, string> = {
      ADMIN: 'Administrador', MESERO: 'Mesero', COCINERO: 'Cocinero', CAJERO: 'Cajero'
    };
    return labels[rol] || rol;
  }
}
