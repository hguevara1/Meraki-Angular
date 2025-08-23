import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api';
  private currentUserSubject = new BehaviorSubject<any>(null);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    console.log('✅ AuthService instanciado');
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');

    console.log('🔍 Buscando datos en localStorage:');
    console.log('Token:', token);
    console.log('UserData:', userData);

    if (token && userData) {
      console.log('✅ Datos de usuario encontrados en localStorage');
      this.currentUserSubject.next(JSON.parse(userData));
    } else {
      console.log('❌ No hay datos de autenticación en localStorage');
    }
  }

  // ✅ MÉTODO GET CURRENT USER (faltante)
  getCurrentUser(): Observable<any> {
    return this.currentUserSubject.asObservable();
  }

  // ✅ MÉTODO GET USER DATA (faltante)
  getUserData(): any {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  // Login tradicional
  login(credentials: {email: string, password: string}): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/login`, credentials).pipe(
      tap((response: any) => {
        if (response.token && response.user) {
          this.setAuthData(response.token, response.user);
        }
      })
    );
  }

  private setAuthData(token: string, user: any) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    const isAuth = !!token;
    console.log('🔐 isAuthenticated():', isAuth);
    return isAuth;
  }

  logout(): void {
    console.log('🚪 Cerrando sesión...');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}
