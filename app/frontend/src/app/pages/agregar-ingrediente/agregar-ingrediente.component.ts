import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { HeaderComponent } from '../header/header.component'

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-agregar-ingrediente',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    HeaderComponent
  ],
  templateUrl: './agregar-ingrediente.component.html',
  styleUrls: ['./agregar-ingrediente.component.css']
})
export class AgregarIngredienteComponent {
  ingredienteForm: FormGroup;
  unidades: string[] = ['gr', 'ml', 'kg', 'lt', 'unidad', 'docena'];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.ingredienteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      precio: [null, [Validators.min(0)]],
      medida: [1, [Validators.required, Validators.min(0.1)]],
      unidad: ['gr', Validators.required]
    });
  }

  onSubmit() {
    if (this.ingredienteForm.valid) {
      this.http.post('http://localhost:5000/api/ingredientes', this.ingredienteForm.value)
        .subscribe({
          next: (response) => {
            this.snackBar.open('✅ Ingrediente agregado correctamente', 'Cerrar', {
              duration: 3000
            });
            this.router.navigate(['/ingredientes']);
          },
          error: (error) => {
            console.error('Error agregando ingrediente:', error);
            this.snackBar.open('❌ Error al agregar ingrediente', 'Cerrar', {
              duration: 3000
            });
          }
        });
    }
  }

  cancelar() {
    this.router.navigate(['/ingredientes']);
  }
}
