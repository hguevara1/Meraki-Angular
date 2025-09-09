import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-registrar',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './registrar.component.html',
  styleUrls: ['./registrar.component.css']
})
export class RegistrarComponent {
  registerForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  private apiUrl = environment.apiUrl;
  isSubmitting: boolean = false; // Nueva propiedad para controlar estado de envío

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4)]],
      confirmPassword: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.isSubmitting) return; // Evitar múltiples envíos

    console.log('Formulario enviado:', this.registerForm.value);

    if (this.registerForm.invalid) {
      this.errorMessage = 'Por favor completa todos los campos correctamente.';
      return;
    }

    if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.post(`${environment.apiUrl}/users/register`, this.registerForm.value)
      .subscribe({
        next: (res: any) => {
          this.successMessage = 'Usuario registrado correctamente 🎉';
          this.errorMessage = '';
          this.registerForm.reset(); // Limpiar formulario después de éxito
          Object.keys(this.registerForm.controls).forEach(key => {
            this.registerForm.get(key)?.setErrors(null);
          });
          this.isSubmitting = false;
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Error al registrar usuario';
          this.successMessage = '';
          this.isSubmitting = false;
        }
      });
  }
}
