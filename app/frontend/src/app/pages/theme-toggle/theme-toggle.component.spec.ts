import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';

// Componente a testear
import { ThemeToggleComponent } from './theme-toggle.component';
import { ThemeService } from '../../services/theme.service';

// Material modules
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Mock del ThemeService
class MockThemeService {
  isDarkTheme = jasmine.createSpy('isDarkTheme').and.returnValue(false);
  toggleTheme = jasmine.createSpy('toggleTheme');
}

describe('ThemeToggleComponent', () => {
  let component: ThemeToggleComponent;
  let fixture: ComponentFixture<ThemeToggleComponent>;
  let themeService: MockThemeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        ThemeToggleComponent // Componente standalone
      ],
      providers: [
        { provide: ThemeService, useClass: MockThemeService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeToggleComponent);
    component = fixture.componentInstance;
    themeService = TestBed.inject(ThemeService) as unknown as MockThemeService;
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería llamar a toggleTheme() del servicio cuando se hace click', () => {
    // Simular click en el botón
    component.toggleTheme();

    expect(themeService.toggleTheme).toHaveBeenCalled();
  });

  it('debería mostrar el icono de modo claro cuando el tema es oscuro', () => {
    // Configurar el mock para que devuelva que el tema es oscuro
    themeService.isDarkTheme.and.returnValue(true);

    fixture.detectChanges(); // Para que se actualice la vista

    const compiled = fixture.nativeElement as HTMLElement;
    const icon = compiled.querySelector('mat-icon');

    expect(icon?.textContent).toContain('light_mode');
  });

  it('debería mostrar el icono de modo oscuro cuando el tema es claro', () => {
    // Configurar el mock para que devuelva que el tema es claro
    themeService.isDarkTheme.and.returnValue(false);

    fixture.detectChanges(); // Para que se actualice la vista

    const compiled = fixture.nativeElement as HTMLElement;
    const icon = compiled.querySelector('mat-icon');

    expect(icon?.textContent).toContain('dark_mode');
  });

  it('debería tener un botón con la clase theme-toggle', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button.theme-toggle');

    expect(button).toBeTruthy();
  });

  it('debería llamar a toggleTheme() cuando se hace click en el botón', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button') as HTMLElement;

    button.click();

    expect(themeService.toggleTheme).toHaveBeenCalled();
  });
});
