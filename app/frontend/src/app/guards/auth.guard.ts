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

    // Permitir siempre la ruta de callback y login
    if (state.url.includes('auth-callback') || state.url.includes('login')) {
      console.log('🔓 Acceso permitido: ruta pública');
      return true;
    }

    const token = localStorage.getItem('authToken');

    // Verificar que el token exista y sea válido
    if (!token || token === 'undefined' || token === 'null') {
      console.error('❌ Acceso denegado - Token no válido');
      this.router.navigate(['/login']);
      return false;
    }

    // Verificar formato básico del token
    if (token.split('.').length !== 3) {
      console.error('❌ Acceso denegado - Token con formato incorrecto');
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
