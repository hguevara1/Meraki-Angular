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
import { MatTooltipModule } from '@angular/material/tooltip';

interface Ingrediente {
  _id: string;
  nombre: string;
  precio: number | null;
  medida: number;
  unidad: string;
  createdAt?: string;
  updatedAt?: string;
}

interface IngredienteEditable {
  ingrediente: string;
  cantidad: number;
  costo: number;
  _ingredienteData?: {
    nombre: string;
    unidad: string;
  };
  editing?: boolean;
  tempCantidad?: number;
}

@Component({
  selector: 'app-agregar-subreceta',
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
    MatTooltipModule,
    HeaderComponent
  ],
  templateUrl: './agregar-subreceta.component.html',
  styleUrls: ['./agregar-subreceta.component.css']
})
export class AgregarSubrecetaComponent implements OnInit {
  subreceta: any = {
    nombre: '',
    ingredientes: [] as IngredienteEditable[]
  };
  private apiUrl = environment.apiUrl;

  ingredientesDisponibles: Ingrediente[] = [];
  filteredIngredientes!: Observable<Ingrediente[]>;
  ingredienteSearchControl = new FormControl('');
  selectedIngrediente: Ingrediente | null = null;

  nuevoIngrediente: any = {
    ingrediente: '',
    cantidad: 0
  };
  isEditMode: boolean = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarIngredientes();

