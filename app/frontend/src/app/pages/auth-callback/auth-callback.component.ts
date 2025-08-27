import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-container">
      <p>Procesando autenticación...</p>
    </div>
  `
})
export class AuthCallbackComponent implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Si APP_INITIALIZER ya guardó token, simplemente redirigimos al dashboard.
    // Si por alguna razón APP_INITIALIZER no encontró token, reintentamos parsearlo aquí.
    this.finalizeAuth();
  }

  private finalizeAuth() {
    const tokenInStorage = localStorage.getItem('authToken');
    if (tokenInStorage) {
      console.log('AuthCallback: token ya en localStorage, navegando a /dashboard');
      // Actualiza estado en AuthService si tienes una implementación reactiva
      if (this.authService && typeof this.authService.forceReload === 'function') {
        this.authService.forceReload();
      }
      this.router.navigate(['/dashboard']);
      return;
    }

    // Fallback: intentar parsear hash (si APP_INITIALIZER falló por alguna razón)
    const hash = window.location.hash;
    const queryString = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(queryString);
    const token = params.get('token');
    const success = params.get('success');

    console.log('AuthCallback fallback parse:', { tokenPresent: !!token, success });

    if (token && success === 'true') {
      localStorage.setItem('authToken', token);
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(jsonPayload);
        const userData = {
          _id: payload.userId,
          email: payload.email,
          role: payload.role,
          nombre: payload.nombre || '',
          apellido: payload.apellido || ''
        };
        localStorage.setItem('userData', JSON.stringify(userData));
      } catch (e) {
        console.warn('AuthCallback: no se pudo decodificar JWT (no crítico).', e);
      }

      if (this.authService && typeof this.authService.forceReload === 'function') {
        this.authService.forceReload();
      }
      this.router.navigate(['/dashboard']);
    } else {
      console.error('AuthCallback: no se detectó token válido. Volviendo a login.');
      this.router.navigate(['/login'], { queryParams: { error: 'auth_failed' }});
    }
  }
}
