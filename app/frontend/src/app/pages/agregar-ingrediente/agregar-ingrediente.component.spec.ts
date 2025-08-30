import { AgregarIngredienteComponent } from './agregar-ingrediente.component';
import { FormBuilder, Validators } from '@angular/forms'; // Importar Validators desde aquí
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';

// Mocks para los servicios
const mockHttpClient = {
  post: jasmine.createSpy('post')
};

const mockRouter = {
  navigate: jasmine.createSpy('navigate')
};

const mockSnackBar = {
  open: jasmine.createSpy('open')
};

describe('AgregarIngredienteComponent', () => {
  let component: AgregarIngredienteComponent;
  let fb: FormBuilder;

  beforeEach(() => {
    fb = new FormBuilder();

    component = new AgregarIngredienteComponent(
      fb,
      mockHttpClient as any,
      mockRouter as any,
      mockSnackBar as any
    );

    // Resetear todos los spies antes de cada test
    mockHttpClient.post.calls.reset();
    mockRouter.navigate.calls.reset();
    mockSnackBar.open.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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

  describe('onSubmit', () => {
    it('should not submit if form is invalid', () => {
      // Hacer el formulario inválido
      component.ingredienteForm.get('nombre')?.setValue('');

      component.onSubmit();

      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it('should submit form and navigate on success', () => {
      // Configurar formulario válido
      component.ingredienteForm.setValue({
        nombre: 'Tomate',
        precio: 2.5,
        medida: 1,
        unidad: 'kg'
      });

      mockHttpClient.post.and.returnValue(of({}));

      component.onSubmit();

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        'http://localhost:5000/api/ingredientes',
        {
          nombre: 'Tomate',
          precio: 2.5,
          medida: 1,
          unidad: 'kg'
        }
      );

      expect(mockSnackBar.open).toHaveBeenCalledWith(
        '✅ Ingrediente agregado correctamente',
        'Cerrar',
        { duration: 3000 }
      );

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/ingredientes']);
    });

    it('should show error snackbar on API error', () => {
      // Configurar formulario válido
      component.ingredienteForm.setValue({
        nombre: 'Tomate',
        precio: 2.5,
        medida: 1,
        unidad: 'kg'
      });

      mockHttpClient.post.and.returnValue(throwError(() => new Error('API Error')));

      component.onSubmit();

      expect(mockHttpClient.post).toHaveBeenCalled();
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        '❌ Error al agregar ingrediente',
        'Cerrar',
        { duration: 3000 }
      );
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  it('should cancel and navigate back', () => {
    component.cancelar();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/ingredientes']);
  });

  it('should validate nombre field', () => {
    const nombreControl = component.ingredienteForm.get('nombre');

    // Test required validator
    nombreControl?.setValue('');
    expect(nombreControl?.hasError('required')).toBeTrue();

    // Test minLength validator
    nombreControl?.setValue('a');
    expect(nombreControl?.hasError('minlength')).toBeTrue();

    // Test valid value
    nombreControl?.setValue('Tomate');
    expect(nombreControl?.valid).toBeTrue();
  });

  it('should validate precio field', () => {
    const precioControl = component.ingredienteForm.get('precio');

    // Test min validator
    precioControl?.setValue(-1);
    expect(precioControl?.hasError('min')).toBeTrue();

    // Test valid values
    precioControl?.setValue(0);
    expect(precioControl?.valid).toBeTrue();

    precioControl?.setValue(2.5);
    expect(precioControl?.valid).toBeTrue();

    precioControl?.setValue(null);
    expect(precioControl?.valid).toBeTrue(); // precio es opcional
  });

  it('should validate medida field', () => {
    const medidaControl = component.ingredienteForm.get('medida');

    // Test required validator
    medidaControl?.setValue(null);
    expect(medidaControl?.hasError('required')).toBeTrue();

    // Test min validator
    medidaControl?.setValue(0);
    expect(medidaControl?.hasError('min')).toBeTrue();

    // Test valid value
    medidaControl?.setValue(1);
    expect(medidaControl?.valid).toBeTrue();
  });
});
