import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface IngredienteEnSubreceta {
  ingrediente: {
    _id: string;
    nombre: string;
    precio: number | null;
    medida: number;
    unidad: string;
  };
  cantidad: number;
  costo: number;
}

export interface Subreceta {
  _id?: string;
  nombre: string;
  ingredientes: IngredienteEnSubreceta[];
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-subrecetas',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './subrecetas.component.html',
  styleUrls: ['./subrecetas.component.css']
})
export class SubrecetasComponent implements OnInit {
  subrecetas: Subreceta[] = [];
  displayedColumns: string[] = ['nombre', 'ingredientesCount', 'costoTotal', 'acciones'];
  isLoading: boolean = true;
  totalSubrecetas: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarSubrecetas();
  }

  cargarSubrecetas() {
    this.isLoading = true;
    this.http.get<Subreceta[]>('http://localhost:5000/api/subrecetas')
      .subscribe({
        next: (data) => {
          this.subrecetas = data;
          this.totalSubrecetas = data.length;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error cargando subrecetas:', error);
          this.isLoading = false;
        }
      });
  }

  calcularCostoTotal(subreceta: Subreceta): number {
    return subreceta.ingredientes.reduce((total, ingrediente) => {
      return total + (ingrediente.costo || 0);
    }, 0);
  }

  eliminarSubreceta(id: string) {
    if (confirm('¿Estás seguro de eliminar esta subreceta?')) {
      this.http.delete(`http://localhost:5000/api/subrecetas/${id}`)
        .subscribe({
          next: () => {
            this.cargarSubrecetas(); // Recargar la lista
          },
          error: (error) => {
            console.error('Error eliminando subreceta:', error);
          }
        });
    }
  }
}
