import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HeaderComponent } from '../header/header.component'

// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface Torta {
  _id?: string;
  nombre: string;
  subrecetas: any[];
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-tortas',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    HeaderComponent
  ],
  templateUrl: './tortas.component.html',
  styleUrls: ['./tortas.component.css']
})
export class TortasComponent implements OnInit {
  tortas: Torta[] = [];
  displayedColumns: string[] = ['nombre', 'subrecetasCount', 'acciones'];
  isLoading: boolean = true;
  totalTortas: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarTortas();
  }

  cargarTortas() {
    this.isLoading = true;
    this.http.get<Torta[]>('http://localhost:5000/api/tortas')
      .subscribe({
        next: (data) => {
          this.tortas = data;
          this.totalTortas = data.length;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error cargando tortas:', error);
          this.isLoading = false;
        }
      });
  }

  eliminarTorta(id: string) {
    if (confirm('¿Estás seguro de eliminar esta torta?')) {
      this.http.delete(`http://localhost:5000/api/tortas/${id}`)
        .subscribe({
          next: () => {
            this.cargarTortas(); // Recargar la lista
          },
          error: (error) => {
            console.error('Error eliminando torta:', error);
          }
        });
    }
  }
}
