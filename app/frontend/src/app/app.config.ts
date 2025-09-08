import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideTranslateService } from '@ngx-translate/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatIconRegistry } from '@angular/material/icon';
import { AuthInterceptor } from './interceptors/auth.interceptor';

/**
 * Función para limpiar localStorage si el token está expirado
 */
function cleanExpiredTokens(): void {
  try {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Verificar si el token está expirado
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

        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < currentTime) {
          console.log('🧹 Limpiando token expirado en app initialization');
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
        }
      } catch (error) {
        console.warn('Error verificando token durante inicialización:', error);
        // Si hay error decodificando, limpiar por seguridad
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
  } catch (error) {
    console.error('Error en cleanExpiredTokens:', error);
  }
}

/**
 * APP_INITIALIZER: se ejecuta antes de que Angular arranque
 */
export function authInitializer() {
  return () => {
    try {
      // Limpiar tokens expirados primero
      cleanExpiredTokens();

      const hash = window.location.hash;
      if (!hash) return;

      const isAuthCallback = hash.includes('auth-callback');
      const hasToken = hash.includes('token=');

      if (isAuthCallback && hasToken) {
        const queryString = hash.includes('?') ? hash.split('?')[1] : '';
        const params = new URLSearchParams(queryString);
        const token = params.get('token');
        const success = params.get('success');

        console.log('APP_INIT: auth callback detectado', { tokenPresent: !!token, success });

        if (token && success === 'true') {
          // Verificar si el token no está expirado antes de guardarlo
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

            const currentTime = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < currentTime) {
              console.log('❌ Token de callback expirado, no se guardará');
              return;
            }

            // Guardar token
            localStorage.setItem('authToken', token);

            const userData = {
              _id: payload.userId,
              email: payload.email,
              role: payload.role,
              nombre: payload.nombre || '',
              apellido: payload.apellido || ''
            };
            localStorage.setItem('userData', JSON.stringify(userData));
          } catch (err) {
            console.warn('APP_INIT: no se pudo decodificar JWT (no crítico):', err);
          }

          // Limpiar fragmento para no dejar el token visible en la URL
          const cleanHash = hash.split('?')[0];
          history.replaceState(null, '', window.location.pathname + window.location.search + cleanHash);
        }
      }
    } catch (error) {
      console.error('APP_INIT error procesando el hash de autenticación:', error);
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),
    provideAnimationsAsync(),
    provideNativeDateAdapter(),
    MatIconRegistry,
    provideTranslateService({
      lang: 'es',
      fallbackLang: 'es',
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json'
      })
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: authInitializer,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
};
