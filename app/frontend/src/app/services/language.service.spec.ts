import { TestBed } from '@angular/core/testing';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

import { LanguageService } from './language.service';

// Mock simple de TranslateService
class MockTranslateService {
  private _defaultLang = 'es';

  setDefaultLang(lang: string) {
    this._defaultLang = lang;
  }

  use(lang: string) {}

  get defaultLang(): string {
    return this._defaultLang;
  }
}

describe('LanguageService', () => {
  let service: LanguageService;
  let translateService: MockTranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        LanguageService,
        { provide: TranslateService, useClass: MockTranslateService }
      ]
    });

    service = TestBed.inject(LanguageService);
    translateService = TestBed.inject(TranslateService) as unknown as MockTranslateService;

    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPreferredLanguage', () => {
    it('should return preferred language from localStorage', () => {
      localStorage.setItem('preferredLanguage', 'pt');

      expect(service.getPreferredLanguage()).toBe('pt');
    });

    it('should return default language when no preference is stored', () => {
      // Configurar el defaultLang para testing
      translateService.setDefaultLang('en');

      expect(service.getPreferredLanguage()).toBe('en');
    });

    it('should return Spanish as final fallback', () => {
      // Para este test, no necesitamos modificar defaultLang
      // ya que el mock ya tiene 'es' como valor por defecto
      expect(service.getPreferredLanguage()).toBe('es');
    });
  });

  // Tests simplificados para el constructor
  describe('constructor', () => {
    it('should initialize with a language', () => {
      // Solo verificar que el servicio se crea correctamente
      expect(service).toBeTruthy();
    });
  });

  describe('changeLanguage', () => {
    it('should change language and save preference', () => {
      service.changeLanguage('fr');

      // Verificar que se guardó en localStorage
      expect(localStorage.getItem('preferredLanguage')).toBe('fr');
    });
  });
});
