import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { PaymentService, PagoResponse } from '../../core/services/payment.service';

@Component({
  selector: 'app-cashier',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cashier.html'
})
export class CashierComponent implements OnInit, OnDestroy {
  nombre: string;
  pagos: PagoResponse[] = [];
  pagoSeleccionado: PagoResponse | null = null;
  metodoPago = 'EFECTIVO';
  procesando = false;
  mensaje = '';
  private intervalo: any;

  constructor(
    private auth: AuthService,
    private paymentService: PaymentService
  ) {
    this.nombre = this.auth.getNombre() || '';
  }

  ngOnInit() {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.setAttribute('data-theme', 'dark');
    this.cargarPagos();
    this.intervalo = setInterval(() => this.cargarPagos(), 5000);
  }

  ngOnDestroy() {
    clearInterval(this.intervalo);
    document.documentElement.removeAttribute('data-theme');
    document.body.removeAttribute('data-theme');
  }

  cargarPagos() {
    this.paymentService.listarPendientes().subscribe({
      next: p => {
        this.pagos = p.sort((a, b) =>
          new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
        );
      }
    });
  }

  seleccionar(pago: PagoResponse) {
    this.pagoSeleccionado = pago;
    this.mensaje = '';
  }

  procesarPago() {
    if (!this.pagoSeleccionado) return;
    this.procesando = true;
    this.paymentService.procesar(this.pagoSeleccionado.id, this.metodoPago).subscribe({
      next: () => {
        this.procesando = false;
        this.mensaje = `Pago procesado exitosamente`;
        this.pagoSeleccionado = null;
        this.cargarPagos();
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: () => {
        this.procesando = false;
        this.mensaje = 'Error al procesar pago';
      }
    });
  }

  rechazarPago() {
    if (!this.pagoSeleccionado) return;
    this.procesando = true;
    this.paymentService.rechazar(this.pagoSeleccionado.id).subscribe({
      next: () => {
        this.procesando = false;
        this.mensaje = 'Pago rechazado';
        this.pagoSeleccionado = null;
        this.cargarPagos();
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: () => {
        this.procesando = false;
        this.mensaje = 'Error al rechazar pago';
      }
    });
  }

  getEstadoColor(estado: string): string {
    const map: Record<string, string> = {
      PENDIENTE: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      PAGADO: 'bg-green-500/20 text-green-400 border border-green-500/30',
      RECHAZADO: 'bg-red-500/20 text-red-400 border border-red-500/30'
    };
    return map[estado] || '';
  }

  logout() {
    this.auth.logout();
  }
}