    // Verificar si estamos en modo edición
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.cargarSubreceta(id);
    }

    // Configurar el filtro de autocompletado
    this.filteredIngredientes = this.ingredienteSearchControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        if (typeof value === 'string') {
          return this._filterIngredientes(value);
        } else if (value && typeof value === 'object' && '_id' in value) {
          const ingredienteValue = value as Ingrediente;
          return this._filterIngredientes(ingredienteValue.nombre);
        }
        return this.ingredientesDisponibles.slice();
      })
    );
  }

  private _filterIngredientes(value: string): Ingrediente[] {
    if (!value) {
      return this.ingredientesDisponibles.slice();
    }

    const filterValue = value.toLowerCase();
    return this.ingredientesDisponibles.filter(ingrediente =>
      ingrediente.nombre.toLowerCase().includes(filterValue) ||
      ingrediente.unidad.toLowerCase().includes(filterValue)
    );
  }

  cargarIngredientes() {
    this.http.get<Ingrediente[]>(`${this.apiUrl}/ingredientes`)
      .subscribe({
        next: (data) => {
          this.ingredientesDisponibles = data;
          // Actualizar el filtro después de cargar los ingredientes
          this.ingredienteSearchControl.setValue(this.ingredienteSearchControl.value);
        },
        error: (error) => {
          console.error('Error cargando ingredientes:', error);
        }
      });
  }

  cargarSubreceta(id: string) {
    this.http.get<any>(`${this.apiUrl}/subrecetas/${id}`)
      .subscribe({
        next: (data) => {
          this.subreceta = data;
          this.procesarIngredientesSubreceta(); // ← Llama al nuevo método
        },
        error: (error) => {
          console.error('Error cargando subreceta:', error);
        }
      });
  }

  displayIngrediente(ingrediente: Ingrediente | null): string {
    return ingrediente && ingrediente.nombre ? ingrediente.nombre : '';
  }

  onIngredienteSelected(event: any): void {
    const ingrediente = event.option.value as Ingrediente;
    this.selectedIngrediente = ingrediente;
    this.nuevoIngrediente.ingrediente = ingrediente._id;

    // Mantener el texto de búsqueda como el nombre del ingrediente
    this.ingredienteSearchControl.setValue(ingrediente.nombre, { emitEvent: false });
  }

  onSearchInputChange(): void {
    // Cuando el usuario escribe, resetear el ingrediente seleccionado
    if (this.selectedIngrediente && this.ingredienteSearchControl.value !== this.selectedIngrediente.nombre) {
      this.selectedIngrediente = null;
      this.nuevoIngrediente.ingrediente = '';
    }
  }

  agregarIngrediente() {
    if (this.nuevoIngrediente.ingrediente && this.nuevoIngrediente.cantidad > 0) {
      // Verificar si el ingrediente ya existe en la subreceta
      const ingredienteExistente = this.subreceta.ingredientes.find(
        (ing: any) => ing.ingrediente === this.nuevoIngrediente.ingrediente
      );

      if (ingredienteExistente) {
        alert('⚠️ Este ingrediente ya fue agregado a la subreceta');
        return;
      }

      const ingredienteSeleccionado = this.ingredientesDisponibles.find(
        ing => ing._id === this.nuevoIngrediente.ingrediente
      );

      if (ingredienteSeleccionado) {
        // Calcular el costo automáticamente
        let costo = 0;
        if (ingredienteSeleccionado.precio !== null && ingredienteSeleccionado.precio !== undefined) {
          const costoUnitario = ingredienteSeleccionado.precio / ingredienteSeleccionado.medida;
          costo = costoUnitario * this.nuevoIngrediente.cantidad;
        }

        this.subreceta.ingredientes.push({
          ingrediente: this.nuevoIngrediente.ingrediente,
          cantidad: this.nuevoIngrediente.cantidad,
          costo: parseFloat(costo.toFixed(2)),
          _ingredienteData: {
            nombre: ingredienteSeleccionado.nombre,
            unidad: ingredienteSeleccionado.unidad
          },
          editing: false
        });

        // Resetear el formulario
        this.nuevoIngrediente = { ingrediente: '', cantidad: 0 };
        this.ingredienteSearchControl.setValue('');
        this.selectedIngrediente = null;

        // Forzar actualización de la vista
        this.subreceta.ingredientes = [...this.subreceta.ingredientes];
      }
    }
  }

  editarIngrediente(index: number) {
    // Cancelar edición de otros ingredientes
    this.subreceta.ingredientes.forEach((ing: IngredienteEditable, i: number) => {
      if (i !== index && ing.editing) {
        this.cancelarEdicionIngrediente(i);
      }
    });

    const ingrediente = this.subreceta.ingredientes[index];
    ingrediente.editing = true;
    ingrediente.tempCantidad = ingrediente.cantidad;

    // Forzar actualización de la vista
    this.subreceta.ingredientes = [...this.subreceta.ingredientes];
  }

  guardarEdicionIngrediente(index: number) {
    const ingrediente = this.subreceta.ingredientes[index];

    if (ingrediente.tempCantidad !== null && ingrediente.tempCantidad > 0) {
      // Recalcular costo
      const ingredienteData = this.ingredientesDisponibles.find(
        ing => ing._id === ingrediente.ingrediente
      );

      if (ingredienteData && ingredienteData.precio !== null && ingredienteData.precio !== undefined) {
        const costoUnitario = ingredienteData.precio / ingredienteData.medida;
        ingrediente.cantidad = ingrediente.tempCantidad;
        ingrediente.costo = parseFloat((costoUnitario * ingrediente.tempCantidad).toFixed(2));
      } else {
        // Si no hay precio, mantener la cantidad pero costo será 0
        ingrediente.cantidad = ingrediente.tempCantidad;
        ingrediente.costo = 0;
      }

      ingrediente.editing = false;
      delete ingrediente.tempCantidad;

      // Forzar actualización de la vista
      this.subreceta.ingredientes = [...this.subreceta.ingredientes];
    } else {
      // Si la cantidad no es válida, cancelar la edición
      this.cancelarEdicionIngrediente(index);
    }
  }

  cancelarEdicionIngrediente(index: number) {
    const ingrediente = this.subreceta.ingredientes[index];
    ingrediente.editing = false;
    delete ingrediente.tempCantidad;

    // Forzar actualización de la vista
    this.subreceta.ingredientes = [...this.subreceta.ingredientes];
  }

  eliminarIngrediente(index: number) {
    this.subreceta.ingredientes.splice(index, 1);
    this.subreceta.ingredientes = [...this.subreceta.ingredientes];
  }

  guardarSubreceta() {
    if (this.isEditMode) {
      this.http.put(`${this.apiUrl}/subrecetas/${this.subreceta._id}`, this.subreceta)
        .subscribe({
          next: () => {
            this.router.navigate(['/subrecetas']);
          },
          error: (error) => {
            console.error('Error actualizando subreceta:', error);
          }
        });
    } else {
      this.http.post(`${this.apiUrl}/subrecetas`, this.subreceta)
        .subscribe({
          next: () => {
            this.router.navigate(['/subrecetas']);
          },
          error: (error) => {
            console.error('Error creando subreceta:', error);
          }
        });
    }
  }

  calcularCostoTotal(): number {
    return this.subreceta.ingredientes.reduce((total: number, ingrediente: any) => {
      return total + (ingrediente.costo || 0);
    }, 0);
  }

  calcularCostoUnitario(): number {
    if (!this.nuevoIngrediente.ingrediente) return 0;

    const ingrediente = this.ingredientesDisponibles.find(
      ing => ing._id === this.nuevoIngrediente.ingrediente
    );

    if (ingrediente && ingrediente.precio !== null && ingrediente.precio !== undefined) {
      return ingrediente.precio / ingrediente.medida;
    }

    return 0;
  }

  getNombreIngrediente(ingredienteId: string): string {
    if (typeof ingredienteId === 'object' && ingredienteId !== null) {
      return (ingredienteId as any).nombre || 'Nombre no disponible';
    }

    const ingrediente = this.ingredientesDisponibles.find(
      ing => ing._id === ingredienteId
    );
    return ingrediente ? ingrediente.nombre : 'Nombre no disponible';
  }

  getUnidadIngrediente(ingredienteId: string): string {
    if (typeof ingredienteId === 'object' && ingredienteId !== null) {
      return (ingredienteId as any).unidad || 'u';
    }

    const ingrediente = this.ingredientesDisponibles.find(
      ing => ing._id === ingredienteId
    );
    return ingrediente ? ingrediente.unidad : 'u';
  }

  getPrecioIngrediente(ingredienteId: string): number {
    const ingrediente = this.ingredientesDisponibles.find(
      ing => ing._id === ingredienteId
    );
    return ingrediente ? (ingrediente.precio || 0) : 0;
  }

  getMedidaIngrediente(ingredienteId: string): number {
    const ingrediente = this.ingredientesDisponibles.find(
      ing => ing._id === ingredienteId
    );
    return ingrediente ? ingrediente.medida : 0;
  }

  private procesarIngredientesSubreceta() {
    if (this.subreceta.ingredientes && this.ingredientesDisponibles.length > 0) {
      this.subreceta.ingredientes = this.subreceta.ingredientes.map((ing: any) => {
        // Los ingredientes ya vienen populados desde el backend
        // Solo asegúrate de que tengan el formato correcto
        return {
          ...ing,
          editing: false,
          _ingredienteData: ing.ingrediente ? {
            nombre: ing.ingrediente.nombre,
            unidad: ing.ingrediente.unidad
          } : {
            nombre: 'Ingrediente no disponible',
            unidad: 'u'
          }
        };
      });
    }
  }


}
