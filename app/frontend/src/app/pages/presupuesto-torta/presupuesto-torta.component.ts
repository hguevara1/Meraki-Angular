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
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

// Interfaces
interface Ingrediente {
  _id: string;
  nombre: string;
  precio: number | null;
  medida: number;
  unidad: string;
}

interface SubrecetaDisponible {
  _id: string;
  nombre: string;
  ingredientes: {
    ingrediente: any;
    cantidad: number;
    costo: number;
    ingredienteNombre?: string;
    ingredienteUnidad?: string;
  }[];
  costoTotal: number;
}

interface IngredienteEnSubreceta {
  ingrediente: string;
  cantidad: number;
  costo: number;
  editing?: boolean;
  tempCantidad?: number;
}

interface Subreceta {
  _id: string;
  nombre: string;
  ingredientes: IngredienteEnSubreceta[];
  factorMultiplicacion: number;
  editing?: boolean;
  tempNombre?: string;
}

interface Torta {
  _id: string;
  nombre: string;
  subrecetas: Subreceta[];
}

interface PresupuestoConfig {
  porcentajeGastos: number;
  porcentajeGanancia: number;
}

interface CostoAdicional {
  ingredienteId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  costoTotal: number;
}

@Component({
  selector: 'app-presupuesto-torta',
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
    MatExpansionModule,
    MatListModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatChipsModule,
    HeaderComponent
  ],
  templateUrl: './presupuesto-torta.component.html',
  styleUrls: ['./presupuesto-torta.component.css']
})
export class PresupuestoTortaComponent implements OnInit {
  tortasDisponibles: Torta[] = [];
  tortaSeleccionada: Torta | null = null;
  private apiUrl = environment.apiUrl;
  configuracion: PresupuestoConfig = {
    porcentajeGastos: 20,
    porcentajeGanancia: 100
  };

  // Para nueva subreceta/torta
  nuevaSubrecetaNombre: string = '';
  nuevaTortaNombre: string = '';
  mostrarFormNuevaSubreceta: boolean = false;
  mostrarFormNuevaTorta: boolean = false;

  // Para selección de ingredientes
  ingredientesDisponibles: Ingrediente[] = [];
  mostrarSelectorIngredientes: boolean = false;
  subrecetaParaAgregarIngrediente: Subreceta | null = null;
  ingredienteSeleccionado: Ingrediente | null = null;
  cantidadIngrediente: number = 0;

  // Para costos adicionales
  costosAdicionales: CostoAdicional[] = [];
  mostrarSelectorCostoAdicional: boolean = false;
  ingredienteCostoAdicionalSeleccionado: Ingrediente | null = null;
  cantidadCostoAdicional: number = 1;

  // Para búsqueda de ingredientes
  ingredienteSearchControl = new FormControl('');
  filteredIngredientes!: Observable<Ingrediente[]>;

  costoAdicionalSearchControl = new FormControl('');
  filteredIngredientesCosto!: Observable<Ingrediente[]>;

  subrecetasDisponibles: SubrecetaDisponible[] = [];
  mostrarSelectorSubrecetas: boolean = false;
  subrecetaSearchControl = new FormControl('');
  filteredSubrecetas!: Observable<SubrecetaDisponible[]>;
  subrecetaSeleccionada: SubrecetaDisponible | null = null;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.cargarTortas();
    this.cargarIngredientes();
    this.cargarSubrecetasDisponibles();

    // Configurar el filtro de autocompletado para ingredientes
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

