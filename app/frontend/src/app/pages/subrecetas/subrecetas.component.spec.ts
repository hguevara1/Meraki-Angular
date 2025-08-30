import { SubrecetasComponent } from './subrecetas.component';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';

// Definir las interfaces aquí para las pruebas
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
  _id?: string;
  nombre: string;
  ingredientes: IngredienteEnSubreceta[];
  createdAt?: string;
  updatedAt?: string;
}

// Mock HttpClient
const mockHttpClient = {
  get: jasmine.createSpy('get'),
  delete: jasmine.createSpy('delete')
};

describe('SubrecetasComponent', () => {
  let component: SubrecetasComponent;

  beforeEach(() => {
    component = new SubrecetasComponent(mockHttpClient as any);

    // Resetear spies
    mockHttpClient.get.calls.reset();
    mockHttpClient.delete.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('cargarSubrecetas', () => {
    it('should load subrecetas successfully', () => {
      const mockSubrecetas: Subreceta[] = [
        {
          _id: '1',
          nombre: 'Salsa Tomate',
          ingredientes: [
            {
              ingrediente: {
                _id: '1',
                nombre: 'Tomate',
                precio: 2.5,
                medida: 1,
                unidad: 'kg'
              },
              cantidad: 0.5,
              costo: 1.25
            }
          ]
        }
      ];

      mockHttpClient.get.and.returnValue(of(mockSubrecetas));

      component.cargarSubrecetas();

      expect(mockHttpClient.get).toHaveBeenCalledWith('http://localhost:5000/api/subrecetas');
      expect(component.subrecetas).toEqual(mockSubrecetas);
      expect(component.totalSubrecetas).toBe(1);
      expect(component.isLoading).toBeFalse();
    });

    it('should handle error when loading subrecetas fails', () => {
      spyOn(console, 'error');
      mockHttpClient.get.and.returnValue(throwError(() => new Error('Server Error')));

      component.cargarSubrecetas();

      expect(mockHttpClient.get).toHaveBeenCalledWith('http://localhost:5000/api/subrecetas');
      expect(console.error).toHaveBeenCalled();
      expect(component.isLoading).toBeFalse();
      expect(component.subrecetas.length).toBe(0);
    });
  });

  describe('calcularCostoTotal', () => {
    it('should calculate total cost correctly', () => {
      const subreceta: Subreceta = {
        _id: '1',
        nombre: 'Salsa Test',
        ingredientes: [
          {
            ingrediente: {
              _id: '1',
              nombre: 'Ingrediente 1',
              precio: 10,
              medida: 1,
              unidad: 'kg'
            },
            cantidad: 2,
            costo: 20
          },
          {
            ingrediente: {
              _id: '2',
              nombre: 'Ingrediente 2',
              precio: 5,
              medida: 1,
              unidad: 'kg'
            },
            cantidad: 3,
            costo: 15
          }
        ]
      };

      const total = component.calcularCostoTotal(subreceta);
      expect(total).toBe(35); // 20 + 15
    });

    it('should return 0 for empty ingredientes array', () => {
      const subreceta: Subreceta = {
        _id: '1',
        nombre: 'Salsa Vacia',
        ingredientes: []
      };

      const total = component.calcularCostoTotal(subreceta);
      expect(total).toBe(0);
    });

    it('should handle ingredientes with costo = 0', () => {
      const subreceta: Subreceta = {
        _id: '1',
        nombre: 'Salsa Zero',
        ingredientes: [
          {
            ingrediente: {
              _id: '1',
              nombre: 'Ingrediente 1',
              precio: 0,
              medida: 1,
              unidad: 'kg'
            },
            cantidad: 2,
            costo: 0
          }
        ]
      };

      const total = component.calcularCostoTotal(subreceta);
      expect(total).toBe(0);
    });
  });

  describe('eliminarSubreceta', () => {
    beforeEach(() => {
      // Configurar algunas subrecetas para las pruebas de eliminación
      component.subrecetas = [
        {
          _id: '1',
          nombre: 'Salsa Test',
          ingredientes: []
        }
      ];
    });

    it('should delete subreceta when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      mockHttpClient.delete.and.returnValue(of({}));
      spyOn(component, 'cargarSubrecetas');

      component.eliminarSubreceta('1');

      expect(mockHttpClient.delete).toHaveBeenCalledWith('http://localhost:5000/api/subrecetas/1');
      expect(component.cargarSubrecetas).toHaveBeenCalled();
    });

    it('should not delete subreceta when not confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.eliminarSubreceta('1');

      expect(mockHttpClient.delete).not.toHaveBeenCalled();
    });

    it('should handle error when deleting fails', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(console, 'error');
      mockHttpClient.delete.and.returnValue(throwError(() => new Error('Delete Error')));

      component.eliminarSubreceta('1');

      expect(mockHttpClient.delete).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('ngOnInit', () => {
    it('should call cargarSubrecetas on init', () => {
      spyOn(component, 'cargarSubrecetas');

      component.ngOnInit();

      expect(component.cargarSubrecetas).toHaveBeenCalled();
    });
  });
});
