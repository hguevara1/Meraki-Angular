import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {
    console.log('✅ AuthGuard instanciado');
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('🛡️ AuthGuard ejecutándose... state.url=', state.url);

    // Permitir siempre la ruta de callback (evita bucles y la condición de carrera)
    if (state.url && state.url.includes('auth-callback')) {
      console.log('🔓 Acceso permitido: ruta de callback');
      return true;
    }

    const token = localStorage.getItem('authToken');
    console.log('Token en localStorage:', token ? 'PRESENTE' : 'AUSENTE');
    const isAuthenticated = !!token;
    console.log('¿Autenticado?', isAuthenticated);

    if (!isAuthenticated) {
      console.error('❌ Acceso denegado - Redirigiendo a login');
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
