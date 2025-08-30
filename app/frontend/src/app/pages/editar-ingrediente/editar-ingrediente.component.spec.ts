import { EditarIngredienteComponent } from './editar-ingrediente.component';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';

// Mocks para los servicios
const mockHttpClient = {
  get: jasmine.createSpy('get').and.returnValue(of({})),
  put: jasmine.createSpy('put').and.returnValue(of({}))
};

const mockRouter = {
  navigate: jasmine.createSpy('navigate')
};

const mockSnackBar = {
  open: jasmine.createSpy('open')
};

// Mock para ActivatedRoute con paramMap
const createMockActivatedRoute = (id: string) => ({
  snapshot: {
    paramMap: {
      get: jasmine.createSpy('get').and.returnValue(id)
    }
  }
});

describe('EditarIngredienteComponent', () => {
  let component: EditarIngredienteComponent;
  let fb: FormBuilder;
  let mockActivatedRoute: any;

  beforeEach(() => {
    fb = new FormBuilder();
    mockActivatedRoute = createMockActivatedRoute('test-id');

    component = new EditarIngredienteComponent(
      fb,
      mockHttpClient as any,
      mockRouter as any,
      mockActivatedRoute as any,
      mockSnackBar as any
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct ingredienteId from route on ngOnInit', () => {
    component.ngOnInit();
    expect(component.ingredienteId).toBe('test-id');
  });

  it('should initialize the form with correct validators', () => {
    expect(component.ingredienteForm).toBeDefined();
    expect(component.ingredienteForm.get('nombre')?.hasValidator(Validators.required)).toBeTrue();
    expect(component.ingredienteForm.get('medida')?.hasValidator(Validators.required)).toBeTrue();
    expect(component.ingredienteForm.get('unidad')?.hasValidator(Validators.required)).toBeTrue();
  });

  it('should have correct unidades array', () => {
    expect(component.unidades).toEqual(['gr', 'ml', 'kg', 'lt', 'unidad', 'docena']);
  });

  it('should cancel and navigate back', () => {
    component.cancelar();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/ingredientes']);
  });

  describe('form validation', () => {
    it('should validate nombre field', () => {
      const nombreControl = component.ingredienteForm.get('nombre');

      nombreControl?.setValue('');
      expect(nombreControl?.hasError('required')).toBeTrue();

      nombreControl?.setValue('a');
      expect(nombreControl?.hasError('minlength')).toBeTrue();

      nombreControl?.setValue('Tomate');
      expect(nombreControl?.valid).toBeTrue();
    });

    it('should validate precio field', () => {
      const precioControl = component.ingredienteForm.get('precio');

      precioControl?.setValue(-1);
      expect(precioControl?.hasError('min')).toBeTrue();

      precioControl?.setValue(0);
      expect(precioControl?.valid).toBeTrue();

      precioControl?.setValue(2.5);
      expect(precioControl?.valid).toBeTrue();
    });

    it('should validate medida field', () => {
      const medidaControl = component.ingredienteForm.get('medida');

      medidaControl?.setValue(null);
      expect(medidaControl?.hasError('required')).toBeTrue();

      medidaControl?.setValue(0);
      expect(medidaControl?.hasError('min')).toBeTrue();

      medidaControl?.setValue(1);
      expect(medidaControl?.valid).toBeTrue();
    });
  });

  // Solo pruebas básicas de éxito
  it('should load ingrediente successfully', () => {
    component.ingredienteId = 'test-id';
    const mockIngrediente = { nombre: 'Tomate', precio: 2.5, medida: 1, unidad: 'kg' };
    mockHttpClient.get.and.returnValue(of(mockIngrediente));

    component.cargarIngrediente();

    expect(mockHttpClient.get).toHaveBeenCalledWith('http://localhost:5000/api/ingredientes/test-id');
    expect(component.ingredienteForm.value).toEqual(mockIngrediente);
    expect(component.isLoading).toBeFalse();
  });

  it('should submit form successfully', () => {
    component.ingredienteId = 'test-id';
    component.ingredienteForm.setValue({ nombre: 'Tomate', precio: 2.5, medida: 1, unidad: 'kg' });

    component.onSubmit();

    expect(mockHttpClient.put).toHaveBeenCalledWith(
      'http://localhost:5000/api/ingredientes/test-id',
      { nombre: 'Tomate', precio: 2.5, medida: 1, unidad: 'kg' }
    );
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      '✅ Ingrediente actualizado correctamente',
      'Cerrar',
      { duration: 3000 }
    );
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/ingredientes']);
  });
});