    // Configurar el filtro de autocompletado para costos adicionales
    this.filteredIngredientesCosto = this.costoAdicionalSearchControl.valueChanges.pipe(
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

    // Configurar el filtro para subrecetas
    this.filteredSubrecetas = this.subrecetaSearchControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        if (typeof value === 'string') {
          return this._filterSubrecetas(value);
        } else if (value && typeof value === 'object' && '_id' in value) {
          const subrecetaValue = value as SubrecetaDisponible;
          return this._filterSubrecetas(subrecetaValue.nombre);
        }
        return this.subrecetasDisponibles.slice();
      })
    );
  }

  // Métodos para cargar datos
  cargarTortas() {
    this.http.get<Torta[]>(`${environment.apiUrl}/tortas`)
      .subscribe({
        next: (data) => {
          this.tortasDisponibles = data.map(torta => ({
            ...torta,
            subrecetas: torta.subrecetas.map((sub: any) => ({
              ...sub,
              factorMultiplicacion: 1,
              ingredientes: sub.ingredientes.map((ing: any) => ({
                ...ing,
                editing: false
              }))
            }))
          }));
        },
        error: (error) => {
          console.error('Error cargando tortas:', error);
          this.snackBar.open('Error al cargar las tortas', 'Cerrar', { duration: 3000 });
        }
      });
  }

  cargarIngredientes() {
    this.http.get<Ingrediente[]>(`${environment.apiUrl}/ingredientes`)
      .subscribe({
        next: (data) => {
          this.ingredientesDisponibles = data;
        },
        error: (error) => {
          console.error('Error cargando ingredientes:', error);
          this.snackBar.open('Error al cargar los ingredientes', 'Cerrar', { duration: 3000 });
        }
      });
  }

  cargarSubrecetasDisponibles() {
    this.http.get<SubrecetaDisponible[]>(`${environment.apiUrl}/subrecetas`)
      .subscribe({
        next: (data) => {
          this.subrecetasDisponibles = data;
          this.cargarIngredientesParaSubrecetas();
        },
        error: (error) => {
          console.error('Error cargando subrecetas:', error);
          this.snackBar.open('Error al cargar las subrecetas', 'Cerrar', { duration: 3000 });
        }
      });
  }

  // Métodos de filtrado
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

  private _filterSubrecetas(value: string): SubrecetaDisponible[] {
    if (!value) {
      return this.subrecetasDisponibles.slice();
    }
    const filterValue = value.toLowerCase();
    return this.subrecetasDisponibles.filter(subreceta =>
      subreceta.nombre.toLowerCase().includes(filterValue)
    );
  }

  // Métodos para mostrar valores en autocomplete
  displayIngrediente(ingrediente: Ingrediente | null): string {
    return ingrediente && ingrediente.nombre ? ingrediente.nombre : '';
  }

  displaySubreceta(subreceta: SubrecetaDisponible | null): string {
    return subreceta && subreceta.nombre ? subreceta.nombre : '';
  }

  // Métodos de selección
  onIngredienteSelected(event: any): void {
    const ingrediente = event.option.value as Ingrediente;
    this.ingredienteSeleccionado = ingrediente;
  }

  onCostoAdicionalSelected(event: any): void {
    const ingrediente = event.option.value as Ingrediente;
    this.ingredienteCostoAdicionalSeleccionado = ingrediente;
  }

  onSubrecetaSelected(event: any): void {
    const subreceta = event.option.value as SubrecetaDisponible;
    this.subrecetaSeleccionada = subreceta;
  }

  // Métodos para obtener información de ingredientes
  getNombreIngrediente(ingrediente: any): string {
    if (typeof ingrediente === 'string') {
      const ingredienteEncontrado = this.ingredientesDisponibles.find(
        ing => ing._id === ingrediente
      );
      return ingredienteEncontrado ? ingredienteEncontrado.nombre : 'Nombre no disponible';
    } else if (typeof ingrediente === 'object' && ingrediente !== null) {
      return ingrediente.nombre || ingrediente.ingredienteNombre || 'Nombre no disponible';
    }
    return 'Nombre no disponible';
  }

  getUnidadIngrediente(ingrediente: any): string {
    if (typeof ingrediente === 'string') {
      const ingredienteEncontrado = this.ingredientesDisponibles.find(
        ing => ing._id === ingrediente
      );
      return ingredienteEncontrado ? ingredienteEncontrado.unidad : 'u';
    } else if (typeof ingrediente === 'object' && ingrediente !== null) {
      return ingrediente.unidad || ingrediente.ingredienteUnidad || 'u';
    }
    return 'u';
  }

  // Métodos de selección y manipulación de tortas
  seleccionarTorta(torta: Torta) {
    this.tortaSeleccionada = { ...torta };
    this.costosAdicionales = [];
  }

  crearNuevaTorta() {
    if (this.nuevaTortaNombre.trim()) {
      const nuevaTorta: Torta = {
        _id: 'nueva-' + Date.now(),
        nombre: this.nuevaTortaNombre,
        subrecetas: this.tortaSeleccionada ? [...this.tortaSeleccionada.subrecetas] : []
      };
      this.tortasDisponibles.push(nuevaTorta);
      this.tortaSeleccionada = nuevaTorta;
      this.nuevaTortaNombre = '';
      this.mostrarFormNuevaTorta = false;
      this.snackBar.open('Torta creada correctamente', 'Cerrar', { duration: 2000 });
    }
  }

  // Métodos de cálculo
  calcularCostoSubreceta(subreceta: Subreceta): number {
    return subreceta.ingredientes.reduce((total, ingrediente) => {
      return total + (ingrediente.costo * subreceta.factorMultiplicacion);
    }, 0);
  }

  calcularCostoTotal(): number {
    if (!this.tortaSeleccionada) return 0;
    return this.tortaSeleccionada.subrecetas.reduce((total, subreceta) => {
      return total + this.calcularCostoSubreceta(subreceta);
    }, 0);
  }

  calcularCostoConGastos(): number {
    const costoTotal = this.calcularCostoTotal();
    return costoTotal * (1 + this.configuracion.porcentajeGastos / 100);
  }

  calcularTotalCostosAdicionales(): number {
    return this.costosAdicionales.reduce((total, costo) => total + costo.costoTotal, 0);
  }

  calcularPrecioVenta(): number {
    const costoConGastos = this.calcularCostoConGastos();
    const costosAdicionales = this.calcularTotalCostosAdicionales();
    const precioBase = (costoConGastos ) * (1 + this.configuracion.porcentajeGanancia / 100) + costosAdicionales;
    return precioBase;
  }

  // Métodos para subrecetas
  cambiarFactorSubreceta(subreceta: Subreceta, factor: number) {
    subreceta.factorMultiplicacion = factor;
  }

  eliminarSubreceta(index: number) {
    if (this.tortaSeleccionada) {
      this.tortaSeleccionada.subrecetas.splice(index, 1);
    }
  }

  editarSubreceta(subreceta: Subreceta) {
    subreceta.tempNombre = subreceta.nombre;
    subreceta.editing = true;
  }

  guardarSubreceta(subreceta: Subreceta) {
    subreceta.editing = false;
    delete subreceta.tempNombre;
  }

  cancelarEdicionSubreceta(subreceta: Subreceta) {
    if (subreceta.tempNombre) {
      subreceta.nombre = subreceta.tempNombre;
    }
    subreceta.editing = false;
    delete subreceta.tempNombre;
  }

  crearNuevaSubreceta() {
    if (this.nuevaSubrecetaNombre.trim() && this.tortaSeleccionada) {
      const nuevaSubreceta: Subreceta = {
        _id: 'nueva-' + Date.now(),
        nombre: this.nuevaSubrecetaNombre,
        ingredientes: [],
        factorMultiplicacion: 1,
        editing: true
      };
      this.tortaSeleccionada.subrecetas.push(nuevaSubreceta);
      this.nuevaSubrecetaNombre = '';
      this.mostrarFormNuevaSubreceta = false;
    }
  }

  // Métodos para ingredientes
  abrirSelectorIngredientes(subreceta: Subreceta) {
    this.subrecetaParaAgregarIngrediente = subreceta;
    this.mostrarSelectorIngredientes = true;
    this.ingredienteSeleccionado = null;
    this.cantidadIngrediente = 0;
    this.ingredienteSearchControl.setValue('');
  }

  agregarIngredienteASubreceta() {
    if (this.subrecetaParaAgregarIngrediente && this.ingredienteSeleccionado && this.cantidadIngrediente > 0) {
      const ingredienteExistente = this.subrecetaParaAgregarIngrediente.ingredientes.find(
        (ing: any) => ing.ingrediente === this.ingredienteSeleccionado!._id
      );
      if (ingredienteExistente) {
        this.snackBar.open('Este ingrediente ya fue agregado a la subreceta', 'Cerrar', { duration: 3000 });
        return;
      }
      const costoUnitario = this.ingredienteSeleccionado.precio ?
                           this.ingredienteSeleccionado.precio / this.ingredienteSeleccionado.medida : 0;
      const costoTotal = this.cantidadIngrediente * costoUnitario;
      const nuevoIngrediente: IngredienteEnSubreceta = {
        ingrediente: this.ingredienteSeleccionado._id,
        cantidad: this.cantidadIngrediente,
        costo: costoTotal,
        editing: false
      };
      this.subrecetaParaAgregarIngrediente.ingredientes.push(nuevoIngrediente);
      this.cerrarSelectorIngredientes();
      this.snackBar.open('Ingrediente agregado', 'Cerrar', { duration: 2000 });
    } else {
      this.snackBar.open('Seleccione un ingrediente y especifique una cantidad válida', 'Cerrar', { duration: 3000 });
    }
  }

  cerrarSelectorIngredientes() {
    this.mostrarSelectorIngredientes = false;
    this.subrecetaParaAgregarIngrediente = null;
    this.ingredienteSeleccionado = null;
    this.cantidadIngrediente = 0;
    this.ingredienteSearchControl.setValue('');
  }

  editarIngrediente(subreceta: Subreceta, ingredienteIndex: number) {
    subreceta.ingredientes.forEach((ing, i) => {
      if (i !== ingredienteIndex && ing.editing) {
        this.cancelarEdicionIngrediente(subreceta, i);
      }
    });
    const ingrediente = subreceta.ingredientes[ingredienteIndex];
    ingrediente.editing = true;
    ingrediente.tempCantidad = ingrediente.cantidad;
  }

  guardarEdicionIngrediente(subreceta: Subreceta, ingredienteIndex: number) {
    const ingrediente = subreceta.ingredientes[ingredienteIndex];
    if (ingrediente.tempCantidad !== undefined && ingrediente.tempCantidad > 0) {
      const ingredienteData = this.ingredientesDisponibles.find(
        ing => ing._id === ingrediente.ingrediente
      );
      if (ingredienteData && ingredienteData.precio !== null && ingredienteData.precio !== undefined) {
        const costoUnitario = ingredienteData.precio / ingredienteData.medida;
        ingrediente.cantidad = ingrediente.tempCantidad;
        ingrediente.costo = parseFloat((costoUnitario * ingrediente.tempCantidad).toFixed(2));
      } else {
        ingrediente.cantidad = ingrediente.tempCantidad;
        ingrediente.costo = 0;
      }
      ingrediente.editing = false;
      delete ingrediente.tempCantidad;
    } else {
      this.cancelarEdicionIngrediente(subreceta, ingredienteIndex);
    }
  }

  cancelarEdicionIngrediente(subreceta: Subreceta, ingredienteIndex: number) {
    const ingrediente = subreceta.ingredientes[ingredienteIndex];
    ingrediente.editing = false;
    delete ingrediente.tempCantidad;
  }

  eliminarIngrediente(subreceta: Subreceta, index: number) {
    subreceta.ingredientes.splice(index, 1);
    this.snackBar.open('Ingrediente eliminado', 'Cerrar', { duration: 2000 });
  }

  // Métodos para subrecetas existentes
  agregarSubrecetaExistente() {
    this.mostrarSelectorSubrecetas = true;
    this.subrecetaSeleccionada = null;
    this.subrecetaSearchControl.setValue('');
    if (this.subrecetasDisponibles.length === 0) {
      this.cargarSubrecetasDisponibles();
    }
  }

  agregarSubrecetaSeleccionada() {
    if (this.subrecetaSeleccionada && this.tortaSeleccionada) {
      const subrecetaExistente = this.tortaSeleccionada.subrecetas.find(
        (sub: any) => sub._id === this.subrecetaSeleccionada!._id
      );
      if (subrecetaExistente) {
        this.snackBar.open('Esta subreceta ya fue agregada a la torta', 'Cerrar', { duration: 3000 });
        return;
      }
      const nuevaSubreceta: Subreceta = {
        ...this.subrecetaSeleccionada,
        factorMultiplicacion: 1,
        editing: false
      };
      this.tortaSeleccionada.subrecetas.push(nuevaSubreceta);
      this.cerrarSelectorSubrecetas();
      this.snackBar.open('Subreceta agregada correctamente', 'Cerrar', { duration: 2000 });
    } else {
      this.snackBar.open('Seleccione una subreceta válida', 'Cerrar', { duration: 3000 });
    }
  }

  cerrarSelectorSubrecetas() {
    this.mostrarSelectorSubrecetas = false;
    this.subrecetaSeleccionada = null;
    this.subrecetaSearchControl.setValue('');
  }

  // Métodos para costos adicionales
  abrirSelectorCostoAdicional() {
    this.mostrarSelectorCostoAdicional = true;
    this.ingredienteCostoAdicionalSeleccionado = null;
    this.cantidadCostoAdicional = 1;
    this.costoAdicionalSearchControl.setValue('');
  }

  agregarCostoAdicional() {
    if (this.ingredienteCostoAdicionalSeleccionado && this.cantidadCostoAdicional > 0) {
      const precio = this.ingredienteCostoAdicionalSeleccionado.precio || 0;
      const costoTotal = precio * this.cantidadCostoAdicional;
      const nuevoCosto: CostoAdicional = {
        ingredienteId: this.ingredienteCostoAdicionalSeleccionado._id,
        nombre: this.ingredienteCostoAdicionalSeleccionado.nombre,
        cantidad: this.cantidadCostoAdicional,
        precioUnitario: precio,
        costoTotal: costoTotal
      };
      this.costosAdicionales.push(nuevoCosto);
      this.cerrarSelectorCostoAdicional();
      this.snackBar.open('Costo adicional agregado', 'Cerrar', { duration: 2000 });
    } else {
      this.snackBar.open('Seleccione un ingrediente y especifique una cantidad válida', 'Cerrar', { duration: 3000 });
    }
  }

  eliminarCostoAdicional(index: number) {
    this.costosAdicionales.splice(index, 1);
    this.snackBar.open('Costo adicional eliminado', 'Cerrar', { duration: 2000 });
  }

  cerrarSelectorCostoAdicional() {
    this.mostrarSelectorCostoAdicional = false;
    this.ingredienteCostoAdicionalSeleccionado = null;
    this.cantidadCostoAdicional = 1;
    this.costoAdicionalSearchControl.setValue('');
  }

  // Métodos para presupuesto
  guardarPresupuesto() {
    if (!this.tortaSeleccionada) {
      this.snackBar.open('No hay ninguna torta seleccionada', 'Cerrar', { duration: 2000 });
      return;
    }
    const presupuesto = {
      tortaId: this.tortaSeleccionada._id,
      tortaNombre: this.tortaSeleccionada.nombre,
      configuracion: this.configuracion,
      costosAdicionales: this.costosAdicionales,
      costoTotal: this.calcularCostoTotal(),
      costoConGastos: this.calcularCostoConGastos(),
      totalCostosAdicionales: this.calcularTotalCostosAdicionales(),
      precioVenta: this.calcularPrecioVenta(),
      fecha: new Date()
    };
    console.log('Presupuesto a guardar:', presupuesto);
    this.snackBar.open('Presupuesto guardado correctamente', 'Cerrar', { duration: 2000 });
  }

  imprimirPresupuesto() {
    window.print();
  }

  // Método auxiliar para cargar ingredientes en subrecetas
  private cargarIngredientesParaSubrecetas() {
    if (this.ingredientesDisponibles.length === 0) {
      this.cargarIngredientes();
      return;
    }
    this.subrecetasDisponibles.forEach(subreceta => {
      if (subreceta.ingredientes && subreceta.ingredientes.length > 0) {
        subreceta.ingredientes.forEach((ing: any) => {
          if (typeof ing.ingrediente === 'string') {
            const ingredienteCompleto = this.ingredientesDisponibles.find(
              i => i._id === ing.ingrediente
            );
            if (ingredienteCompleto) {
              ing.ingredienteNombre = ingredienteCompleto.nombre;
              ing.ingredienteUnidad = ingredienteCompleto.unidad;
            }
          } else if (typeof ing.ingrediente === 'object' && ing.ingrediente !== null) {
            ing.ingredienteNombre = ing.ingrediente.nombre;
            ing.ingredienteUnidad = ing.ingrediente.unidad;
          }
        });
      }
    });
  }
}
