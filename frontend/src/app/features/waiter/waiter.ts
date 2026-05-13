import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { MenuService, ProductoResponse } from '../../core/services/menu.service';
import { OrderService, PedidoResponse, DetallePedidoRequest } from '../../core/services/order.service';
import { WebSocketService } from '../../core/services/websocket.service';
import { PaymentService } from '../../core/services/payment.service';

interface ItemCarrito {
  producto: ProductoResponse;
  cantidad: number;
}

type CategoriaFiltro = 'TODAS' | 'PIZZAS' | 'PASTAS' | 'ENTRADAS' | 'POSTRES' | 'BEBIDAS';

@Component({
  selector: 'app-waiter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './waiter.html'
})
export class WaiterComponent implements OnInit, OnDestroy {
  nombre: string;
  numeroMesa = '';
  mesas = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  categorias: CategoriaFiltro[] = ['TODAS', 'PIZZAS', 'PASTAS', 'ENTRADAS', 'POSTRES', 'BEBIDAS'];
  categoriaActiva: CategoriaFiltro = 'TODAS';

  productos: ProductoResponse[] = [];
  productosFiltrados: ProductoResponse[] = [];
  carrito: ItemCarrito[] = [];

  misPedidos: PedidoResponse[] = [];
  solicitudes: PedidoResponse[] = [];
  enviando = false;
  errorMsg = '';
  successMsg = '';
  nuevaSolicitudNotif = false;

  constructor(
    private auth: AuthService,
    private menuService: MenuService,
    private orderService: OrderService,
    private ws: WebSocketService,
    private paymentService: PaymentService
  ) {
    this.nombre = this.auth.getNombre() || '';
  }

  ngOnInit() {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.setAttribute('data-theme', 'dark');
    this.menuService.listarDisponibles().subscribe(p => {
      this.productos = p;
      this.filtrar();
    });
    this.cargarMisPedidos();
    this.cargarSolicitudes();
    this.ws.connect(() => {
      this.ws.subscribe('/topic/pedidos', (msg) => {
        const pedido: PedidoResponse = JSON.parse(msg.body);
        this.actualizarPedidoEnLista(pedido);
      });
      this.ws.subscribe('/topic/solicitudes', (msg) => {
        const solicitud: PedidoResponse = JSON.parse(msg.body);
        this.solicitudes.unshift(solicitud);
        this.nuevaSolicitudNotif = true;
        setTimeout(() => this.nuevaSolicitudNotif = false, 4000);
      });
    });
  }

  ngOnDestroy() {
    this.ws.disconnect();
    document.documentElement.removeAttribute('data-theme');
    document.body.removeAttribute('data-theme');
  }

  filtrar() {
    this.productosFiltrados = this.categoriaActiva === 'TODAS'
      ? this.productos
      : this.productos.filter(p => p.categoria === this.categoriaActiva);
  }

  setCat(cat: CategoriaFiltro) { this.categoriaActiva = cat; this.filtrar(); }

  getCantidadEnCarrito(productoId: number): number {
    return this.carrito.find(i => i.producto.id === productoId)?.cantidad ?? 0;
  }

  agregar(producto: ProductoResponse) {
    const item = this.carrito.find(i => i.producto.id === producto.id);
    if (item) item.cantidad++;
    else this.carrito.push({ producto, cantidad: 1 });
  }

  quitar(producto: ProductoResponse) {
    const idx = this.carrito.findIndex(i => i.producto.id === producto.id);
    if (idx === -1) return;
    if (this.carrito[idx].cantidad > 1) this.carrito[idx].cantidad--;
    else this.carrito.splice(idx, 1);
  }

  get totalCarrito(): number {
    return this.carrito.reduce((sum, i) => sum + i.producto.precio * i.cantidad, 0);
  }

  get carritoVacio(): boolean { return this.carrito.length === 0; }
  get totalUnidades(): number { return this.carrito.reduce((s, i) => s + i.cantidad, 0); }

  enviarPedido() {
    if (!this.numeroMesa.trim()) { this.errorMsg = 'Ingresá el número de mesa.'; return; }
    if (this.carritoVacio) { this.errorMsg = 'Agregá al menos un producto.'; return; }

    this.enviando = true;
    this.errorMsg = '';

    const detalles: DetallePedidoRequest[] = this.carrito.map(i => ({
      productoId: i.producto.id,
      nombreProducto: i.producto.nombre,
      precioUnitario: i.producto.precio,
      cantidad: i.cantidad
    }));

    this.orderService.crear({ numeroMesa: this.numeroMesa, detalles }).subscribe({
      next: (pedido) => {
        this.enviando = false;
        this.carrito = [];
        this.numeroMesa = '';
        this.successMsg = `Pedido #${pedido.id} enviado a cocina.`;
        setTimeout(() => this.successMsg = '', 3000);
        this.cargarMisPedidos();
      },
      error: () => { this.enviando = false; this.errorMsg = 'Error al enviar el pedido.'; }
    });
  }

