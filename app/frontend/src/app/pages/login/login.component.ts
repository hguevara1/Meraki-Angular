import { Component } from '@angular/core';
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
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

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
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage = this.translate.instant('LOGIN.INVALID_FORM');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const loginData = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.http.post('http://localhost:5000/api/users/login', loginData)
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('userData', JSON.stringify(response.user));
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
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
    window.location.href = 'http://localhost:5000/api/auth/google';
  }

  ngOnInit() {
    // Limpiar cualquier parámetro de error en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');

    if (error) {
      this.errorMessage = this.translate.instant('LOGIN.GOOGLE_ERROR');
    }
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
      }

    } else if (error) {
      console.error('❌ Error en autenticación Google:', error);
      this.errorMessage = this.translate.instant('LOGIN.GOOGLE_ERROR');
      this.isLoading = false;

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
