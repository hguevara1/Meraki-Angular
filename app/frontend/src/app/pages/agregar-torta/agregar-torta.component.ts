import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { HeaderComponent } from '../header/header.component';

import { environment } from '../../../environments/environment';

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
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';

interface IngredienteEnSubreceta {
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

interface Subreceta {
  _id: string;
  nombre: string;
  ingredientes: IngredienteEnSubreceta[];
  createdAt?: string;
  updatedAt?: string;
  costoTotal?: number;
}

interface Torta {
  _id?: string;
  nombre: string;
  subrecetas: string[];
  videoUrl?: string;
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
    MatChipsModule,
    MatExpansionModule,
    MatListModule,
    HeaderComponent
  ],
  templateUrl: './agregar-torta.component.html',
  styleUrls: ['./agregar-torta.component.css']
})
export class AgregarTortaComponent implements OnInit {
  torta: Torta = {
    nombre: '',
    subrecetas: [],
    videoUrl: ''
  };
  private apiUrl = environment.apiUrl;

  subrecetasDisponibles: Subreceta[] = [];
  filteredSubrecetas!: Observable<Subreceta[]>;
  subrecetaSearchControl = new FormControl('');
  selectedSubreceta: Subreceta | null = null;
  previewSubreceta: Subreceta | null = null;

  isEditMode: boolean = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('🔵 AgregarTortaComponent ngOnInit - Iniciando');
    this.cargarSubrecetas();

    // Verificar si estamos en modo edición
    const id = this.route.snapshot.paramMap.get('id');
    console.log('🆔 ID de torta desde ruta:', id);

    if (id) {
      this.isEditMode = true;
      console.log('📝 Modo edición activado');
      this.cargarTorta(id);
    } else {
      console.log('➕ Modo creación activado');
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

    // Suscribirse a cambios en el control de búsqueda para mostrar preview
    this.subrecetaSearchControl.valueChanges.subscribe(value => {
      console.log('🔍 Valor de búsqueda cambiado:', value);
      if (typeof value === 'string' && value.trim() !== '') {
        const subrecetaEncontrada = this.subrecetasDisponibles.find(
          s => s.nombre.toLowerCase().includes(value.toLowerCase())
        );
        console.log('🔎 Subreceta encontrada en búsqueda:', subrecetaEncontrada);
        this.previewSubreceta = subrecetaEncontrada || null;
      } else {
        this.previewSubreceta = null;
      }
    });
  }

  private _filterSubrecetas(value: string): Subreceta[] {
    console.log('🔎 Filtrando subrecetas con valor:', value);
    if (!value) {
      return this.subrecetasDisponibles.slice();
    }

    const filterValue = value.toLowerCase();
    const filtered = this.subrecetasDisponibles.filter(subreceta =>
      subreceta.nombre.toLowerCase().includes(filterValue)
    );
    console.log('✅ Subrecetas filtradas:', filtered.length);
    return filtered;
  }

  cargarSubrecetas() {
    console.log('🔄 Cargando subrecetas desde API...');
    this.http.get<Subreceta[]>(`${environment.apiUrl}/subrecetas`)
      .subscribe({
        next: (data) => {
          console.log('✅ Subrecetas cargadas correctamente:', data.length);
          console.log('📋 Datos de subrecetas:', data);

          this.subrecetasDisponibles = data.map(subreceta => ({
            ...subreceta,
            costoTotal: this.calcularCostoTotalSubreceta(subreceta)
          }));

          console.log('📊 Subrecetas disponibles procesadas:', this.subrecetasDisponibles.length);
          console.log('📝 Detalles subrecetas:', this.subrecetasDisponibles);

          // Si estamos en modo edición, verificar match de subrecetas
          if (this.isEditMode && this.torta.subrecetas.length > 0) {
            console.log('🔍 Verificando match de subrecetas en modo edición...');
            this.torta.subrecetas.forEach(subrecetaId => {
              const encontrada = this.subrecetasDisponibles.find(s => s._id === subrecetaId);
              console.log(`📌 Subreceta ID: ${subrecetaId}, Encontrada:`, encontrada ? encontrada.nombre : 'NO ENCONTRADA');
            });
          }
        },
        error: (error) => {
          console.error('❌ Error cargando subrecetas:', error);
        }
      });
  }

  calcularCostoTotalSubreceta(subreceta: Subreceta): number {
    const costo = subreceta.ingredientes.reduce((total, ingrediente) => {
      return total + (ingrediente.costo || 0);
    }, 0);
    console.log(`💰 Costo calculado para subreceta "${subreceta.nombre}":`, costo);
    return costo;
  }

