import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login';
import { authGuard } from './core/guards/auth.guard';
import { transitionGuard } from './core/services/transition.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/landing/landing').then(m => m.LandingComponent) },
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    canActivate: [authGuard, transitionGuard],
    loadComponent: () => import('./features/admin/admin').then(m => m.AdminComponent),
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users/users').then(m => m.UsersComponent)
      },
      {
        path: 'menu',
        loadComponent: () => import('./features/admin/menu/menu').then(m => m.MenuComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/admin/reports/reports').then(m => m.ReportsComponent)
      },
      {
        path: 'inventory',
        loadComponent: () => import('./features/admin/inventory/inventory').then(m => m.InventoryComponent)
      }
    ]
  },
  {
    path: 'waiter',
    canActivate: [authGuard, transitionGuard],
    loadComponent: () => import('./features/waiter/waiter').then(m => m.WaiterComponent)
  },
  {
    path: 'kitchen',
    canActivate: [authGuard, transitionGuard],
    loadComponent: () => import('./features/kitchen/kitchen').then(m => m.KitchenComponent)
  },
  {
    path: 'cashier',
    canActivate: [authGuard, transitionGuard],
    loadComponent: () => import('./features/cashier/cashier').then(m => m.CashierComponent)
  },
  { path: '**', redirectTo: 'login' }
];
