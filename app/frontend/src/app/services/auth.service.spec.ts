import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router'; // ✅ Agregar importación
import { BehaviorSubject } from 'rxjs';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let mockRouter: any;

  beforeEach(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: mockRouter }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadUserFromStorage', () => {
    it('should load user data from localStorage when valid token exists', () => {
      const mockUser = { _id: '1', email: 'test@test.com', role: 'user', nombre: 'Test', apellido: 'User' };
      const mockToken = 'valid.token.here';

      // Mock a token that's not expired (exp set to future)
      const payload = { exp: Math.floor(Date.now() / 1000) + 3600 }; // 1 hour from now
      spyOn(service as any, 'isTokenExpired').and.returnValue(false);

      localStorage.setItem('authToken', mockToken);
      localStorage.setItem('userData', JSON.stringify(mockUser));

      service.loadUserFromStorage();

      service.getCurrentUser().subscribe(user => {
        expect(user).toEqual(mockUser);
      });
    });

    it('should clear storage when token is expired', () => {
      const mockToken = 'expired.token.here';
      const mockUser = { _id: '1', email: 'test@test.com', role: 'user', nombre: 'Test', apellido: 'User' };

      spyOn(service as any, 'isTokenExpired').and.returnValue(true);

      localStorage.setItem('authToken', mockToken);
      localStorage.setItem('userData', JSON.stringify(mockUser));

      service.loadUserFromStorage();

      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('userData')).toBeNull();
      expect(mockRouter.navigate).not.toHaveBeenCalled(); // redirect=false by default
    });

    it('should set user to null when no data in localStorage', () => {
      service.loadUserFromStorage();

      service.getCurrentUser().subscribe(user => {
        expect(user).toBeNull();
      });
    });
  });

  describe('login', () => {
    it('should make POST request to login endpoint and store auth data', () => {
      const credentials = { email: 'test@test.com', password: 'password' };
      const mockResponse = {
        token: 'jwt.token.here',
        user: { _id: '1', email: 'test@test.com', role: 'user', nombre: 'Test', apellido: 'User' }
      };

      service.login(credentials).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(localStorage.getItem('authToken')).toBe(mockResponse.token);
        expect(localStorage.getItem('userData')).toBe(JSON.stringify(mockResponse.user));
      });

      const req = httpMock.expectOne('http://localhost:5000/api/users/login');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when valid token exists', () => {
      const mockToken = 'valid.token.here';
      spyOn(service as any, 'isTokenExpired').and.returnValue(false);

      localStorage.setItem('authToken', mockToken);

      expect(service.isAuthenticated()).toBeTrue();
    });

    it('should return false when token is expired', () => {
      const mockToken = 'expired.token.here';
      spyOn(service as any, 'isTokenExpired').and.returnValue(true);

      localStorage.setItem('authToken', mockToken);

      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should return false when no token exists', () => {
      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  describe('logout', () => {
    it('should clear storage and redirect when redirect is true', () => {
      localStorage.setItem('authToken', 'token');
      localStorage.setItem('userData', 'user data');

      service.logout(true);

      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('userData')).toBeNull();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should clear storage but not redirect when redirect is false', () => {
      localStorage.setItem('authToken', 'token');
      localStorage.setItem('userData', 'user data');

      service.logout(false);

      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('userData')).toBeNull();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      const mockToken = 'test.token';
      localStorage.setItem('authToken', mockToken);

      expect(service.getToken()).toBe(mockToken);
    });

    it('should return null when no token exists', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('getUserData', () => {
    it('should return user data from localStorage', () => {
      const mockUser = { _id: '1', email: 'test@test.com', role: 'user', nombre: 'Test', apellido: 'User' };
      localStorage.setItem('userData', JSON.stringify(mockUser));

      expect(service.getUserData()).toEqual(mockUser);
    });

    it('should return null when no user data exists', () => {
      expect(service.getUserData()).toBeNull();
    });
  });

  describe('forceReload', () => {
    it('should call loadUserFromStorage', () => {
      spyOn(service, 'loadUserFromStorage');

      service.forceReload();

      expect(service.loadUserFromStorage).toHaveBeenCalled();
    });
  });

  describe('isTokenExpired', () => {
    it('should return true for expired token', () => {
      const expiredToken = 'header.' + btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 3600 })) + '.signature';

      expect((service as any).isTokenExpired(expiredToken)).toBeTrue();
    });

    it('should return false for valid token', () => {
      const validToken = 'header.' + btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })) + '.signature';

      expect((service as any).isTokenExpired(validToken)).toBeFalse();
    });

    it('should return true for invalid token', () => {
      const invalidToken = 'invalid.token';

      expect((service as any).isTokenExpired(invalidToken)).toBeTrue();
    });

    it('should return false for token without exp', () => {
      const tokenWithoutExp = 'header.' + btoa(JSON.stringify({})) + '.signature';

      expect((service as any).isTokenExpired(tokenWithoutExp)).toBeFalse();
    });
  });
});
