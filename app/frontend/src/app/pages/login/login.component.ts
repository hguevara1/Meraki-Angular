import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateService, TranslatePipe  } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  private apiUrl = environment.apiUrl;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private translate: TranslateService,
    private http: HttpClient
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    console.log('🌐 URL del API:', this.apiUrl);
  }

  ngOnInit() {
    // Limpiar cualquier parámetro de error en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');

    if (error) {
      this.errorMessage = this.translate.instant('LOGIN.GOOGLE_ERROR');
    }

    // Verificar si hay una sesión activa y redirigir si es necesario
    this.checkExistingSession();
  }

  /**
   * Verifica si hay una sesión activa en localStorage
   * Si existe un token válido, redirige al dashboard
   */
  private checkExistingSession(): void {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
      console.log('🔍 Sesión existente encontrada en localStorage');

      // Verificar si el token es válido (no expirado)
      if (this.isTokenValid(token)) {
        console.log('✅ Token válido encontrado, redirigiendo al dashboard');
        this.router.navigate(['/dashboard']);
      } else {
        console.log('❌ Token expirado, limpiando localStorage');
        this.cleanLocalStorage();
      }
    } else {
      console.log('ℹ️ No hay sesión activa en localStorage');
      this.cleanLocalStorage(); // Asegurar que esté limpio
    }
  }

  /**
   * Verifica si un token JWT es válido (no expirado)
   */
  private isTokenValid(token: string): boolean {
    try {
      const payload = this.decodeJwt(token);
      const currentTime = Math.floor(Date.now() / 1000);

      // Verificar expiración (si existe la propiedad exp)
      if (payload.exp && payload.exp < currentTime) {
        console.log('❌ Token expirado');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error verificando token:', error);
      return false;
    }
  }

  /**
   * Limpia completamente el localStorage
   */
  private cleanLocalStorage(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    console.log('🧹 localStorage limpiado');
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage = this.translate.instant('LOGIN.INVALID_FORM');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Limpiar localStorage antes de un nuevo login
    this.cleanLocalStorage();

    const loginData = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    console.log('📤 Enviando login data:', loginData);

    this.http.post(`${environment.apiUrl}/users/login`, loginData)
      .subscribe({
        next: (response: any) => {
          console.log('✅ Login exitoso - Respuesta:', response);
          this.isLoading = false;

          // Debug: verificar el contenido de la respuesta
          console.log('🔍 Token recibido:', response.token ? 'PRESENTE' : 'AUSENTE');
          console.log('🔍 User data recibido:', response.user);
          console.log('🔍 Rol del usuario:', response.user?.role);

          localStorage.setItem('authToken', response.token);
          localStorage.setItem('userData', JSON.stringify(response.user));

          // Verificar inmediatamente después de guardar
          const storedUserData = localStorage.getItem('userData');
          console.log('💾 UserData guardado en localStorage:', storedUserData);

          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('❌ Error en login:', error);
          this.isLoading = false;
          // Limpiar localStorage en caso de error
          this.cleanLocalStorage();

          if (error.status === 400) {
            this.errorMessage = error.error?.message || this.translate.instant('LOGIN.INVALID_CREDENTIALS');
          } else if (error.status === 500) {
            this.errorMessage = this.translate.instant('LOGIN.SERVER_ERROR');
          } else {
            this.errorMessage = this.translate.instant('LOGIN.CONNECTION_ERROR');
          }
        }
      });
  }

  loginWithGoogle() {
    this.isLoading = true;
    // Limpiar localStorage antes de redirigir a Google
    this.cleanLocalStorage();
    window.location.href = `${environment.apiUrl}/auth/google`;
  }

  private handleGoogleCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    console.log('🔍 Parámetros URL recibidos:', {
      token: token ? 'PRESENTE' : 'AUSENTE',
      success,
      error
    });

    if (token && success === 'true') {
      console.log('✅ Token de Google recibido correctamente');

      // Limpiar localStorage antes de guardar nuevo token
      this.cleanLocalStorage();

      // Guardar token y datos de usuario
      localStorage.setItem('authToken', token);

      // Decodificar el token JWT para obtener los datos del usuario
      try {
        const payload = this.decodeJwt(token);
        const userData = {
          _id: payload.userId,
          email: payload.email,
          role: payload.role,
          nombre: payload.nombre || '',
          apellido: payload.apellido || ''
        };

        localStorage.setItem('userData', JSON.stringify(userData));
        console.log('👤 Datos de usuario guardados:', userData);

        // Limpiar la URL para evitar que se procese nuevamente
        window.history.replaceState({}, document.title, window.location.pathname);

        // Redirigir al dashboard
        this.router.navigate(['/dashboard']);

      } catch (decodeError) {
        console.error('❌ Error decodificando token:', decodeError);
        this.errorMessage = 'Error procesando la autenticación';
        this.isLoading = false;
        this.cleanLocalStorage();
      }

    } else if (error) {
      console.error('❌ Error en autenticación Google:', error);
      this.errorMessage = this.translate.instant('LOGIN.GOOGLE_ERROR');
      this.isLoading = false;
      this.cleanLocalStorage();

    } else {
      console.log('ℹ️ No hay parámetros de Google Auth en la URL');
      // No hay token, es un acceso normal al login
    }
  }

  private decodeJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decodificando JWT:', error);
      throw new Error('Token inválido');
    }
  }
}
