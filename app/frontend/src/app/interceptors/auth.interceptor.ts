// app/frontend/src/app/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    console.log('🔐 AuthInterceptor ejecutándose para URL:', request.url);

    // 👉 Excluir rutas públicas
    if (request.url.includes('/login') || request.url.includes('/register')) {
      console.log('🚫 Ruta pública, no se agrega token');
      return next.handle(request);
    }

    const token = this.authService.getToken();
    console.log('📋 Token disponible:', token ? 'SÍ' : 'NO');

    if (token) {
      console.log('✅ Agregando token a los headers');
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    } else {
      console.log('⚠️  No hay token - Request sin autorización');
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Error HTTP:', error.status, error.url);
        if (error.status === 401) {
          console.log('🚨 Token inválido o expirado - Redirigiendo a login');
          this.authService.logout();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
