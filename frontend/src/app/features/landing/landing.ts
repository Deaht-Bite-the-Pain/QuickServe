import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuService, ProductoResponse } from '../../core/services/menu.service';
import { OrderService, SolicitudClienteRequest } from '../../core/services/order.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landing.html'
})
export class LandingComponent implements OnInit, OnDestroy {

  // ── Theme & lang ────────────────────────────────────────────────────────
  theme: 'light' | 'dark' = 'dark';
  lang: 'es' | 'en' = 'es';

  // ── Scroll ──────────────────────────────────────────────────────────────
  scrolled = false;

  // ── Menu ────────────────────────────────────────────────────────────────
  productos: ProductoResponse[] = [];
  activeCategory = 'todas';

  categories = [
    { id: 'todas',    es: 'Todas',    en: 'All'      },
    { id: 'pizzas',   es: 'Pizzas',   en: 'Pizzas'   },
    { id: 'pastas',   es: 'Pastas',   en: 'Pastas'   },
    { id: 'entradas', es: 'Entradas', en: 'Starters' },
    { id: 'postres',  es: 'Postres',  en: 'Desserts' },
    { id: 'bebidas',  es: 'Bebidas',  en: 'Drinks'   },
  ];

  // ── Cart ────────────────────────────────────────────────────────────────
  private _cartOpen = false;
  get cartOpen() { return this._cartOpen; }
  set cartOpen(val: boolean) {
    this._cartOpen = val;
    document.body.style.overflow = val ? 'hidden' : '';
  }

  cart: { [id: number]: number } = {};

  // ── Cart form ───────────────────────────────────────────────────────────
  clienteNombre = '';
  mesaAsignada = '';      // mesa asignada automáticamente por el servidor
  cartErrors: { nombre?: string } = {};
  cartStage: 'idle' | 'sending' | 'success' = 'idle';
  orderNum = '';

