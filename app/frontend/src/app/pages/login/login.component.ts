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
    // Manejar token de Google si viene por URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      localStorage.setItem('authToken', token);
      this.router.navigate(['/dashboard']);
    }
  }
}
