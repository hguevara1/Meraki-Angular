import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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
  selector: 'app-editar-ingrediente',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    HeaderComponent
  ],
  templateUrl: './editar-ingrediente.component.html',
  styleUrls: ['./editar-ingrediente.component.css']
})
export class EditarIngredienteComponent implements OnInit {
  ingredienteForm: FormGroup;
  unidades: string[] = ['gr', 'ml', 'kg', 'lt', 'unidad', 'docena'];
  ingredienteId: string = '';
  isLoading: boolean = true;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.ingredienteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      precio: [null, [Validators.min(0)]],
      medida: [1, [Validators.required, Validators.min(0.1)]],
      unidad: ['gr', Validators.required]
    });
  }

  ngOnInit() {
    this.ingredienteId = this.route.snapshot.paramMap.get('id') || '';
    this.cargarIngrediente();
  }

  cargarIngrediente() {
    this.http.get<any>(`http://localhost:5000/api/ingredientes/${this.ingredienteId}`)
      .subscribe({
        next: (ingrediente) => {
          this.ingredienteForm.patchValue(ingrediente);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error cargando ingrediente:', error);
          this.isLoading = false;

          // Solo redirigir si es error 404, no para otros errores
          if (error.status === 404) {
            this.snackBar.open('❌ Ingrediente no encontrado', 'Cerrar', {
              duration: 3000
            });
            this.router.navigate(['/ingredientes']);
          } else {
            this.snackBar.open('❌ Error de conexión', 'Cerrar', {
              duration: 3000
            });
          }
        }
      });
  }

  onSubmit() {
    if (this.ingredienteForm.valid) {
      this.http.put(`http://localhost:5000/api/ingredientes/${this.ingredienteId}`, this.ingredienteForm.value)
        .subscribe({
          next: (response) => {
            this.snackBar.open('✅ Ingrediente actualizado correctamente', 'Cerrar', {
              duration: 3000
            });
            this.router.navigate(['/ingredientes']);
          },
          error: (error) => {
            console.error('Error actualizando ingrediente:', error);
            this.snackBar.open('❌ Error al actualizar ingrediente', 'Cerrar', {
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
