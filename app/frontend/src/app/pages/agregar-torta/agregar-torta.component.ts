import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';

interface Subreceta {
  _id: string;
  nombre: string;
  ingredientes: any[];
  createdAt?: string;
  updatedAt?: string;
}

interface Torta {
  _id?: string;
  nombre: string;
  subrecetas: string[];
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-agregar-torta',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatAutocompleteModule,
    MatChipsModule
  ],
  templateUrl: './agregar-torta.component.html',
  styleUrls: ['./agregar-torta.component.css']
})
export class AgregarTortaComponent implements OnInit {
  torta: Torta = {
    nombre: '',
    subrecetas: []
  };

  subrecetasDisponibles: Subreceta[] = [];
  filteredSubrecetas!: Observable<Subreceta[]>;
  subrecetaSearchControl = new FormControl('');
  selectedSubreceta: Subreceta | null = null;

  isEditMode: boolean = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarSubrecetas();

    // Verificar si estamos en modo edición
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.cargarTorta(id);
    }

    // Configurar el filtro de autocompletado
    this.filteredSubrecetas = this.subrecetaSearchControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        if (typeof value === 'string') {
          return this._filterSubrecetas(value);
        }
        return this.subrecetasDisponibles.slice();
      })
    );
  }

  private _filterSubrecetas(value: string): Subreceta[] {
    if (!value) {
      return this.subrecetasDisponibles.slice();
    }

    const filterValue = value.toLowerCase();
    return this.subrecetasDisponibles.filter(subreceta =>
      subreceta.nombre.toLowerCase().includes(filterValue)
    );
  }

  cargarSubrecetas() {
    this.http.get<Subreceta[]>('http://localhost:5000/api/subrecetas')
      .subscribe({
        next: (data) => {
          this.subrecetasDisponibles = data;
        },
        error: (error) => {
          console.error('Error cargando subrecetas:', error);
        }
      });
  }

  cargarTorta(id: string) {
    this.http.get<Torta>(`http://localhost:5000/api/tortas/${id}`)
      .subscribe({
        next: (data) => {
          this.torta = data;
        },
        error: (error) => {
          console.error('Error cargando torta:', error);
        }
      });
  }

  displaySubreceta(subreceta: Subreceta | null): string {
    return subreceta && subreceta.nombre ? subreceta.nombre : '';
  }

  onSubrecetaSelected(event: any): void {
    const subreceta = event.option.value;
    this.selectedSubreceta = subreceta;
  }

  agregarSubreceta() {
    if (this.selectedSubreceta && !this.torta.subrecetas.includes(this.selectedSubreceta._id)) {
      this.torta.subrecetas.push(this.selectedSubreceta._id);
      this.subrecetaSearchControl.setValue('');
      this.selectedSubreceta = null;
    }
  }

  eliminarSubreceta(index: number) {
    this.torta.subrecetas.splice(index, 1);
  }

  getNombreSubreceta(subrecetaId: string): string {
    const subreceta = this.subrecetasDisponibles.find(
      s => s._id === subrecetaId
    );
    return subreceta ? subreceta.nombre : 'Subreceta no encontrada';
  }

  guardarTorta() {
    if (this.isEditMode) {
      this.http.put(`http://localhost:5000/api/tortas/${this.torta._id}`, this.torta)
        .subscribe({
          next: () => {
            this.router.navigate(['/tortas']);
          },
          error: (error) => {
            console.error('Error actualizando torta:', error);
          }
        });
    } else {
      this.http.post('http://localhost:5000/api/tortas', this.torta)
        .subscribe({
          next: () => {
            this.router.navigate(['/tortas']);
          },
          error: (error) => {
            console.error('Error creando torta:', error);
          }
        });
    }
  }
}