  // Validación de nombre: solo letras y espacios (incluye tildes y ñ)
  private readonly nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ ]+$/;

  // ── Tone map (photo placeholders) ───────────────────────────────────────
  private toneMap: Record<string, { bg: string; fg: string }> = {
    tomato:  { bg: '#f5cdb8', fg: '#c2451e' },
    cream:   { bg: '#f0e1c2', fg: '#9a6a32' },
    rose:    { bg: '#ecc8bb', fg: '#a8451f' },
    paprika: { bg: '#eebca0', fg: '#a8351a' },
    butter:  { bg: '#f1dcae', fg: '#8a6a2a' },
    ragu:    { bg: '#e6b896', fg: '#7a3a18' },
    coffee:  { bg: '#d8b894', fg: '#4a2a14' },
    lemon:   { bg: '#efdfa0', fg: '#8a7218' },
    wine:    { bg: '#d8b0b0', fg: '#7a2a30' },
  };

  // ── i18n ─────────────────────────────────────────────────────────────────
  i18n = {
    es: {
      nav: { home: 'Inicio', menu: 'Menú', features: 'Características', staff: 'Staff' },
      hero: {
        eyebrow: 'Pedidos en tiempo real · Mesa a cocina',
        title1: 'Pizzas artesanales', title2: 'directo a tu mesa',
        subtitle: 'Sin esperas. Sin meseros saturados. Pedís, elegís y tu pedido viaja a la cocina mientras seguís en la conversación.',
        cta1: 'Ordenar ahora', cta2: 'Ver el menú',
      },
      features: {
        kicker: 'Tres compromisos',
        items: [
          { num: '01', title: 'Calidad',   desc: 'Harina italiana, fermentación de 48h, ingredientes locales seleccionados cada mañana.' },
          { num: '02', title: 'Velocidad', desc: 'Tu pedido llega a la cocina en el segundo en que lo confirmás. Sin intermediarios.' },
          { num: '03', title: 'Tradición', desc: 'Recetas familiares de la Toscana, horno de leña, manos que llevan décadas amasando.' },
        ],
      },
      menu: { kicker: 'La carta', title: 'Una carta breve, hecha bien' },
      cta: { title: '¿Listo para pedir?', sub: 'Tu mesa, tu ritmo. Confirmá y nosotros nos encargamos.', btn: 'Abrir carrito' },
      cart: {
        title: 'Tu pedido',
        empty: 'Tu carrito está vacío', emptySub: 'Elegí algo de la carta y aparecerá acá.', browse: 'Ver carta',
        subtotal: 'Subtotal', service: 'Servicio', total: 'Total',
        yourName: 'Tu nombre', namePh: 'Ej. Juan Pérez',
        table: 'Seleccioná tu mesa', tableDefault: '— Elegí mesa —', tableN: 'Mesa',
        send: 'Enviar pedido a la mesa', sending: 'Enviando a cocina…',
        successTitle: '¡Pedido enviado!', successSub: 'Lo estamos preparando. Llega a tu mesa en unos minutos.',
        orderNumber: 'Pedido', newOrder: 'Hacer otro pedido',
        errName: 'Por favor, escribí tu nombre', errTable: 'Elegí el número de mesa',
      },
      footer: {
        tagline: 'Sistema de gestión de pedidos en tiempo real.',
        copy: '© 2026 QuickServe · Sistema de gestión de pedidos',
        addr: 'Av. Albert Einstein, Antiguo Cuscatlán',
        hours: 'Mar–Dom · 12:00 — 23:30',
        legal: ['Privacidad', 'Términos', 'Cookies'],
      },
    },
    en: {
      nav: { home: 'Home', menu: 'Menu', features: 'Features', staff: 'Staff' },
      hero: {
        eyebrow: 'Real-time orders · Table to kitchen',
        title1: 'Artisanal pizza', title2: 'straight to your table',
        subtitle: 'No waiting. No overworked servers. Pick, order, and your food reaches the kitchen while you stay in the conversation.',
        cta1: 'Order now', cta2: 'See the menu',
      },
      features: {
        kicker: 'Three commitments',
        items: [
          { num: '01', title: 'Quality',   desc: 'Italian flour, 48h fermentation, local ingredients sourced fresh every morning.' },
          { num: '02', title: 'Speed',     desc: 'Your order hits the kitchen the second you confirm it. No middlemen.' },
          { num: '03', title: 'Tradition', desc: 'Family recipes from Tuscany, wood-fired oven, hands that have kneaded for decades.' },
        ],
      },
      menu: { kicker: 'The menu', title: 'A short menu, done well' },
      cta: { title: 'Ready to order?', sub: 'Your table, your pace. Confirm and we take it from there.', btn: 'Open cart' },
      cart: {
        title: 'Your order',
        empty: 'Your cart is empty', emptySub: 'Pick something from the menu and it will appear here.', browse: 'Browse menu',
        subtotal: 'Subtotal', service: 'Service', total: 'Total',
        yourName: 'Your name', namePh: 'e.g. John Doe',
        table: 'Choose your table', tableDefault: '— Pick a table —', tableN: 'Table',
        send: 'Send order to my table', sending: 'Sending to kitchen…',
        successTitle: 'Order sent!', successSub: "We're preparing it. It will reach your table in a few minutes.",
        orderNumber: 'Order', newOrder: 'Place another order',
        errName: 'Please enter your name', errTable: 'Pick a table number',
      },
      footer: {
        tagline: 'Real-time order management system.',
        copy: '© 2026 QuickServe · Order management system',
        addr: 'Av. Albert Einstein, Antiguo Cuscatlán',
        hours: 'Tue–Sun · 12:00 — 23:30',
        legal: ['Privacy', 'Terms', 'Cookies'],
      },
    },
  };

  constructor(
    private menuService: MenuService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit() {
    document.body.classList.add('qs-page-active');
    this.menuService.listarDisponibles().subscribe({
      next: p => { this.productos = p; }
    });
  }

  ngOnDestroy() {
    document.body.classList.remove('qs-page-active');
    document.body.style.overflow = '';
  }

  @HostListener('window:scroll')
  onScroll() { this.scrolled = window.scrollY > 8; }

  // ── Helpers ──────────────────────────────────────────────────────────────
  get t() { return this.i18n[this.lang]; }

  toggleTheme() { this.theme = this.theme === 'dark' ? 'light' : 'dark'; }
  setLang(l: 'es' | 'en') { this.lang = l; }

  scrollTo(id: string) {
    if (id === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  irLogin() { this.router.navigate(['/login']); }

  // ── Menu ─────────────────────────────────────────────────────────────────
  setCategory(id: string) { this.activeCategory = id; }

  get filteredProductos(): ProductoResponse[] {
    if (this.activeCategory === 'todas') return this.productos;
    return this.productos.filter(p => p.categoria === this.activeCategory.toUpperCase());
  }

  getTone(categoria: string): { bg: string; fg: string } {
    const map: Record<string, string> = {
      PIZZAS: 'tomato', PASTAS: 'butter', ENTRADAS: 'cream',
      POSTRES: 'coffee', BEBIDAS: 'lemon'
    };
    return this.toneMap[map[categoria] || 'tomato'];
  }

  getImagenCategoria(categoria: string): string {
    const map: Record<string, string> = {
      PIZZAS:   'assets/menu/pizzas.jpg',
      PASTAS:   'assets/menu/pastas.jpg',
      ENTRADAS: 'assets/menu/entradas.jpg',
      POSTRES:  'assets/menu/postres.jpg',
      BEBIDAS:  'assets/menu/bebidas.jpg',
    };
    return map[categoria] || 'assets/menu/pizzas.jpg';
  }

  // ── Cart ─────────────────────────────────────────────────────────────────
  addItem(id: number) { this.cart = { ...this.cart, [id]: (this.cart[id] || 0) + 1 }; }

  removeItem(id: number) {
    if (!this.cart[id]) return;
    const next = { ...this.cart };
    if (next[id] > 1) next[id]--;
    else delete next[id];
    this.cart = next;
  }

  getQty(id: number): number { return this.cart[id] || 0; }

  get cartItems() {
    return this.productos
      .filter(p => (this.cart[p.id] || 0) > 0)
      .map(p => ({ producto: p, cantidad: this.cart[p.id] }));
  }

  get totalQty(): number {
    return Object.values(this.cart).reduce((s, q) => s + q, 0);
  }

  get subtotal(): number {
    return this.cartItems.reduce((s, i) => s + i.producto.precio * i.cantidad, 0);
  }

  get serviceFee(): number { return this.subtotal * 0.10; }
  get cartTotal(): number  { return this.subtotal + this.serviceFee; }
  get cartEmpty(): boolean  { return this.cartItems.length === 0; }

  // ── Validación de nombre ─────────────────────────────────────────────────
  validateNombre(): boolean {
    const v = this.clienteNombre.trim();
    if (!v) {
      this.cartErrors.nombre = this.t.cart.errName;
      return false;
    }
    if (v.length < 2) {
      this.cartErrors.nombre = this.lang === 'es'
        ? 'El nombre debe tener al menos 2 caracteres.'
        : 'Name must be at least 2 characters.';
      return false;
    }
    if (v.length > 80) {
      this.cartErrors.nombre = this.lang === 'es'
        ? 'El nombre no puede superar 80 caracteres.'
        : 'Name cannot exceed 80 characters.';
      return false;
    }
    if (!this.nombreRegex.test(v)) {
      this.cartErrors.nombre = this.lang === 'es'
        ? 'El nombre solo puede contener letras y espacios.'
        : 'Name can only contain letters and spaces.';
      return false;
    }
    delete this.cartErrors.nombre;
    return true;
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  submitCart() {
    this.cartErrors = {};
    if (!this.validateNombre()) return;

    this.cartStage = 'sending';

    // La mesa NO se envía — el servidor la asigna automáticamente
    const req: SolicitudClienteRequest = {
      clienteNombre: this.clienteNombre.trim(),
      detalles: this.cartItems.map(i => ({
        productoId:     i.producto.id,
        nombreProducto: i.producto.nombre,
        precioUnitario: i.producto.precio,
        cantidad:       i.cantidad
      }))
    };

    this.orderService.enviarSolicitudCliente(req).subscribe({
      next: (pedido: any) => {
        // El servidor devuelve el pedido con la mesa asignada
        this.mesaAsignada  = pedido.numeroMesa || '—';
        this.orderNum      = String(pedido.id);
        this.cartStage     = 'success';
      },
      error: (err) => {
        this.cartStage = 'idle';
        const msg = err?.error?.error;
        this.cartErrors.nombre = msg && msg.includes('mesa')
          ? msg
          : (this.lang === 'es'
              ? 'Error al enviar el pedido. Intentá de nuevo.'
              : 'Error sending order. Please try again.');
      }
    });
  }

  startNewOrder() {
    this.cartStage     = 'idle';
    this.clienteNombre = '';
    this.mesaAsignada  = '';
    this.cartErrors    = {};
    this.orderNum      = '';
    this.cart          = {};
    this.cartOpen      = false;
  }

  openCartAndBrowse() {
    this.cartOpen = false;
    setTimeout(() => this.scrollTo('menu'), 300);
  }
}
