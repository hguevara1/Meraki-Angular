import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LoginComponent } from './login.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TranslateService } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { Pipe, PipeTransform } from '@angular/core';

// Mock para el pipe de traducción
@Pipe({ name: 'translate' })
class MockTranslatePipe implements PipeTransform {
  transform(value: string): string {
    const translations: { [key: string]: string } = {
      'LOGIN.INVALID_FORM': 'Formulario inválido',
      'LOGIN.INVALID_CREDENTIALS': 'Credenciales inválidas',
      'LOGIN.SERVER_ERROR': 'Error del servidor',
      'LOGIN.CONNECTION_ERROR': 'Error de conexión',
      'LOGIN.GOOGLE_ERROR': 'Error de Google',
      'LOGIN.WELCOME_MESSAGE': 'Bienvenido a Meraki',
      'LOGIN.LOGIN_TITLE': 'Iniciar Sesión',
      'LOGIN.USERNAME': 'Usuario',
      'LOGIN.PASSWORD': 'Contraseña',
      'LOGIN.LOGIN_BUTTON': 'Iniciar Sesión',
      'LOGIN.FORGOT_PASSWORD': '¿Olvidaste tu contraseña?',
      'LOGIN.OR_CONTINUE_WITH': 'O continúa con',
      'LOGIN.GOOGLE_LOGIN': 'Iniciar con Google',
      'LOGIN.NO_ACCOUNT': '¿No tienes cuenta?',
      'LOGIN.SIGN_UP': 'Regístrate'
    };
    return translations[value] || value;
  }
}

// Mock simplificado para TranslateService
class MockTranslateService {
  instant(key: string): string {
    const translations: { [key: string]: string } = {
      'LOGIN.INVALID_FORM': 'Formulario inválido',
      'LOGIN.INVALID_CREDENTIALS': 'Credenciales inválidas',
      'LOGIN.SERVER_ERROR': 'Error del servidor',
      'LOGIN.CONNECTION_ERROR': 'Error de conexión',
      'LOGIN.GOOGLE_ERROR': 'Error de Google'
    };
    return translations[key] || key;
  }

  get(key: string | string[]): any {
    const translations: { [key: string]: string } = {
      'LOGIN.INVALID_FORM': 'Formulario inválido',
      'LOGIN.INVALID_CREDENTIALS': 'Credenciales inválidas',
      'LOGIN.SERVER_ERROR': 'Error del servidor',
      'LOGIN.CONNECTION_ERROR': 'Error de conexión',
      'LOGIN.GOOGLE_ERROR': 'Error de Google'
    };

    if (Array.isArray(key)) {
      return of(key.map(k => translations[k] || k));
    }
    return of(translations[key] || key);
  }

  use(lang: string): void {}
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([
          { path: 'dashboard', component: {} as any }
        ]),
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        LoginComponent
      ],
      providers: [
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: MockTranslatePipe, useValue: new MockTranslatePipe() }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);

    spyOn(router, 'navigate').and.callThrough();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize login form with empty values', () => {
    expect(component.loginForm.value).toEqual({ email: '', password: '' });
  });

  it('should show error message when form is invalid and submitted', () => {
    component.loginForm.setValue({ email: '', password: '' });
    component.onSubmit();
    expect(component.errorMessage).toBe('Formulario inválido');
  });

  it('should show error for invalid email format', () => {
    component.loginForm.setValue({ email: 'invalid-email', password: 'password' });
    const emailControl = component.loginForm.get('email');
    expect(emailControl?.invalid).toBeTruthy();
    expect(emailControl?.errors?.['email']).toBeTruthy();
  });

  it('should make HTTP request when form is valid', () => {
    const loginData = { email: 'test@example.com', password: 'password' };
    component.loginForm.setValue(loginData);
    component.onSubmit();

    const req = httpMock.expectOne('http://localhost:5000/api/users/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(loginData);
    req.flush({});
  });

  it('should handle successful login with specific user hguevarasoto@gmail.com', fakeAsync(() => {
    const loginData = { email: 'hguevarasoto@gmail.com', password: '1234' };
    const mockResponse = {
      token: 'mock-jwt-token',
      user: {
        _id: '1',
        email: 'hguevarasoto@gmail.com',
        role: 'user',
        nombre: 'Hector',
        apellido: 'Guevara'
      }
    };

    component.loginForm.setValue(loginData);
    component.onSubmit();

    const req = httpMock.expectOne('http://localhost:5000/api/users/login');
    req.flush(mockResponse);

    tick();

    expect(localStorage.getItem('authToken')).toBe('mock-jwt-token');
    expect(localStorage.getItem('userData')).toBe(JSON.stringify(mockResponse.user));
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(component.isLoading).toBeFalse();
  }));

  it('should handle login error - invalid credentials', fakeAsync(() => {
    const loginData = { email: 'wrong@email.com', password: 'wrongpassword' };
    component.loginForm.setValue(loginData);
    component.onSubmit();

    const req = httpMock.expectOne('http://localhost:5000/api/users/login');
    req.flush({ message: 'Invalid credentials' }, {
      status: 400,
      statusText: 'Bad Request'
    });

    tick();

    expect(component.errorMessage).toBe('Invalid credentials');
    expect(component.isLoading).toBeFalse();
  }));

  it('should set loading state correctly during login process', () => {
    const loginData = { email: 'test@example.com', password: 'password' };
    component.loginForm.setValue(loginData);
    component.onSubmit();

    expect(component.isLoading).toBeTrue();

    const req = httpMock.expectOne('http://localhost:5000/api/users/login');
    req.flush({
      token: 'mock-token',
      user: { email: 'test@example.com', role: 'user' }
    });

    expect(component.isLoading).toBeFalse();
  });

  it('should handle Google error from URL parameters without page reload', () => {
    const urlParamsSpy = spyOn(URLSearchParams.prototype, 'get').and.returnValue('google_error');

    component.ngOnInit();

    expect(component.errorMessage).toBe('Error de Google');
    expect(urlParamsSpy).toHaveBeenCalled();
  });

  it('should validate email format correctly', () => {
    const emailControl = component.loginForm.get('email');

    emailControl?.setValue('invalid-email');
    expect(emailControl?.valid).toBeFalse();

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.valid).toBeTrue();
  });

  it('should validate password required', () => {
    const passwordControl = component.loginForm.get('password');

    passwordControl?.setValue('');
    expect(passwordControl?.valid).toBeFalse();

    passwordControl?.setValue('password123');
    expect(passwordControl?.valid).toBeTrue();
  });
});
