import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// Componente a testear
import { AuthCallbackComponent } from './auth-callback.component';
import { AuthService } from '../../services/auth.service';

// Mocks
class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

class MockAuthService {
  forceReload = jasmine.createSpy('forceReload');
}

describe('AuthCallbackComponent', () => {
  let component: AuthCallbackComponent;
  let fixture: ComponentFixture<AuthCallbackComponent>;
  let router: MockRouter;
  let authService: MockAuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        AuthCallbackComponent // Componente standalone
      ],
      providers: [
        { provide: Router, useClass: MockRouter },
        { provide: AuthService, useClass: MockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthCallbackComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as unknown as MockRouter;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;

    // Limpiar localStorage antes de cada test
    localStorage.clear();
    // Limpiar el hash de la URL
    window.location.hash = '';
  });

  afterEach(() => {
    localStorage.clear();
    window.location.hash = '';
    router.navigate.calls.reset();
    authService.forceReload.calls.reset();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('finalizeAuth', () => {
    it('debería redirigir a dashboard si ya hay token en localStorage', fakeAsync(() => {
      // Configurar localStorage con token
      localStorage.setItem('authToken', 'test-token-123');

      component.ngOnInit();
      tick();

      expect(authService.forceReload).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    }));

    it('debería procesar el hash y redirigir a dashboard si hay token válido', fakeAsync(() => {
      // Simular hash con token válido
      const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsIm5vbWJyZSI6IlRlc3QiLCJhcGVsbGlkbyI6IlVzZXIifQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      window.location.hash = `#?token=${testToken}&success=true`;

      component.ngOnInit();
      tick();

      expect(localStorage.getItem('authToken')).toBe(testToken);
      expect(localStorage.getItem('userData')).toContain('"email":"test@example.com"');
      expect(authService.forceReload).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    }));

    it('debería redirigir a login con error si no hay token en hash', fakeAsync(() => {
      // Simular hash sin token
      window.location.hash = '#?success=false';

      component.ngOnInit();
      tick();

      expect(localStorage.getItem('authToken')).toBeNull();
      expect(authService.forceReload).not.toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(
        ['/login'],
        { queryParams: { error: 'auth_failed' } }
      );
    }));

    it('debería redirigir a login con error si success no es true', fakeAsync(() => {
      // Simular hash con token pero success=false
      window.location.hash = '#?token=test-token&success=false';

      component.ngOnInit();
      tick();

      expect(localStorage.getItem('authToken')).toBeNull();
      expect(authService.forceReload).not.toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(
        ['/login'],
        { queryParams: { error: 'auth_failed' } }
      );
    }));

    it('debería manejar error al decodificar JWT y aún así redirigir a dashboard', fakeAsync(() => {
      // Simular token JWT inválido
      window.location.hash = '#?token=invalid-token&success=true';

      spyOn(console, 'warn'); // Espiar console.warn

      component.ngOnInit();
      tick();

      expect(localStorage.getItem('authToken')).toBe('invalid-token');
      expect(console.warn).toHaveBeenCalled(); // Debería haber llamado a console.warn
      expect(authService.forceReload).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    }));

    it('debería manejar caso donde hash no tiene parámetros de query', fakeAsync(() => {
      // Simular hash sin parámetros
      window.location.hash = '#';

      component.ngOnInit();
      tick();

      expect(localStorage.getItem('authToken')).toBeNull();
      expect(authService.forceReload).not.toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(
        ['/login'],
        { queryParams: { error: 'auth_failed' } }
      );
    }));

    it('debería manejar caso donde hash está vacío', fakeAsync(() => {
      // Simular hash vacío
      window.location.hash = '';

      component.ngOnInit();
      tick();

      expect(localStorage.getItem('authToken')).toBeNull();
      expect(authService.forceReload).not.toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(
        ['/login'],
        { queryParams: { error: 'auth_failed' } }
      );
    }));
  });

  describe('decodificación JWT', () => {
    it('debería decodificar correctamente un JWT válido', () => {
      // JWT válido con payload: { userId: "123", email: "test@example.com", role: "user", nombre: "Test", apellido: "User" }
      const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsIm5vbWJyZSI6IlRlc3QiLCJhcGVsbGlkbyI6IlVzZXIifQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      window.location.hash = `#?token=${testToken}&success=true`;

      component.ngOnInit();

      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      expect(userData).toEqual({
        _id: '123',
        email: 'test@example.com',
        role: 'user',
        nombre: 'Test',
        apellido: 'User'
      });
    });

    it('debería manejar JWT con formato incorrecto', () => {
      // Token con formato incorrecto (solo 2 partes)
      const invalidToken = 'part1.part2';

      window.location.hash = `#?token=${invalidToken}&success=true`;
      spyOn(console, 'warn');

      component.ngOnInit();

      expect(console.warn).toHaveBeenCalled();
      // Aún debería guardar el token aunque no se pueda decodificar
      expect(localStorage.getItem('authToken')).toBe(invalidToken);
    });

    it('debería manejar JWT con base64 inválido', () => {
      // Token con base64 inválido
      const invalidToken = 'part1.invalid-base64.part3';

      window.location.hash = `#?token=${invalidToken}&success=true`;
      spyOn(console, 'warn');

      component.ngOnInit();

      expect(console.warn).toHaveBeenCalled();
      // Aún debería guardar el token aunque no se pueda decodificar
      expect(localStorage.getItem('authToken')).toBe(invalidToken);
    });
  });
});
