import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

// Componente a testear
import { RegistrarComponent } from './registrar.component';

// Material modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

describe('RegistrarComponent', () => {
  let component: RegistrarComponent;
  let fixture: ComponentFixture<RegistrarComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule,
        RouterTestingModule,
        NoopAnimationsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        RegistrarComponent // Componente standalone
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar el formulario con campos vacíos', () => {
    expect(component.registerForm).toBeDefined();
    expect(component.registerForm.get('nombre')?.value).toBe('');
    expect(component.registerForm.get('apellido')?.value).toBe('');
    expect(component.registerForm.get('email')?.value).toBe('');
    expect(component.registerForm.get('telefono')?.value).toBe('');
    expect(component.registerForm.get('password')?.value).toBe('');
    expect(component.registerForm.get('confirmPassword')?.value).toBe('');
  });

  it('debería marcar el formulario como inválido cuando está vacío', () => {
    expect(component.registerForm.valid).toBeFalse();
  });

  it('debería marcar el formulario como válido cuando todos los campos están completos', () => {
    component.registerForm.patchValue({
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@example.com',
      telefono: '123456789',
      password: 'password123',
      confirmPassword: 'password123'
    });

    expect(component.registerForm.valid).toBeTrue();
  });

  it('debería mostrar error cuando las contraseñas no coinciden', () => {
    component.registerForm.patchValue({
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@example.com',
      telefono: '123456789',
      password: 'password123',
      confirmPassword: 'differentpassword'
    });

    expect(component.registerForm.hasError('mismatch')).toBeFalse(); // No tiene validador personalizado
    // Verificamos la validación manual en onSubmit
    component.onSubmit();
    expect(component.errorMessage).toBe('Las contraseñas no coinciden.');
  });

  it('debería mostrar error cuando el formulario es inválido', () => {
    component.registerForm.patchValue({
      nombre: '', // Campo requerido vacío
      apellido: 'Pérez',
      email: 'invalid-email', // Email inválido
      telefono: '123456789',
      password: 'pass', // Mínimo 4 caracteres (debería ser válido)
      confirmPassword: 'pass'
    });

    component.onSubmit();
    expect(component.errorMessage).toBe('Por favor completa todos los campos correctamente.');
  });

  it('debería enviar el formulario cuando es válido', fakeAsync(() => {
    component.registerForm.patchValue({
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@example.com',
      telefono: '123456789',
      password: 'password123',
      confirmPassword: 'password123'
    });

    component.onSubmit();

    const req = httpMock.expectOne('http://localhost:5000/api/users/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@example.com',
      telefono: '123456789',
      password: 'password123',
      confirmPassword: 'password123'
    });

    req.flush({ message: 'Usuario registrado correctamente' });

    tick();

    expect(component.successMessage).toBe('Usuario registrado correctamente 🎉');
    expect(component.errorMessage).toBe('');
  }));

  it('debería manejar error en el registro', fakeAsync(() => {
    component.registerForm.patchValue({
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@example.com',
      telefono: '123456789',
      password: 'password123',
      confirmPassword: 'password123'
    });

    component.onSubmit();

    const req = httpMock.expectOne('http://localhost:5000/api/users/register');
    req.flush({ message: 'Email ya existe' }, { status: 400, statusText: 'Bad Request' });

    tick();

    expect(component.errorMessage).toBe('Email ya existe');
    expect(component.successMessage).toBe('');
  }));

  it('debería manejar error genérico cuando no hay mensaje específico', fakeAsync(() => {
    component.registerForm.patchValue({
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@example.com',
      telefono: '123456789',
      password: 'password123',
      confirmPassword: 'password123'
    });

    component.onSubmit();

    const req = httpMock.expectOne('http://localhost:5000/api/users/register');
    req.flush({}, { status: 500, statusText: 'Server Error' });

    tick();

    expect(component.errorMessage).toBe('Error al registrar usuario');
    expect(component.successMessage).toBe('');
  }));

  describe('Validaciones de formulario', () => {
    it('debería requerir nombre', () => {
      const nombreControl = component.registerForm.get('nombre');
      nombreControl?.setValue('');
      expect(nombreControl?.hasError('required')).toBeTrue();
    });

    it('debería requerir apellido', () => {
      const apellidoControl = component.registerForm.get('apellido');
      apellidoControl?.setValue('');
      expect(apellidoControl?.hasError('required')).toBeTrue();
    });

    it('debería requerir email válido', () => {
      const emailControl = component.registerForm.get('email');

      emailControl?.setValue('');
      expect(emailControl?.hasError('required')).toBeTrue();

      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBeTrue();

      emailControl?.setValue('valid@example.com');
      expect(emailControl?.valid).toBeTrue();
    });

    it('debería requerir teléfono', () => {
      const telefonoControl = component.registerForm.get('telefono');
      telefonoControl?.setValue('');
      expect(telefonoControl?.hasError('required')).toBeTrue();
    });

    it('debería requerir contraseña con mínimo 4 caracteres', () => {
      const passwordControl = component.registerForm.get('password');

      passwordControl?.setValue('');
      expect(passwordControl?.hasError('required')).toBeTrue();

      passwordControl?.setValue('123');
      expect(passwordControl?.hasError('minlength')).toBeTrue();

      passwordControl?.setValue('1234');
      expect(passwordControl?.valid).toBeTrue();
    });

    it('debería requerir confirmación de contraseña', () => {
      const confirmPasswordControl = component.registerForm.get('confirmPassword');
      confirmPasswordControl?.setValue('');
      expect(confirmPasswordControl?.hasError('required')).toBeTrue();
    });
  });
});
