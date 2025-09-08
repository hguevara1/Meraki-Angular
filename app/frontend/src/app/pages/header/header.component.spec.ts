import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Componente a testear
import { HeaderComponent } from './header.component';
import { AuthService } from '../../services/auth.service';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

// Mocks
class MockAuthService {
  getUserData = jasmine.createSpy('getUserData');
  logout = jasmine.createSpy('logout');
}

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authService: MockAuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        MatIconModule,
        MatButtonModule,
        HeaderComponent,
        ThemeToggleComponent
      ],
      providers: [
        { provide: AuthService, useClass: MockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
  });

  afterEach(() => {
    authService.getUserData.calls.reset();
    authService.logout.calls.reset();
  });



  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

    it('debería inicializar userEmail con el email del usuario autenticado', () => {
      const mockUserData = {
        email: 'usuario@ejemplo.com',
        _id: '123',
        role: 'user',
        nombre: 'Usuario',
        apellido: 'Ejemplo'
      };

      authService.getUserData.and.returnValue(mockUserData);

      fixture.detectChanges(); // Ejecuta ngOnInit

      expect(component.userEmail).toBe('usuario@ejemplo.com');
      expect(authService.getUserData).toHaveBeenCalled();
    });

    it('debería inicializar userEmail como vacío si no hay usuario autenticado', () => {
      authService.getUserData.and.returnValue(null);

      fixture.detectChanges(); // Ejecuta ngOnInit

      expect(component.userEmail).toBe('');
      expect(authService.getUserData).toHaveBeenCalled();
    });

    it('debería llamar a logout cuando se ejecuta logout()', () => {
      component.logout();
      expect(authService.logout).toHaveBeenCalled();
    });


  it('debería renderizar el email del usuario en el template', () => {
    // Configurar mock para devolver datos de usuario
    const mockUserData = {
      email: 'test@example.com',
      _id: '123',
      role: 'user',
      nombre: 'Test',
      apellido: 'User'
    };
    authService.getUserData.and.returnValue(mockUserData);

    // Recrear el componente y detectar cambios
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const welcomeText = compiled.querySelector('.welcome-text');

    expect(welcomeText?.textContent).toContain('test@example.com');
  });

  it('debería mostrar el componente theme-toggle', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const themeToggle = compiled.querySelector('app-theme-toggle');

    expect(themeToggle).toBeTruthy();
  });

  it('debería tener un botón de logout', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const logoutButton = compiled.querySelector('.logout-btn');

    expect(logoutButton).toBeTruthy();
    expect(logoutButton?.textContent).toContain('Cerrar Sesión');
  });

  // Prueba de interacción con el botón de logout
  it('debería llamar a logout cuando se hace click en el botón', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const logoutButton = compiled.querySelector('.logout-btn') as HTMLElement;

    logoutButton.click();

    expect(authService.logout).toHaveBeenCalled();
  });

  // Prueba con diferentes roles de usuario
  it('debería manejar diferentes roles de usuario', () => {
    const mockAdminData = {
      email: 'admin@ejemplo.com',
      _id: '456',
      role: 'admin',
      nombre: 'Admin',
      apellido: 'Sistema'
    };
    authService.getUserData.and.returnValue(mockAdminData);

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.userEmail).toBe('admin@ejemplo.com');
  });
});
