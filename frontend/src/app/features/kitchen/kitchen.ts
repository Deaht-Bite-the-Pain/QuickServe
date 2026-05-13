import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { OrderService, PedidoResponse } from '../../core/services/order.service';
import { WebSocketService } from '../../core/services/websocket.service';

@Component({
  selector: 'app-kitchen',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './kitchen.html'
})
export class KitchenComponent implements OnInit, OnDestroy {
  nombre: string;
  pedidos: PedidoResponse[] = [];
  horaActual = new Date();
  private reloj: any;

  constructor(
    private auth: AuthService,
    private orderService: OrderService,
    private ws: WebSocketService
  ) {
    this.nombre = this.auth.getNombre() || '';
  }

  ngOnInit() {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.setAttribute('data-theme', 'dark');
    this.cargar();
    this.reloj = setInterval(() => this.horaActual = new Date(), 1000);

    this.ws.connect(() => {
      this.ws.subscribe('/topic/cocina', (msg) => {
        const pedido: PedidoResponse = JSON.parse(msg.body);
        if (!this.pedidos.find(p => p.id === pedido.id)) {
          this.pedidos.unshift(pedido);
        }
      });
      this.ws.subscribe('/topic/pedidos', (msg) => {
        const pedido: PedidoResponse = JSON.parse(msg.body);
        const idx = this.pedidos.findIndex(p => p.id === pedido.id);
        if (idx !== -1) {
          if (['LISTO', 'ENTREGADO', 'CANCELADO'].includes(pedido.estado)) {
            this.pedidos.splice(idx, 1);
          } else {
            this.pedidos[idx] = pedido;
          }
        }
      });
    });
  }

  ngOnDestroy() {
    clearInterval(this.reloj);
    this.ws.disconnect();
    document.documentElement.removeAttribute('data-theme');
    document.body.removeAttribute('data-theme');
  }

  cargar() {
    this.orderService.listarActivos().subscribe(pedidos => {
      this.pedidos = pedidos
        .filter(p => p.estado === 'PENDIENTE' || p.estado === 'EN_PREPARACION')
        .sort((a, b) => new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime());
    });
  }

  iniciarPreparacion(pedido: PedidoResponse) {
    this.orderService.actualizarEstado(pedido.id, 'EN_PREPARACION').subscribe({
      next: (updated) => {
        const idx = this.pedidos.findIndex(p => p.id === updated.id);
        if (idx !== -1) this.pedidos[idx] = updated;
      }
    });
  }

  marcarListo(pedido: PedidoResponse) {
    this.orderService.actualizarEstado(pedido.id, 'LISTO').subscribe({
      next: () => { this.pedidos = this.pedidos.filter(p => p.id !== pedido.id); }
    });
  }

  getPendientes(): number {
    return this.pedidos.filter(p => p.estado === 'PENDIENTE').length;
  }

  getEnPreparacion(): number {
    return this.pedidos.filter(p => p.estado === 'EN_PREPARACION').length;
  }

  getMinutosTranscurridos(fecha: string): number {
    return Math.floor((Date.now() - new Date(fecha).getTime()) / 60000);
  }

  esUrgente(fecha: string): boolean {
    return this.getMinutosTranscurridos(fecha) >= 15;
  }

  getTicketStatus(pedido: PedidoResponse): string {
    return pedido.estado === 'EN_PREPARACION' ? 'cooking' : 'pending';
  }

  getElapsedClass(fecha: string): string {
    const min = this.getMinutosTranscurridos(fecha);
    if (min >= 15) return 'late';
    if (min >= 8)  return 'warn';
    return 'ok';
  }

  getEstadoBadgeStyle(estado: string): string {
    if (estado === 'EN_PREPARACION')
      return 'background:color-mix(in oklab,var(--accent) 15%,transparent);color:var(--accent);';
    return 'background:color-mix(in oklab,#d4a437 15%,transparent);color:#d4a437;';
  }

  logout() { this.auth.logout(); }
}
