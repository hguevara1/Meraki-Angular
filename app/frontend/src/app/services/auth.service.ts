import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

interface UserData {
  _id: string;
  email: string;
  role: string;
  nombre: string;
  apellido: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  // private currentUserSubject = new BehaviorSubject<UserData | null>(null);
  private currentUserSubject = new ReplaySubject<UserData | null>(1);
  public authStatus$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    console.log('✅ AuthService instanciado');
    this.cleanInvalidTokens();
    this.loadUserFromStorage();
  }

  /**
   * Limpia tokens inválidos del localStorage
   */
  private cleanInvalidTokens(): void {
    const token = localStorage.getItem('authToken');

    if (token && (token === 'undefined' || token === 'null' || token.trim() === '')) {
      console.log('🧹 Limpiando token inválido');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    }
  }

  /**
   * Carga usuario desde localStorage y valida expiración del token.
   */
  public loadUserFromStorage() {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');

      if (token && userData) {
        if (this.isTokenExpired(token)) {
          this.logout(false);
          return;
        }
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      }
  }

  /**
   * Retorna observable del usuario actual.
   */
  getCurrentUser(): Observable<UserData | null> {
    return this.authStatus$;
  }

  /**
   * Retorna el usuario actual (sin observable).
   */
  getUserData(): UserData | null {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Verifica si el usuario es administrador
   */
  isAdmin(): boolean {
    const userData = this.getUserData();
    console.log('🛡️ Verificando si es admin - UserData:', userData);
    const isAdmin = userData ? userData.role === 'admin' : false;
    console.log('🛡️ Resultado isAdmin():', isAdmin);
    return isAdmin;
  }

  /**
   * Forzar recarga desde localStorage.
   */
  forceReload(): void {
    console.log('🔄 Forzando recarga de datos de autenticación');
    this.loadUserFromStorage();
  }

  /**
   * Login tradicional (correo + contraseña).
   */
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/login`, credentials).pipe(
      tap((response: any) => {
        if (response.token && response.user) {
          this.setAuthData(response.token, response.user);
        }
      })
    );
  }

  /**
   * Guarda token y datos de usuario.
   */
  private setAuthData(token: string, user: UserData) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Devuelve true si hay token y no está expirado.
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const isAuth = !!token && !this.isTokenExpired(token);
    return isAuth;
  }

  /**
   * Cierra sesión y redirige (opcional).
   */
  logout(redirect = true): void {
    console.log('🚪 Cerrando sesión...');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    this.currentUserSubject.next(null);
    if (redirect) {
      this.router.navigate(['/login']);
    }
  }

  /**
   * Devuelve el token.
   */
  getToken(): string | null {
    const token = localStorage.getItem('authToken');
    return token;
  }

  /**
   * Verifica si el token JWT ha expirado.
   */
  public isTokenExpired(token: string): boolean {
    // Verificar que el token exista y tenga el formato correcto
    if (!token || typeof token !== 'string') {
      console.warn('Token no válido o ausente');
      return true;
    }

    // Verificar que tenga el formato JWT (tres partes separadas por puntos)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Token no tiene formato JWT válido');
      return true;
    }

    try {
      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp) return false;

      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch (error) {
      console.error('Error al decodificar token para expiración:', error);
      return true; // Si falla, asumimos que está inválido
    }
  }
}
