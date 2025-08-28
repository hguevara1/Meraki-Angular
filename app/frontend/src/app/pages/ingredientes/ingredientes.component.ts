import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';

// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface Ingrediente {
  _id?: string;
  nombre: string;
  precio: number | null;
  medida: number;
  unidad: string;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-ingredientes',
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
    MatProgressSpinnerModule,
    HeaderComponent
  ],
  templateUrl: './ingredientes.component.html',
  styleUrls: ['./ingredientes.component.css']
})
export class IngredientesComponent implements OnInit {
  ingredientes: Ingrediente[] = [];
  displayedColumns: string[] = ['nombre', 'precio', 'medida', 'unidad', 'acciones'];
  isLoading: boolean = true;
  totalIngredientes: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarIngredientes();
  }

  cargarIngredientes() {
    this.isLoading = true;
    this.http.get<Ingrediente[]>('http://localhost:5000/api/ingredientes')
      .subscribe({
        next: (data) => {
          this.ingredientes = data;
          this.totalIngredientes = data.length;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error cargando ingredientes:', error);
          this.isLoading = false;
        }
      });
  }

  eliminarIngrediente(id: string) {
    if (confirm('¿Estás seguro de eliminar este ingrediente?')) {
      this.http.delete(`http://localhost:5000/api/ingredientes/${id}`)
        .subscribe({
          next: () => {
            this.cargarIngredientes(); // Recargar la lista
          },
          error: (error) => {
            console.error('Error eliminando ingrediente:', error);
          }
        });
    }
  }
}
