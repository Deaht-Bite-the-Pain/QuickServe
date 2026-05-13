import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService, InsumoResponse, InsumoRequest } from '../../../core/services/inventory.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryComponent implements OnInit {

  insumos: InsumoResponse[] = [];
  filteredInsumos: InsumoResponse[] = [];
  searchTerm = '';
  filterStatus = 'Todos';

  stats = { total: 0, normal: 0, bajo: 0 };

  // ── Modal Nuevo / Editar ──────────────────────────────────────
  showModalInsumo = false;
  modoEdicion = false;
  insumoEditandoId: number | null = null;
  guardando = false;
  errorForm = '';

  formNombre = '';
  formDescripcion = '';
  formUnidad = '';
  formCantidad: number | null = null;
  formStockMinimo: number | null = null;

  // ── Modal Ajustar Stock ───────────────────────────────────────
  showModalAjuste = false;
  insumoAjustando: InsumoResponse | null = null;
  ajusteTipo: 'ENTRADA' | 'SALIDA' = 'ENTRADA';
  ajusteCantidad: number | null = null;
  ajustando = false;
  errorAjuste = '';

  constructor(
    private inventoryService: InventoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarInsumos();
  }

  cargarInsumos() {
    this.inventoryService.listar().subscribe({
      next: (data) => {
        this.insumos = data;
        this.applyFilters();
        this.calcularStats();
        this.cdr.markForCheck();
      },
      error: () => this.cdr.markForCheck()
    });
  }

  calcularStats() {
    this.stats.total = this.insumos.length;
    this.stats.bajo = this.insumos.filter(i => i.bajoStock).length;
    this.stats.normal = this.stats.total - this.stats.bajo;
  }

  applyFilters() {
    this.filteredInsumos = this.insumos.filter(insumo => {
      const term = this.searchTerm.toLowerCase();
      const matchSearch = insumo.nombre.toLowerCase().includes(term) ||
                          (insumo.descripcion || '').toLowerCase().includes(term);
      const matchStatus =
        this.filterStatus === 'Todos' ||
        (this.filterStatus === 'Stock bajo' && insumo.bajoStock) ||
        (this.filterStatus === 'Stock normal' && !insumo.bajoStock);
      return matchSearch && matchStatus;
    });
  }

  onSearch()       { this.applyFilters(); }
  onFilterChange() { this.applyFilters(); }

  trackById(_: number, item: InsumoResponse) { return item.id; }

  // ── Modal Nuevo / Editar ──────────────────────────────────────

  abrirNuevo() {
    this.modoEdicion = false;
    this.insumoEditandoId = null;
    this.formNombre = '';
    this.formDescripcion = '';
    this.formUnidad = '';
    this.formCantidad = null;
    this.formStockMinimo = null;
    this.errorForm = '';
    this.showModalInsumo = true;
  }

  abrirEditar(insumo: InsumoResponse) {
    this.modoEdicion = true;
    this.insumoEditandoId = insumo.id;
    this.formNombre = insumo.nombre;
    this.formDescripcion = insumo.descripcion || '';
    this.formUnidad = insumo.unidad;
    this.formCantidad = Number(insumo.cantidad);
    this.formStockMinimo = Number(insumo.stockMinimo);
    this.errorForm = '';
    this.showModalInsumo = true;
  }

  cerrarModalInsumo() {
    this.showModalInsumo = false;
    this.guardando = false;
  }

  // ── Errores por campo ────────────────────────────────────────────────
  fieldErrors: Record<string, string> = {};

  clearError(key: string) { delete this.fieldErrors[key]; }

  private isInteger(v: number | null): boolean {
    return v !== null && Number.isInteger(v) && !isNaN(v);
  }

  validateFormInsumo(): boolean {
    this.fieldErrors = {};
    let ok = true;

    // Nombre
    const nombre = this.formNombre.trim();
    if (!nombre) {
      this.fieldErrors['nombre'] = 'El nombre es obligatorio.';
      ok = false;
    } else if (nombre.length < 2) {
      this.fieldErrors['nombre'] = 'El nombre debe tener al menos 2 caracteres.';
      ok = false;
    } else if (nombre.length > 100) {
      this.fieldErrors['nombre'] = 'El nombre no puede superar 100 caracteres.';
      ok = false;
    }

    // Unidad
    const unidad = this.formUnidad.trim();
    if (!unidad) {
      this.fieldErrors['unidad'] = 'La unidad de medida es obligatoria (ej: kg, litros, unidades).';
      ok = false;
    } else if (unidad.length > 30) {
      this.fieldErrors['unidad'] = 'La unidad no puede superar 30 caracteres.';
      ok = false;
    }

    // Cantidad inicial (solo al crear)
    if (!this.modoEdicion) {
      if (this.formCantidad === null || isNaN(Number(this.formCantidad))) {
        this.fieldErrors['cantidad'] = 'La cantidad inicial es obligatoria.';
        ok = false;
      } else if (Number(this.formCantidad) < 0) {
        this.fieldErrors['cantidad'] = 'La cantidad no puede ser negativa.';
        ok = false;
      } else if (!this.isInteger(Number(this.formCantidad))) {
        this.fieldErrors['cantidad'] = 'La cantidad debe ser un número entero.';
        ok = false;
      }
    }

    // Stock mínimo
    if (this.formStockMinimo === null || isNaN(Number(this.formStockMinimo))) {
      this.fieldErrors['stockMinimo'] = 'El stock mínimo es obligatorio.';
      ok = false;
    } else if (Number(this.formStockMinimo) < 0) {
      this.fieldErrors['stockMinimo'] = 'El stock mínimo no puede ser negativo.';
      ok = false;
    } else if (!this.isInteger(Number(this.formStockMinimo))) {
      this.fieldErrors['stockMinimo'] = 'El stock mínimo debe ser un número entero.';
      ok = false;
    }

    return ok;
  }

  guardarInsumo() {
    if (!this.validateFormInsumo()) return;

    const req: InsumoRequest = {
      nombre: this.formNombre.trim(),
      descripcion: this.formDescripcion.trim(),
      unidad: this.formUnidad.trim(),
      cantidad: this.formCantidad ?? 0,
      stockMinimo: this.formStockMinimo ?? 0
    };

    this.guardando = true;
    this.errorForm = '';

    const accion$ = this.modoEdicion
      ? this.inventoryService.actualizar(this.insumoEditandoId!, req)
      : this.inventoryService.crear(req);

    accion$.subscribe({
      next: () => {
        this.cerrarModalInsumo();
        this.cargarInsumos();
      },
      error: (err) => {
        this.guardando = false;
        this.errorForm = err?.error?.message || 'Error al guardar el insumo';
        this.cdr.markForCheck();
      }
    });
  }

  // ── Modal Ajustar Stock ───────────────────────────────────────

  abrirAjuste(insumo: InsumoResponse) {
    this.insumoAjustando = insumo;
    this.ajusteTipo = 'ENTRADA';
    this.ajusteCantidad = null;
    this.errorAjuste = '';
    this.showModalAjuste = true;
  }

  cerrarModalAjuste() {
    this.showModalAjuste = false;
    this.ajustando = false;
  }

  get nuevaCantidad(): number {
    if (!this.insumoAjustando || this.ajusteCantidad === null) return Number(this.insumoAjustando?.cantidad ?? 0);
    const delta = this.ajusteTipo === 'ENTRADA' ? this.ajusteCantidad : -this.ajusteCantidad;
    return Number(this.insumoAjustando.cantidad) + delta;
  }

  confirmarAjuste() {
    if (this.ajusteCantidad === null || isNaN(Number(this.ajusteCantidad))) {
      this.errorAjuste = 'Ingresá una cantidad.';
      return;
    }
    if (Number(this.ajusteCantidad) <= 0) {
      this.errorAjuste = 'La cantidad debe ser mayor a 0.';
      return;
    }
    if (!Number.isInteger(Number(this.ajusteCantidad))) {
      this.errorAjuste = 'La cantidad debe ser un número entero.';
      return;
    }
    if (Number(this.ajusteCantidad) > 99999) {
      this.errorAjuste = 'La cantidad no puede superar 99,999 unidades.';
      return;
    }
    if (this.nuevaCantidad < 0) {
      this.errorAjuste = `Stock insuficiente. Solo hay ${this.insumoAjustando?.cantidad} unidades disponibles.`;
      return;
    }

    const delta = this.ajusteTipo === 'ENTRADA' ? this.ajusteCantidad : -this.ajusteCantidad;
    this.ajustando = true;
    this.errorAjuste = '';

    this.inventoryService.ajustarStock(this.insumoAjustando!.id, { cantidad: delta }).subscribe({
      next: () => {
        this.cerrarModalAjuste();
        this.cargarInsumos();
      },
      error: (err) => {
        this.ajustando = false;
        this.errorAjuste = err?.error?.message || 'Error al ajustar el stock';
        this.cdr.markForCheck();
      }
    });
  }

  // ── Eliminar ──────────────────────────────────────────────────

  eliminarInsumo(id: number) {
    if (!confirm('¿Eliminar este insumo? Esta acción no se puede deshacer.')) return;
    this.inventoryService.eliminar(id).subscribe({
      next: () => this.cargarInsumos(),
      error: () => alert('No se pudo eliminar el insumo')
    });
  }
}
