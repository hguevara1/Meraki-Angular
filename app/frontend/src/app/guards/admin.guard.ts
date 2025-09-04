// src/app/guards/admin.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    console.log('✅ AdminGuard instanciado');
  }

  canActivate(): boolean {
    console.log('🛡️ AdminGuard ejecutándose...');

    if (this.authService.isAdmin()) {
      console.log('🔓 Acceso permitido: usuario es administrador');
      return true;
    } else {
      console.log('🚫 Acceso denegado: usuario no es administrador');
      this.router.navigate(['/under-construction']);
      return false;
    }
  }
}
