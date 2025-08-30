import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';

// Componente a testear
import { PresupuestoTortaComponent } from './presupuesto-torta.component';
import { HeaderComponent } from '../header/header.component';

// Material modules
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

// Mocks
const mockIngredientes = [
  {
    _id: 'ing1',
    nombre: 'Chocolate',
    precio: 10,
    medida: 1,
    unidad: 'kg'
  },
  {
    _id: 'ing2',
    nombre: 'Azúcar',
    precio: 2,
    medida: 1,
    unidad: 'kg'
  }
];

describe('PresupuestoTortaComponent', () => {
  let component: PresupuestoTortaComponent;
  let fixture: ComponentFixture<PresupuestoTortaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]),
        ReactiveFormsModule,
        FormsModule,
        NoopAnimationsModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatCardModule,
        MatChipsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatExpansionModule,
        MatSelectModule,
        MatTableModule,
        MatDialogModule,
        MatSnackBarModule,
        MatTooltipModule,
        PresupuestoTortaComponent,
        HeaderComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PresupuestoTortaComponent);
    component = fixture.componentInstance;

    // Configurar datos de prueba directamente sin HTTP
    component.ingredientesDisponibles = mockIngredientes;
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('Funciones de utilidad', () => {
    it('debería obtener nombre de ingrediente por ID', () => {
      const nombre = component.getNombreIngrediente('ing1');
      expect(nombre).toBe('Chocolate');
    });

    it('debería retornar mensaje por defecto para ingrediente no encontrado', () => {
      const nombre = component.getNombreIngrediente('ing999');
      expect(nombre).toBe('Nombre no disponible');
    });

    it('debería obtener unidad de ingrediente por ID', () => {
      const unidad = component.getUnidadIngrediente('ing1');
      expect(unidad).toBe('kg');
    });

    it('debería retornar unidad por defecto para ingrediente no encontrado', () => {
      const unidad = component.getUnidadIngrediente('ing999');
      expect(unidad).toBe('u');
    });
  });

  describe('Cálculos de costos', () => {
    beforeEach(() => {
      // Configurar una torta seleccionada para pruebas
      component.tortaSeleccionada = {
        _id: '1',
        nombre: 'Torta Test',
        subrecetas: [
          {
            _id: 'sub1',
            nombre: 'Subreceta Test',
            ingredientes: [
              {
                ingrediente: 'ing1',
                cantidad: 2,
                costo: 10.0
              },
              {
                ingrediente: 'ing2',
                cantidad: 1,
                costo: 5.0
              }
            ],
            factorMultiplicacion: 1
          }
        ]
      };
    });

    it('debería calcular costo de subreceta correctamente', () => {
      const subreceta = component.tortaSeleccionada!.subrecetas[0];
      const costo = component.calcularCostoSubreceta(subreceta);
      expect(costo).toBe(15.0); // 10 + 5
    });

    it('debería calcular costo total correctamente', () => {
      const costoTotal = component.calcularCostoTotal();
      expect(costoTotal).toBe(15.0);
    });

    it('debería calcular costo con gastos correctamente', () => {
      component.configuracion.porcentajeGastos = 20;
      const costoConGastos = component.calcularCostoConGastos();
      expect(costoConGastos).toBe(18.0); // 15 + 20% = 18
    });

    it('debería calcular precio de venta correctamente', () => {
      component.configuracion.porcentajeGastos = 20;
      component.configuracion.porcentajeGanancia = 50;
      const precioVenta = component.calcularPrecioVenta();
      expect(precioVenta).toBe(27.0); // 18 + 50% = 27
    });

    it('debería retornar 0 si no hay torta seleccionada', () => {
      component.tortaSeleccionada = null;
      const costoTotal = component.calcularCostoTotal();
      expect(costoTotal).toBe(0);
    });
  });

  describe('Gestión de subrecetas', () => {
    beforeEach(() => {
      component.tortaSeleccionada = {
        _id: '1',
        nombre: 'Torta Test',
        subrecetas: [
          {
            _id: 'sub1',
            nombre: 'Subreceta Existente',
            ingredientes: [],
            factorMultiplicacion: 1
          }
        ]
      };
    });

    it('debería cambiar factor de multiplicación de subreceta', () => {
      const subreceta = component.tortaSeleccionada!.subrecetas[0];
      component.cambiarFactorSubreceta(subreceta, 2);
      expect(subreceta.factorMultiplicacion).toBe(2);
    });

    it('debería eliminar subreceta', () => {
      const initialLength = component.tortaSeleccionada!.subrecetas.length;
      component.eliminarSubreceta(0);
      expect(component.tortaSeleccionada!.subrecetas.length).toBe(initialLength - 1);
    });

    it('debería crear nueva subreceta', () => {
      component.nuevaSubrecetaNombre = 'Nueva Subreceta';
      component.crearNuevaSubreceta();

      expect(component.tortaSeleccionada!.subrecetas.length).toBe(2);
      expect(component.tortaSeleccionada!.subrecetas[1].nombre).toBe('Nueva Subreceta');
      expect(component.nuevaSubrecetaNombre).toBe('');
    });

    it('no debería crear subreceta con nombre vacío', () => {
      component.nuevaSubrecetaNombre = '   ';
      const initialLength = component.tortaSeleccionada!.subrecetas.length;
      component.crearNuevaSubreceta();

      expect(component.tortaSeleccionada!.subrecetas.length).toBe(initialLength);
    });
  });

  describe('Gestión de ingredientes', () => {
    beforeEach(() => {
      component.tortaSeleccionada = {
        _id: '1',
        nombre: 'Torta Test',
        subrecetas: [
          {
            _id: 'sub1',
            nombre: 'Subreceta Test',
            ingredientes: [],
            factorMultiplicacion: 1
          }
        ]
      };
    });

    it('debería agregar ingrediente a subreceta', () => {
      const subreceta = component.tortaSeleccionada!.subrecetas[0];
      component.subrecetaParaAgregarIngrediente = subreceta;
      component.ingredienteSeleccionado = mockIngredientes[0]; // Chocolate
      component.cantidadIngrediente = 0.5;

      component.agregarIngredienteASubreceta();

      expect(subreceta.ingredientes.length).toBe(1);
      expect(subreceta.ingredientes[0].ingrediente).toBe('ing1');
      expect(subreceta.ingredientes[0].cantidad).toBe(0.5);
      expect(subreceta.ingredientes[0].costo).toBe(5.0); // 10€/kg * 0.5kg = 5€
    });

    it('no debería agregar ingrediente duplicado', () => {
      const subreceta = component.tortaSeleccionada!.subrecetas[0];
      // Agregar ingrediente primero
      subreceta.ingredientes.push({
        ingrediente: 'ing1',
        cantidad: 1,
        costo: 10.0
      });

      component.subrecetaParaAgregarIngrediente = subreceta;
      component.ingredienteSeleccionado = mockIngredientes[0];
      component.cantidadIngrediente = 0.5;

      component.agregarIngredienteASubreceta();

      // Solo verificar que no se agregó duplicado, sin verificar snackbar
      expect(subreceta.ingredientes.length).toBe(1); // No se agregó duplicado
    });

    it('debería eliminar ingrediente de subreceta', () => {
      const subreceta = component.tortaSeleccionada!.subrecetas[0];
      subreceta.ingredientes.push({
        ingrediente: 'ing1',
        cantidad: 1,
        costo: 10.0
      });

      component.eliminarIngrediente(subreceta, 0);

      expect(subreceta.ingredientes.length).toBe(0);
    });
  });

  describe('Edición de ingredientes', () => {
    beforeEach(() => {
      component.tortaSeleccionada = {
        _id: '1',
        nombre: 'Torta Test',
        subrecetas: [
          {
            _id: 'sub1',
            nombre: 'Subreceta Test',
            ingredientes: [
              {
                ingrediente: 'ing1',
                cantidad: 1,
                costo: 10.0,
                editing: false
              }
            ],
            factorMultiplicacion: 1
          }
        ]
      };
    });

    it('debería editar ingrediente', () => {
      const subreceta = component.tortaSeleccionada!.subrecetas[0];
      const ingrediente = subreceta.ingredientes[0];

      component.editarIngrediente(subreceta, 0);

      expect(ingrediente.editing).toBeTrue();
      expect(ingrediente.tempCantidad).toBe(1);
    });

    it('debería guardar edición de ingrediente', () => {
      const subreceta = component.tortaSeleccionada!.subrecetas[0];
      const ingrediente = subreceta.ingredientes[0];

      // Primero entrar en modo edición
      component.editarIngrediente(subreceta, 0);
      ingrediente.tempCantidad = 2; // Cambiar cantidad

      component.guardarEdicionIngrediente(subreceta, 0);

      expect(ingrediente.cantidad).toBe(2);
      expect(ingrediente.costo).toBe(20.0); // 10€/kg * 2kg = 20€
      expect(ingrediente.editing).toBeFalse();
    });

    it('debería cancelar edición de ingrediente', () => {
      const subreceta = component.tortaSeleccionada!.subrecetas[0];
      const ingrediente = subreceta.ingredientes[0];

      // Primero entrar en modo edición
      component.editarIngrediente(subreceta, 0);
      ingrediente.tempCantidad = 2;

      component.cancelarEdicionIngrediente(subreceta, 0);

      expect(ingrediente.cantidad).toBe(1); // No debería cambiar
      expect(ingrediente.editing).toBeFalse();
    });
  });

  describe('Guardar e imprimir', () => {
    it('debería guardar presupuesto', () => {
      component.tortaSeleccionada = {
        _id: '1',
        nombre: 'Torta Test',
        subrecetas: []
      };

      // Solo verificar que la función se ejecuta sin errores
      expect(() => component.guardarPresupuesto()).not.toThrow();
    });

    it('no debería guardar presupuesto sin torta seleccionada', () => {
      component.tortaSeleccionada = null;

      // Solo verificar que la función se ejecuta sin errores
      expect(() => component.guardarPresupuesto()).not.toThrow();
    });

    it('debería llamar a window.print() al imprimir', () => {
      spyOn(window, 'print');
      component.imprimirPresupuesto();
      expect(window.print).toHaveBeenCalled();
    });
  });
});
