import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    console.log('✅ AuthGuard instanciado');
  }

  canActivate(): boolean {
    console.log('🛡️ AuthGuard ejecutándose...');
    console.log('¿Autenticado?', this.authService.isAuthenticated());

    if (this.authService.isAuthenticated()) {
      console.log('✅ Acceso permitido al dashboard');
      return true;
    } else {
      console.log('❌ Acceso denegado - Redirigiendo a login');
      this.router.navigate(['/login']);
      return false;
    }
  }
}
