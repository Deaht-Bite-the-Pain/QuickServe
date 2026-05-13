import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError(err => {
      const isAuthEndpoint = req.url.includes('/auth/login');
      // Solo hacer logout cuando el servidor dice explícitamente "no autenticado" (401)
      // No hacer logout en 403 (puede ser rol insuficiente u otro error puntual)
      if (!isAuthEndpoint && err.status === 401 && auth.getToken()) {
        auth.logout();
      }
      return throwError(() => err);
    })
  );
};