  cargarSolicitudes() {
    this.orderService.listarSolicitudes().subscribe(s => { this.solicitudes = s; });
  }

  aceptarSolicitud(id: number) {
    this.orderService.aceptarSolicitud(id).subscribe({
      next: (pedido) => {
        this.solicitudes = this.solicitudes.filter(s => s.id !== id);
        this.misPedidos.unshift(pedido);
      }
    });
  }

  rechazarSolicitud(id: number) {
    this.orderService.cancelar(id).subscribe({
      next: () => { this.solicitudes = this.solicitudes.filter(s => s.id !== id); }
    });
  }

  cargarMisPedidos() {
    this.orderService.misPedidos().subscribe(p => {
      this.misPedidos = p.sort((a, b) =>
        new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
      );
    });
  }

  actualizarPedidoEnLista(pedido: PedidoResponse) {
    const idx = this.misPedidos.findIndex(p => p.id === pedido.id);
    if (idx !== -1) this.misPedidos[idx] = pedido;
  }

  cancelarPedido(id: number) {
    this.orderService.cancelar(id).subscribe({ next: () => this.cargarMisPedidos() });
  }

  marcarEntregado(pedido: PedidoResponse) {
    this.orderService.actualizarEstado(pedido.id, 'ENTREGADO').subscribe({
      next: (actualizado) => {
        this.actualizarPedidoEnLista(actualizado);
        // Al entregar, generar pago pendiente para el cajero
        this.paymentService.crear({
          pedidoId: pedido.id,
          numeroMesa: pedido.numeroMesa,
          monto: pedido.total
        }).subscribe({
          next: () => {
            this.successMsg = `Pedido #${pedido.id} entregado. Pago enviado a caja.`;
            setTimeout(() => this.successMsg = '', 3000);
            this.cargarMisPedidos();
          },
          error: () => {
            this.errorMsg = 'Pedido entregado pero no se pudo generar el pago.';
            setTimeout(() => this.errorMsg = '', 3000);
          }
        });
      },
      error: () => {
        this.errorMsg = 'Error al marcar como entregado.';
        setTimeout(() => this.errorMsg = '', 3000);
      }
    });
  }

  getEstadoColor(estado: string): string {
    const map: Record<string, string> = {
      PENDIENTE:      'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      EN_PREPARACION: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
      LISTO:          'bg-green-500/20 text-green-400 border border-green-500/30',
      ENTREGADO:      'bg-neutral-500/20 text-neutral-400 border border-neutral-600',
      CANCELADO:      'bg-red-500/20 text-red-400 border border-red-500/30',
    };
    return map[estado] || '';
  }

  getEstadoLabel(estado: string): string {
    const map: Record<string, string> = {
      PENDIENTE: 'Pendiente', EN_PREPARACION: 'En preparación',
      LISTO: 'Listo para entregar', ENTREGADO: 'Entregado', CANCELADO: 'Cancelado'
    };
    return map[estado] || estado;
  }

  getEstadoIcon(estado: string): string {
    const map: Record<string, string> = {
      PENDIENTE: 'schedule', EN_PREPARACION: 'restaurant',
      LISTO: 'check_circle', ENTREGADO: 'done_all', CANCELADO: 'cancel'
    };
    return map[estado] || 'help';
  }

  getCategoriaLabel(cat: string): string {
    const map: Record<string, string> = { PIZZAS: 'Pizzas', PASTAS: 'Pastas', BEBIDAS: 'Bebidas', POSTRES: 'Postres', ENTRADAS: 'Entradas', TODAS: 'Todas' };
    return map[cat] || cat;
  }

  getEstadoBadgeStyle(estado: string): string {
    const map: Record<string, string> = {
      PENDIENTE:      'background:color-mix(in oklab,#d4a437 18%,transparent);color:#d4a437;',
      EN_PREPARACION: 'background:color-mix(in oklab,var(--accent) 18%,transparent);color:var(--accent);',
      LISTO:          'background:color-mix(in oklab,#16a34a 18%,transparent);color:#16a34a;',
      ENTREGADO:      'background:color-mix(in oklab,var(--ink-4) 18%,transparent);color:var(--ink-4);',
      CANCELADO:      'background:color-mix(in oklab,#b85d3a 18%,transparent);color:#b85d3a;',
    };
    return map[estado] || '';
  }

  logout() { this.auth.logout(); }
}
