import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { LanguageService } from './services/language.service';
import { of } from 'rxjs';

// Mocks para los servicios
const mockTranslateService = {
  setDefaultLang: jasmine.createSpy('setDefaultLang'),
  use: jasmine.createSpy('use').and.returnValue(of({})),
  instant: jasmine.createSpy('instant')
};

const mockRouter = {
  events: of({}),
  navigate: jasmine.createSpy('navigate')
};

const mockAuthService = {
  isAuthenticated: jasmine.createSpy('isAuthenticated')
};

const mockLanguageService = {
  getPreferredLanguage: jasmine.createSpy('getPreferredLanguage').and.returnValue('es'),
  changeLanguage: jasmine.createSpy('changeLanguage')
};

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        TranslateModule.forRoot() // Provee TranslateService
      ],
      providers: [
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService },
        { provide: LanguageService, useValue: mockLanguageService }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'frontend' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('frontend');
  });

  it('should initialize with default language', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    // Verifica que se llamó a getPreferredLanguage
    expect(mockLanguageService.getPreferredLanguage).toHaveBeenCalled();

    // Verifica que se configuró el idioma por defecto
    expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('es');
    expect(mockTranslateService.use).toHaveBeenCalledWith('es');
  });

  it('should change language correctly', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    app.changeLanguage('en');

    expect(mockLanguageService.changeLanguage).toHaveBeenCalledWith('en');
    expect(app.selectedLanguageLabel).toBe('Inglés');
  });

  it('should handle language change to Portuguese', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    app.changeLanguage('pt');

    expect(mockLanguageService.changeLanguage).toHaveBeenCalledWith('pt');
    expect(app.selectedLanguageLabel).toBe('Portugués');
  });
});
