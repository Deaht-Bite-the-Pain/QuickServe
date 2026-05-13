import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ReportService, ReporteResponse, PlantillaReporte, GenerarReporteRequest } from '../../../core/services/report.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsComponent implements OnInit {

  nombre: string;
  reportes: ReporteResponse[] = [];
  plantillas: PlantillaReporte[] = [];

  showModal = false;
  generando = false;
  selectedReporte: ReporteResponse | null = null;
  datosSeleccionados: any = {};

  formTipo = '';
  formFechaInicio = '';
  formFechaFin = '';

  readonly COLORS = ['#fbc02d', '#f97316', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];

  constructor(
    private auth: AuthService,
    private reportService: ReportService,
    private cdr: ChangeDetectorRef
  ) {
    this.nombre = this.auth.getNombre() || '';
  }

  ngOnInit() {
    this.cargarReportes();
    this.cargarPlantillas();
  }

  cargarReportes() {
    this.reportService.listar().subscribe(reportes => {
      this.reportes = reportes;
      this.cdr.markForCheck();
    });
  }

  cargarPlantillas() {
    this.reportService.obtenerPlantillas().subscribe(plantillas => {
      this.plantillas = plantillas;
      this.cdr.markForCheck();
    });
  }

  abrirModal() {
    this.showModal = true;
    this.formTipo = '';
    this.formFechaInicio = '';
    this.formFechaFin = '';
  }

  cerrarModal() {
    this.showModal = false;
  }

  generarReporte() {
    if (!this.formTipo.trim()) {
      alert('Selecciona un tipo de reporte');
      return;
    }
    this.generando = true;
    const req: GenerarReporteRequest = {
      tipo: this.formTipo,
      fechaInicio: this.formFechaInicio || undefined,
      fechaFin: this.formFechaFin || undefined
    };
    this.reportService.generar(req).subscribe({
      next: (r) => {
        this.generando = false;
        this.reportes = [r, ...this.reportes];
        this.seleccionarReporte(r);
        this.cerrarModal();
        this.cdr.markForCheck();
      },
      error: () => {
        this.generando = false;
        alert('Error al generar el reporte');
        this.cdr.markForCheck();
      }
    });
  }

  seleccionarReporte(reporte: ReporteResponse) {
    this.selectedReporte = reporte;
    const raw = (reporte as any).datosJson;
    if (raw && typeof raw === 'object') {
      this.datosSeleccionados = raw;
    } else if (typeof raw === 'string' && raw.trim()) {
      try { this.datosSeleccionados = JSON.parse(raw); } catch { this.datosSeleccionados = {}; }
    } else {
      this.datosSeleccionados = {};
    }
    this.cdr.markForCheck();
  }

  eliminarReporte(id: number) {
    if (!confirm('¿Eliminar este reporte?')) return;
    this.reportService.eliminar(id).subscribe({
      next: () => {
        this.reportes = this.reportes.filter(r => r.id !== id);
        if (this.selectedReporte?.id === id) {
          this.selectedReporte = null;
          this.datosSeleccionados = {};
        }
        this.cdr.markForCheck();
      }
    });
  }

  // ── Getters para datos ──────────────────────────────────────────

  get totalVendido(): string {
    return `$${Number(this.datosSeleccionados.totalVendido ?? 0).toFixed(2)}`;
  }

  get totalPedidos(): number {
    return Number(this.datosSeleccionados.totalPedidos ?? 0);
  }

  get metodosPago(): any[] {
    return this.datosSeleccionados.metodoPago || [];
  }

  get productosTable(): any[] {
    return this.datosSeleccionados.productos || [];
  }

  get mesesTable(): any[] {
    return this.datosSeleccionados.ganancias || [];
  }

  get meseseroTable(): any[] {
    return this.datosSeleccionados.meseros || [];
  }

  get totalAcumulado(): number {
    return this.mesesTable.reduce((s: number, g: any) => s + (Number(g.total) || 0), 0);
  }

  // ── Helpers para gráficos CSS ──────────────────────────────────

  maxVal(arr: any[], key: string): number {
    const m = arr.reduce((mx, item) => Math.max(mx, Number(item[key]) || 0), 0);
    return m > 0 ? m : 1;
  }

  barPct(value: number, max: number): number {
    return max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  }

  colorFor(i: number): string {
    return this.COLORS[i % this.COLORS.length];
  }

  formatTipo(tipo: string): string {
    return (tipo || '').replace(/_/g, ' ');
  }

  trackByIndex(i: number): number { return i; }
}
