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

  displayIngrediente(ingrediente: Ingrediente | null): string {
    return ingrediente && ingrediente.nombre ? ingrediente.nombre : '';
  }

  onIngredienteSelected(event: any): void {
    const ingrediente = event.option.value as Ingrediente;
    this.ingredienteSeleccionado = ingrediente;
  }

  onCostoAdicionalSelected(event: any): void {
    const ingrediente = event.option.value as Ingrediente;
    this.ingredienteCostoAdicionalSeleccionado = ingrediente;
  }

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

  getNombreIngrediente(ingredienteId: string): string {
    const ingrediente = this.ingredientesDisponibles.find(
      ing => ing._id === ingredienteId
    );
    return ingrediente ? ingrediente.nombre : 'Nombre no disponible';
  }

  getUnidadIngrediente(ingredienteId: string): string {
    const ingrediente = this.ingredientesDisponibles.find(
      ing => ing._id === ingredienteId
    );
    return ingrediente ? ingrediente.unidad : 'u';
  }

  seleccionarTorta(torta: Torta) {
    this.tortaSeleccionada = { ...torta };
    this.costosAdicionales = []; // Reiniciar costos adicionales al cambiar de torta
  }

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
    const precioBase = (costoConGastos + costosAdicionales) * (1 + this.configuracion.porcentajeGanancia / 100);
    return precioBase;
  }

  cambiarFactorSubreceta(subreceta: Subreceta, factor: number) {
    subreceta.factorMultiplicacion = factor;
  }

  eliminarSubreceta(index: number) {
    if (this.tortaSeleccionada) {
      this.tortaSeleccionada.subrecetas.splice(index, 1);
    }
  }

  agregarSubrecetaExistente() {
    this.snackBar.open('Funcionalidad en desarrollo', 'Cerrar', { duration: 2000 });
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

  editarSubreceta(subreceta: Subreceta) {
    subreceta.tempNombre = subreceta.nombre;
    subreceta.editing = true;
  }

  abrirSelectorIngredientes(subreceta: Subreceta) {
    this.subrecetaParaAgregarIngrediente = subreceta;
    this.mostrarSelectorIngredientes = true;
    this.ingredienteSeleccionado = null;
    this.cantidadIngrediente = 0;
    this.ingredienteSearchControl.setValue('');
  }

  agregarIngredienteASubreceta() {
    if (this.subrecetaParaAgregarIngrediente && this.ingredienteSeleccionado && this.cantidadIngrediente > 0) {
      // Verificar si el ingrediente ya existe en la subreceta
      const ingredienteExistente = this.subrecetaParaAgregarIngrediente.ingredientes.find(
        (ing: any) => ing.ingrediente === this.ingredienteSeleccionado!._id
      );

      if (ingredienteExistente) {
        this.snackBar.open('Este ingrediente ya fue agregado a la subreceta', 'Cerrar', { duration: 3000 });
        return;
      }

      // Calcular el costo basado en el precio por unidad
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

  editarIngrediente(subreceta: Subreceta, ingredienteIndex: number) {
    // Cancelar edición de otros ingredientes
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
    } else {
      // Si la cantidad no es válida, cancelar la edición
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
}
