import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideTranslateService } from '@ngx-translate/core';

/**
 * APP_INITIALIZER: se ejecuta antes de que Angular arranque y antes de que el router
 * evalúe las rutas. Aquí examinamos window.location.hash para extraer token+userData
 * que el backend dejó en el fragmento: #/auth-callback?token=...&success=true
 */
export function authInitializer() {
  return () => {
    try {
      const hash = window.location.hash; // e.g. "#/auth-callback?token=xxx&success=true"
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
          // Guardar token
          localStorage.setItem('authToken', token);

          // Intentar decodificar JWT para userData (no crítico si falla)
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
          } catch (err) {
            console.warn('APP_INIT: no se pudo decodificar JWT (no crítico):', err);
          }

          // Limpiar fragmento para no dejar el token visible en la URL
          const cleanHash = hash.split('?')[0]; // => "#/auth-callback"
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
    provideHttpClient(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),
    provideAnimationsAsync(),
    provideTranslateService({
      lang: 'es',
      fallbackLang: 'es',
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json'
      })
    }),
    // Registrar APP_INITIALIZER
    {
      provide: APP_INITIALIZER,
      useFactory: authInitializer,
      multi: true
    }
  ]
};
