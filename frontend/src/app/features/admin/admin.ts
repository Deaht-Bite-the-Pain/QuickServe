import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/layout/sidebar';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [SidebarComponent, RouterOutlet],
  template: `
    <app-sidebar [menuItems]="menu" rolLabel="Administrador">
      <router-outlet />
    </app-sidebar>
  `
})
export class AdminComponent implements OnInit, OnDestroy {
  menu = [
    { label: 'Dashboard',  icon: 'dashboard',      route: '/admin' },
    { label: 'Usuarios',   icon: 'people',          route: '/admin/users' },
    { label: 'Menú',       icon: 'restaurant_menu', route: '/admin/menu' },
    { label: 'Inventario', icon: 'inventory_2',     route: '/admin/inventory' },
    { label: 'Reportes',   icon: 'bar_chart',       route: '/admin/reports' },
  ];

  ngOnInit() {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.setAttribute('data-theme', 'dark');
  }

  ngOnDestroy() {
    document.documentElement.removeAttribute('data-theme');
    document.body.removeAttribute('data-theme');
  }
}
