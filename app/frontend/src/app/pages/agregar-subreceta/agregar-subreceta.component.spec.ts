import { AgregarSubrecetaComponent } from './agregar-subreceta.component';
import { FormControl } from '@angular/forms';

// Mocks básicos
const mockHttpClient = {
  get: jasmine.createSpy('get'),
  post: jasmine.createSpy('post'),
  put: jasmine.createSpy('put')
};

const mockRouter = {
  navigate: jasmine.createSpy('navigate')
};

const mockActivatedRoute = {
  snapshot: {
    paramMap: {
      get: jasmine.createSpy('get').and.returnValue(null)
    }
  }
};

describe('AgregarSubrecetaComponent', () => {
  let component: AgregarSubrecetaComponent;

  beforeEach(() => {
    component = new AgregarSubrecetaComponent(
      mockHttpClient as any,
      mockActivatedRoute as any,
      mockRouter as any
    );

    // Resetear spies
    mockHttpClient.get.calls.reset();
    mockHttpClient.post.calls.reset();
    mockHttpClient.put.calls.reset();
    mockRouter.navigate.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.subreceta).toEqual({
      nombre: '',
      ingredientes: []
    });
    expect(component.ingredientesDisponibles).toEqual([]);
    expect(component.ingredienteSearchControl instanceof FormControl).toBeTrue();
    expect(component.nuevoIngrediente).toEqual({
      ingrediente: '',
      cantidad: 0
    });
    expect(component.isEditMode).toBeFalse();
  });

  describe('ingrediente methods', () => {
    beforeEach(() => {
      // Configurar ingredientes disponibles
      component.ingredientesDisponibles = [
        { _id: '1', nombre: 'Tomate', precio: 2.5, medida: 1, unidad: 'kg' },
        { _id: '2', nombre: 'Cebolla', precio: 1.8, medida: 1, unidad: 'kg' },
        { _id: '3', nombre: 'Ajo', precio: 0.5, medida: 0.1, unidad: 'kg' }
      ];
    });

    it('should filter ingredientes correctly', () => {
      const filtered = (component as any)._filterIngredientes('tom');
      expect(filtered.length).toBe(1);
      expect(filtered[0].nombre).toBe('Tomate');
    });

    it('should display ingrediente name', () => {
      const ingrediente = { _id: '1', nombre: 'Tomate', precio: 2.5, medida: 1, unidad: 'kg' };
      const displayName = component.displayIngrediente(ingrediente as any);
      expect(displayName).toBe('Tomate');
    });

    it('should return empty string for null ingrediente', () => {
      const displayName = component.displayIngrediente(null);
      expect(displayName).toBe('');
    });
  });

  describe('ingrediente operations', () => {
    beforeEach(() => {
      component.ingredientesDisponibles = [
        { _id: '1', nombre: 'Tomate', precio: 2.5, medida: 1, unidad: 'kg' }
      ];
    });

    it('should add ingrediente when valid', () => {
      component.nuevoIngrediente = { ingrediente: '1', cantidad: 2 };

      component.agregarIngrediente();

      expect(component.subreceta.ingredientes.length).toBe(1);
      expect(component.subreceta.ingredientes[0].ingrediente).toBe('1');
      expect(component.subreceta.ingredientes[0].cantidad).toBe(2);
      expect(component.subreceta.ingredientes[0].costo).toBe(5); // 2.5 * 2
    });

    it('should not add ingrediente with invalid cantidad', () => {
      component.nuevoIngrediente = { ingrediente: '1', cantidad: 0 };

      component.agregarIngrediente();

      expect(component.subreceta.ingredientes.length).toBe(0);
    });

    it('should not add duplicate ingrediente', () => {
      component.subreceta.ingredientes = [
        { ingrediente: '1', cantidad: 1, costo: 2.5, editing: false }
      ];
      component.nuevoIngrediente = { ingrediente: '1', cantidad: 2 };

      const alertSpy = spyOn(window, 'alert');
      component.agregarIngrediente();

      expect(alertSpy).toHaveBeenCalledWith('⚠️ Este ingrediente ya fue agregado a la subreceta');
      expect(component.subreceta.ingredientes.length).toBe(1);
    });
  });

  describe('cost calculations', () => {
    beforeEach(() => {
      component.ingredientesDisponibles = [
        { _id: '1', nombre: 'Tomate', precio: 2.5, medida: 1, unidad: 'kg' }
      ];
    });

    it('should calculate unit cost correctly', () => {
      component.nuevoIngrediente.ingrediente = '1';
      const unitCost = component.calcularCostoUnitario();
      expect(unitCost).toBe(2.5); // 2.5 / 1
    });

    it('should calculate total cost correctly', () => {
      component.subreceta.ingredientes = [
        { ingrediente: '1', cantidad: 2, costo: 5, editing: false },
        { ingrediente: '1', cantidad: 1, costo: 2.5, editing: false }
      ];

      const totalCost = component.calcularCostoTotal();
      expect(totalCost).toBe(7.5);
    });

    it('should return 0 for total cost when no ingredientes', () => {
      const totalCost = component.calcularCostoTotal();
      expect(totalCost).toBe(0);
    });
  });

  describe('ingrediente info methods', () => {
    beforeEach(() => {
      component.ingredientesDisponibles = [
        { _id: '1', nombre: 'Tomate', precio: 2.5, medida: 1, unidad: 'kg' },
        { _id: '2', nombre: 'Cebolla', precio: 1.8, medida: 1, unidad: 'kg' }
      ];
    });

    it('should get ingrediente name', () => {
      const name = component.getNombreIngrediente('1');
      expect(name).toBe('Tomate');
    });

    it('should get ingrediente unit', () => {
      const unit = component.getUnidadIngrediente('1');
      expect(unit).toBe('kg');
    });

    it('should get ingrediente price', () => {
      const price = component.getPrecioIngrediente('1');
      expect(price).toBe(2.5);
    });

    it('should get ingrediente measure', () => {
      const measure = component.getMedidaIngrediente('1');
      expect(measure).toBe(1);
    });

    it('should return default values for unknown ingrediente', () => {
      expect(component.getNombreIngrediente('999')).toBe('Nombre no disponible');
      expect(component.getUnidadIngrediente('999')).toBe('u');
      expect(component.getPrecioIngrediente('999')).toBe(0);
      expect(component.getMedidaIngrediente('999')).toBe(0);
    });
  });

  describe('ingrediente editing', () => {
    beforeEach(() => {
      component.subreceta.ingredientes = [
        { ingrediente: '1', cantidad: 2, costo: 5, editing: false }
      ];
    });

    it('should enable editing mode', () => {
      component.editarIngrediente(0);
      expect(component.subreceta.ingredientes[0].editing).toBeTrue();
      expect(component.subreceta.ingredientes[0].tempCantidad).toBe(2);
    });

    it('should cancel editing', () => {
      component.subreceta.ingredientes[0].editing = true;
      component.subreceta.ingredientes[0].tempCantidad = 5;

      component.cancelarEdicionIngrediente(0);

      expect(component.subreceta.ingredientes[0].editing).toBeFalse();
      expect(component.subreceta.ingredientes[0].tempCantidad).toBeUndefined();
    });

    it('should delete ingrediente', () => {
      component.eliminarIngrediente(0);
      expect(component.subreceta.ingredientes.length).toBe(0);
    });
  });
});
