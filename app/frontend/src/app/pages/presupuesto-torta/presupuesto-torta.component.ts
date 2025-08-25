import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

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
  ingrediente: Ingrediente;
  cantidad: number;
  costo: number;
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

@Component({
  selector: 'app-presupuesto-torta',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
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
    MatChipsModule
  ],
  templateUrl: './presupuesto-torta.component.html',
  styleUrls: ['./presupuesto-torta.component.css']
})
export class PresupuestoTortaComponent implements OnInit {
  tortasDisponibles: Torta[] = [];
  tortaSeleccionada: Torta | null = null;
  configuracion: PresupuestoConfig = {
    porcentajeGastos: 20,
    porcentajeGanancia: 100
  };

  // Para nueva subreceta/torta
  nuevaSubrecetaNombre: string = '';
  nuevaTortaNombre: string = '';
  mostrarFormNuevaSubreceta: boolean = false;
  mostrarFormNuevaTorta: boolean = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.cargarTortas();
  }

  cargarTortas() {
    this.http.get<Torta[]>('http://localhost:5000/api/tortas')
      .subscribe({
        next: (data) => {
          this.tortasDisponibles = data.map(torta => ({
            ...torta,
            subrecetas: torta.subrecetas.map((sub: any) => ({
              ...sub,
              factorMultiplicacion: 1
            }))
          }));
        },
        error: (error) => {
          console.error('Error cargando tortas:', error);
          this.snackBar.open('Error al cargar las tortas', 'Cerrar', { duration: 3000 });
        }
      });
  }

  seleccionarTorta(torta: Torta) {
    this.tortaSeleccionada = { ...torta };
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

  calcularPrecioVenta(): number {
    const costoConGastos = this.calcularCostoConGastos();
    return costoConGastos * (1 + this.configuracion.porcentajeGanancia / 100);
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
    // Lógica para agregar subreceta existente a la torta
    // Esto requeriría un diálogo modal para seleccionar subrecetas disponibles
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

      this.tortaSeleccionada = nuevaTorta;
      this.nuevaTortaNombre = '';
      this.mostrarFormNuevaTorta = false;
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

  agregarIngredienteASubreceta(subreceta: Subreceta) {
    // Lógica para agregar ingrediente a subreceta
    // Esto requeriría un diálogo modal para seleccionar ingredientes
    this.snackBar.open('Funcionalidad en desarrollo', 'Cerrar', { duration: 2000 });
  }

  eliminarIngrediente(subreceta: Subreceta, index: number) {
    subreceta.ingredientes.splice(index, 1);
  }

  guardarPresupuesto() {
    // Lógica para guardar el presupuesto
    const presupuesto = {
      torta: this.tortaSeleccionada,
      configuracion: this.configuracion,
      costoTotal: this.calcularCostoTotal(),
      costoConGastos: this.calcularCostoConGastos(),
      precioVenta: this.calcularPrecioVenta(),
      fecha: new Date()
    };

    console.log('Presupuesto a guardar:', presupuesto);
    this.snackBar.open('Presupuesto guardado', 'Cerrar', { duration: 2000 });
  }

  imprimirPresupuesto() {
    window.print();
  }
}