  cargarTorta(id: string) {
    console.log(`🔄 Cargando torta con ID: ${id}`);
    this.http.get<Torta>(`${environment.apiUrl}/tortas/${id}`)
      .subscribe({
        next: (data) => {
          console.log('✅ Torta cargada correctamente:', data);

          // ✅ CORRECCIÓN: Asegurar que las subrecetas sean solo IDs
          if (data.subrecetas && data.subrecetas.length > 0) {
            console.log('🔍 Procesando subrecetas de la torta...');

            // Convertir objetos de subrecetas a solo IDs si es necesario
            data.subrecetas = data.subrecetas.map((subreceta: any) => {
              if (typeof subreceta === 'object' && subreceta._id) {
                console.log(`🔄 Convirtiendo objeto a ID: ${subreceta._id}`);
                return subreceta._id;
              }
              return subreceta;
            });

            console.log('✅ Subrecetas procesadas (solo IDs):', data.subrecetas);
          }

          this.torta = data;
          console.log('📋 Subrecetas de la torta (IDs):', this.torta.subrecetas);

          // Verificar si las subrecetas existen
          if (this.torta.subrecetas.length > 0 && this.subrecetasDisponibles.length > 0) {
            console.log('🔍 Verificando existencia de subrecetas...');
            this.torta.subrecetas.forEach(subrecetaId => {
              const existe = this.subrecetasDisponibles.some(s => s._id === subrecetaId);
              console.log(`📌 Subreceta ID ${subrecetaId} existe:`, existe);
            });
          }
        },
        error: (error) => {
          console.error('❌ Error cargando torta:', error);
        }
      });
  }

  displaySubreceta(subreceta: Subreceta | null): string {
    const nombre = subreceta && subreceta.nombre ? subreceta.nombre : '';
    console.log('🏷️ Display subreceta:', nombre);
    return nombre;
  }

  onSubrecetaSelected(event: any): void {
    const subreceta = event.option.value;
    console.log('🎯 Subreceta seleccionada:', subreceta);
    this.selectedSubreceta = subreceta;
    this.previewSubreceta = subreceta;
  }

  agregarSubreceta() {
    console.log('➕ Intentando agregar subreceta:', this.selectedSubreceta);

    if (this.selectedSubreceta && !this.torta.subrecetas.includes(this.selectedSubreceta._id)) {
      this.torta.subrecetas.push(this.selectedSubreceta._id);
      console.log('✅ Subreceta agregada. Subrecetas actuales:', this.torta.subrecetas);
      this.subrecetaSearchControl.setValue('');
      this.selectedSubreceta = null;
      this.previewSubreceta = null;
    } else {
      console.log('❌ No se pudo agregar subreceta (ya existe o no seleccionada)');
    }
  }

  eliminarSubreceta(index: number) {
    console.log('🗑️ Eliminando subreceta en índice:', index);
    const subrecetaId = this.torta.subrecetas[index];
    console.log('📌 ID de subreceta a eliminar:', subrecetaId);
    this.torta.subrecetas.splice(index, 1);
    console.log('✅ Subreceta eliminada. Subrecetas restantes:', this.torta.subrecetas);
  }

  getNombreSubreceta(subrecetaId: string): string {
    console.log(`🔍 Buscando nombre para subreceta ID: ${subrecetaId}`);
    const subreceta = this.subrecetasDisponibles.find(s => s._id === subrecetaId);

    if (subreceta) {
      console.log(`✅ Subreceta encontrada: ${subreceta.nombre}`);
      return subreceta.nombre;
    } else {
      console.log(`❌ Subreceta NO encontrada para ID: ${subrecetaId}`);
      console.log('📋 Subrecetas disponibles:', this.subrecetasDisponibles.map(s => ({ id: s._id, nombre: s.nombre })));
      return 'Subreceta no encontrada';
    }
  }

  getSubrecetaById(subrecetaId: string): Subreceta | undefined {
    const subreceta = this.subrecetasDisponibles.find(s => s._id === subrecetaId);
    console.log(`🔍 Buscando subreceta por ID ${subrecetaId}:`, subreceta ? 'ENCONTRADA' : 'NO ENCONTRADA');
    return subreceta;
  }

  calcularCostoTotalTorta(): number {
    console.log('🧮 Calculando costo total de torta...');
    console.log('📋 Subrecetas en torta:', this.torta.subrecetas);
    console.log('📋 Subrecetas disponibles:', this.subrecetasDisponibles.length);

    const costoTotal = this.torta.subrecetas.reduce((total, subrecetaId) => {
      const subreceta = this.getSubrecetaById(subrecetaId);
      const costo = subreceta?.costoTotal || 0;
      console.log(`💰 Subreceta ${subrecetaId}: ${costo}€`);
      return total + costo;
    }, 0);

    console.log('✅ Costo total calculado:', costoTotal);
    return costoTotal;
  }

  guardarTorta() {
    console.log('💾 Guardando torta...', this.torta);

    if (this.isEditMode) {
      console.log('📝 Actualizando torta existente');
      this.http.put(`${environment.apiUrl}/tortas/${this.torta._id}`, this.torta)
        .subscribe({
          next: () => {
            console.log('✅ Torta actualizada correctamente');
            this.router.navigate(['/tortas']);
          },
          error: (error) => {
            console.error('❌ Error actualizando torta:', error);
          }
        });
    } else {
      console.log('🆕 Creando nueva torta');
      this.http.post(`${environment.apiUrl}/tortas`, this.torta)
        .subscribe({
          next: () => {
            console.log('✅ Torta creada correctamente');
            this.router.navigate(['/tortas']);
          },
          error: (error) => {
            console.error('❌ Error creando torta:', error);
          }
        });
    }
  }
}
