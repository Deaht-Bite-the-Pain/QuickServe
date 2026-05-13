import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="qa-admin">

      <!-- ── SIDEBAR ─────────────────────────────────── -->
      <aside class="qa-side">

        <div class="qa-side-brand">
          <span class="qa-brand-name">QuickServe</span>
          <small>{{ rolLabel }}</small>
        </div>

        <nav class="qa-side-nav">
          <a *ngFor="let item of menuItems"
             [routerLink]="item.route"
             [attr.data-active]="isActive(item.route) ? 'true' : null">

            <ng-container [ngSwitch]="item.icon">

              <!-- dashboard -->
              <svg *ngSwitchCase="'dashboard'" width="16" height="16" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>

              <!-- people / usuarios -->
              <svg *ngSwitchCase="'people'" width="16" height="16" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                <circle cx="8" cy="7" r="4"/>
                <path d="M2 21v-1a7 7 0 0 1 14 0v1"/>
                <path d="M22 21v-1a5 5 0 0 0-4-4.9"/>
                <circle cx="19" cy="7" r="3"/>
              </svg>

              <!-- restaurant_menu / menú -->
              <svg *ngSwitchCase="'restaurant_menu'" width="16" height="16" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                <path d="M3 3v7a3 3 0 0 0 6 0V3M6 10v11"/>
                <path d="M21 3v18M17 3c0 3 .6 4.5 2 5V21"/>
              </svg>

              <!-- inventory_2 -->
              <svg *ngSwitchCase="'inventory_2'" width="16" height="16" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="1.5"
                   stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 8l-9-5L3 8v8l9 5 9-5V8z"/>
                <path d="M12 3v18"/>
                <path d="M3 8l9 5 9-5"/>
              </svg>

              <!-- bar_chart / reportes -->
              <svg *ngSwitchCase="'bar_chart'" width="16" height="16" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                <path d="M3 20h18"/>
                <rect x="5" y="10" width="3" height="10" rx=".5"/>
                <rect x="10.5" y="4" width="3" height="16" rx=".5"/>
                <rect x="16" y="13" width="3" height="7" rx=".5"/>
              </svg>

            </ng-container>

            {{ item.label }}
          </a>
        </nav>

        <div class="qa-side-user">
          <div class="qa-side-user-row">
            <div class="qa-avatar">{{ iniciales }}</div>
            <div class="qa-side-user-info">
              <b>{{ nombre }}</b>
              <small>{{ email }}</small>
            </div>
          </div>
        </div>

        <button class="qa-side-logout" (click)="logout()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.5"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 4h-4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M9 12h11"/>
          </svg>
          Cerrar sesión
        </button>

      </aside>

      <!-- ── MAIN CONTENT ──────────────────────────────── -->
      <main class="qa-main">
        <ng-content></ng-content>
      </main>

    </div>
  `
})
export class SidebarComponent {
  @Input() menuItems: MenuItem[] = [];
  @Input() rolLabel = '';

  nombre: string;
  email: string;
  iniciales: string;

  constructor(private auth: AuthService, private router: Router) {
    this.nombre = this.auth.getNombre() || '';
    this.email = localStorage.getItem('email') || '';
    const parts = this.nombre.trim().split(' ');
    this.iniciales = parts.map(p => p[0]).join('').substring(0, 2).toUpperCase();
  }

  isActive(route: string): boolean {
    const exact = route === '/admin';
    return this.router.isActive(route, {
      paths: exact ? 'exact' : 'subset',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored'
    });
  }

  logout() {
    this.auth.logout();
  }
}
