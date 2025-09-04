// services/debug.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DebugService {
  decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  checkAuthState(): void {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');

    console.log('🔍 DEBUG - Auth State:');
    console.log('Token:', token ? 'PRESENTE' : 'AUSENTE');
    console.log('UserData:', userData);

    if (token) {
      const decoded = this.decodeToken(token);
      console.log('Decoded Token:', decoded);
      console.log('Role in Token:', decoded?.role);
    }

    if (userData) {
      const user = JSON.parse(userData);
      console.log('Role in UserData:', user?.role);
    }
  }
}
