import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ThemeService]
    });

    service = TestBed.inject(ThemeService);

    localStorage.clear();
    document.body.classList.remove('dark-theme');
  });

  afterEach(() => {
    localStorage.clear();
    document.body.classList.remove('dark-theme');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('constructor', () => {
    it('should load dark theme from localStorage if saved', () => {
      localStorage.setItem('theme', 'dark');

      // Recreate service to trigger constructor
      const newService = new ThemeService();

      expect(newService.isDarkTheme()).toBeTrue();
      expect(document.body.classList.contains('dark-theme')).toBeTrue();
    });

    it('should load light theme from localStorage if saved', () => {
      localStorage.setItem('theme', 'light');

      // Recreate service to trigger constructor
      const newService = new ThemeService();

      expect(newService.isDarkTheme()).toBeFalse();
      expect(document.body.classList.contains('dark-theme')).toBeFalse();
    });

    it('should default to light theme if no theme is saved', () => {
      expect(service.isDarkTheme()).toBeFalse();
      expect(document.body.classList.contains('dark-theme')).toBeFalse();
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark theme', () => {
      expect(service.isDarkTheme()).toBeFalse();

      service.toggleTheme();

      expect(service.isDarkTheme()).toBeTrue();
      expect(document.body.classList.contains('dark-theme')).toBeTrue();
      expect(localStorage.getItem('theme')).toBe('dark');
    });

    it('should toggle from dark to light theme', () => {
      service.toggleTheme(); // Switch to dark first

      service.toggleTheme(); // Then switch back to light

      expect(service.isDarkTheme()).toBeFalse();
      expect(document.body.classList.contains('dark-theme')).toBeFalse();
      expect(localStorage.getItem('theme')).toBe('light');
    });
  });

  describe('isDarkTheme', () => {
    it('should return true when dark theme is active', () => {
      service.toggleTheme(); // Switch to dark

      expect(service.isDarkTheme()).toBeTrue();
    });

    it('should return false when light theme is active', () => {
      expect(service.isDarkTheme()).toBeFalse();
    });
  });
});
