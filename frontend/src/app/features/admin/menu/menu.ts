import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService, ProductoResponse, ProductoRequest } from '../../../core/services/menu.service';

const CATEGORIAS = ['PIZZAS', 'PASTAS', 'ENTRADAS', 'POSTRES', 'BEBIDAS'] as const;
type Categoria = typeof CATEGORIAS[number];

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu.html'
})
export class MenuComponent implements OnInit {
  productos: ProductoResponse[] = [];
  filtrados: ProductoResponse[] = [];
  searchQuery = '';
  categoriaActiva: Categoria | 'TODAS' = 'TODAS';
  categorias = CATEGORIAS;

  showModal = false;
  editando: ProductoResponse | null = null;
  form: ProductoRequest = { nombre: '', descripcion: '', precio: 0, categoria: 'PIZZAS', disponible: true };
  saving = false;

  showDeleteConfirm = false;
  deletingId: number | null = null;

  constructor(private menuService: MenuService) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.menuService.listar().subscribe({
      next: (data) => { this.productos = data; this.filtrar(); },
      error: () => console.error('Error cargando productos')
    });
  }

  filtrar() {
    let result = this.productos;
    if (this.categoriaActiva !== 'TODAS') {
      result = result.filter(p => p.categoria === this.categoriaActiva);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(p => p.nombre.toLowerCase().includes(q) || p.descripcion?.toLowerCase().includes(q));
    }
    this.filtrados = result;
  }

  setCategoriaActiva(cat: Categoria | 'TODAS') {
    this.categoriaActiva = cat;
    this.filtrar();
  }

  openCreate() {
    this.editando = null;
    this.form = { nombre: '', descripcion: '', precio: 0, categoria: 'PIZZAS', disponible: true };
    this.fieldErrors = {};
    this.showModal = true;
  }

  openEdit(p: ProductoResponse) {
    this.editando = p;
    this.form = { nombre: p.nombre, descripcion: p.descripcion, precio: p.precio, categoria: p.categoria, disponible: p.disponible };
    this.fieldErrors = {};
    this.showModal = true;
  }

  closeModal() { this.showModal = false; this.editando = null; this.fieldErrors = {}; }

  // ── Errores por campo ─────────────────────────────────────────────────
  fieldErrors: Record<string, string> = {};

  clearError(key: string) { delete this.fieldErrors[key]; }

  validateNombreProducto(): boolean {
    const v = this.form.nombre?.trim() || '';
    if (!v) {
      this.fieldErrors['nombre'] = 'El nombre del producto es obligatorio.';
    } else if (v.length < 2) {
      this.fieldErrors['nombre'] = 'Debe tener al menos 2 caracteres.';
    } else if (v.length > 100) {
      this.fieldErrors['nombre'] = 'No puede superar 100 caracteres.';
    } else {
      delete this.fieldErrors['nombre'];
      return true;
    }
    return false;
  }

  validatePrecio(): boolean {
    const v = this.form.precio;
    if (!v && v !== 0) {
      this.fieldErrors['precio'] = 'El precio es obligatorio.';
    } else if (isNaN(Number(v))) {
      this.fieldErrors['precio'] = 'El precio debe ser un número.';
    } else if (Number(v) <= 0) {
      this.fieldErrors['precio'] = 'El precio debe ser mayor a $0.00.';
    } else if (Number(v) > 9999.99) {
      this.fieldErrors['precio'] = 'El precio no puede superar $9,999.99.';
    } else {
      delete this.fieldErrors['precio'];
      return true;
    }
    return false;
  }

  validateDescripcion(): boolean {
    const v = this.form.descripcion || '';
    if (v.length > 300) {
      this.fieldErrors['descripcion'] = 'La descripción no puede superar 300 caracteres.';
      return false;
    }
    delete this.fieldErrors['descripcion'];
    return true;
  }

  validateCategoria(): boolean {
    if (!this.form.categoria) {
      this.fieldErrors['categoria'] = 'La categoría es obligatoria.';
      return false;
    }
    delete this.fieldErrors['categoria'];
    return true;
  }

  save() {
    this.fieldErrors = {};
    const ok = [
      this.validateNombreProducto(),
      this.validatePrecio(),
      this.validateDescripcion(),
      this.validateCategoria()
    ].every(Boolean);

    if (!ok) return;

    this.saving = true;
    const obs = this.editando
      ? this.menuService.editar(this.editando.id, this.form)
      : this.menuService.crear(this.form);

    obs.subscribe({
      next: () => { this.saving = false; this.closeModal(); this.cargar(); },
      error: (err) => {
        this.saving = false;
        this.fieldErrors['general'] = err?.error?.message || 'Error al guardar el producto.';
      }
    });
  }

  toggleDisponible(p: ProductoResponse) {
    this.menuService.toggleDisponibilidad(p.id).subscribe({ next: () => this.cargar() });
  }

  confirmDelete(id: number) { this.deletingId = id; this.showDeleteConfirm = true; }
  cancelDelete() { this.showDeleteConfirm = false; this.deletingId = null; }

  doDelete() {
    if (this.deletingId === null) return;
    this.menuService.eliminar(this.deletingId).subscribe({
      next: () => { this.showDeleteConfirm = false; this.deletingId = null; this.cargar(); }
    });
  }

  getCategoriaLabel(cat: string): string {
    const map: Record<string, string> = { PIZZAS: 'Pizzas', PASTAS: 'Pastas', BEBIDAS: 'Bebidas', POSTRES: 'Postres', ENTRADAS: 'Entradas' };
    return map[cat] || cat;
  }

  getCategoriaColor(cat: string): string {
    const map: Record<string, string> = {
      PIZZAS:   'bg-red-500/20 text-red-400',
      PASTAS:   'bg-yellow-500/20 text-yellow-400',
      BEBIDAS:  'bg-blue-500/20 text-blue-400',
      POSTRES:  'bg-pink-500/20 text-pink-400',
      ENTRADAS: 'bg-green-500/20 text-green-400'
    };
    return map[cat] || 'bg-neutral-500/20 text-neutral-400';
  }

  getCategoriaQaStyle(cat: string): string {
    const map: Record<string, string> = {
      PIZZAS:   'background:color-mix(in oklab,#dc2626 15%,transparent);color:#dc2626;',
      PASTAS:   'background:color-mix(in oklab,#d4a437 15%,transparent);color:#d4a437;',
      BEBIDAS:  'background:color-mix(in oklab,#3b82f6 15%,transparent);color:#3b82f6;',
      POSTRES:  'background:color-mix(in oklab,#ec4899 15%,transparent);color:#ec4899;',
      ENTRADAS: 'background:color-mix(in oklab,#16a34a 15%,transparent);color:#16a34a;',
    };
    return map[cat] || 'background:color-mix(in oklab,var(--ink-4) 15%,transparent);color:var(--ink-4);';
  }

  contarPorCategoria(cat: Categoria): number {
    return this.productos.filter(p => p.categoria === cat).length;
  }
}
