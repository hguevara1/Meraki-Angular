import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { MockAuthInterceptor } from '../../interceptors/mock-auth.interceptor'; // Asegúrate de crear este archivo

// Mock para AuthService
class MockAuthService {
  isAuthenticated() { return true; }
  getUserData() {
    return {
      email: 'test@example.com',
      nombre: 'Test',
      apellido: 'User'
    };
  }
  getCurrentUser() {
    return of({
      email: 'test@example.com',
      nombre: 'Test',
      apellido: 'User'
    });
  }
  getToken() { return 'mock-jwt-token'; }
  logout() {}
}

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let httpMock: HttpTestingController;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        HttpClientTestingModule,
        RouterTestingModule,
        MatIconModule,
        MatButtonModule,
        MatCardModule,
        DashboardComponent
      ],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        // ✅ Usar el mock interceptor en lugar del real
        {
          provide: HTTP_INTERCEPTORS,
          useClass: MockAuthInterceptor,
          multi: true
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);

    spyOn(router, 'navigate').and.callThrough();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty values', () => {
    expect(component.userEmail).toBe('');
    expect(component.totalIngredientes).toBe(0);
    expect(component.totalSubrecetas).toBe(0);
    expect(component.totalTortas).toBe(0);
  });

  it('should load user data and counts on initialization', fakeAsync(() => {
    component.ngOnInit();

    // ✅ Las peticiones ahora deberían tener el header Authorization
    const req1 = httpMock.expectOne('http://localhost:5000/api/ingredientes');
    expect(req1.request.headers.get('Authorization')).toBe('Bearer mock-jwt-token');
    req1.flush([{ id: 1 }, { id: 2 }]);

    const req2 = httpMock.expectOne('http://localhost:5000/api/subrecetas');
    expect(req2.request.headers.get('Authorization')).toBe('Bearer mock-jwt-token');
    req2.flush([{ id: 1 }]);

    const req3 = httpMock.expectOne('http://localhost:5000/api/tortas');
    expect(req3.request.headers.get('Authorization')).toBe('Bearer mock-jwt-token');
    req3.flush([{ id: 1 }, { id: 2 }, { id: 3 }]);

    tick();

    expect(component.userEmail).toBe('test@example.com');
    expect(component.totalIngredientes).toBe(2);
    expect(component.totalSubrecetas).toBe(1);
    expect(component.totalTortas).toBe(3);
  }));

  // ... el resto de las pruebas permanecen igual, pero simplificadas
  it('should handle error when loading ingredientes', fakeAsync(() => {
    component.ngOnInit();

    const req1 = httpMock.expectOne('http://localhost:5000/api/ingredientes');
    req1.flush('Error', { status: 500, statusText: 'Server Error' });

    const req2 = httpMock.expectOne('http://localhost:5000/api/subrecetas');
    req2.flush([{ id: 1 }]);

    const req3 = httpMock.expectOne('http://localhost:5000/api/tortas');
    req3.flush([{ id: 1 }]);

    tick();

    expect(component.totalIngredientes).toBe(0);
    expect(component.totalSubrecetas).toBe(1);
    expect(component.totalTortas).toBe(1);
  }));

  // ... otras pruebas similares

  it('should call authService logout on logout', () => {
    const logoutSpy = spyOn(authService, 'logout');
    component.logout();
    expect(logoutSpy).toHaveBeenCalled();
  });

  it('should unsubscribe on destroy', fakeAsync(() => {
    component.ngOnInit();

    const req1 = httpMock.expectOne('http://localhost:5000/api/ingredientes');
    req1.flush([]);

    const req2 = httpMock.expectOne('http://localhost:5000/api/subrecetas');
    req2.flush([]);

    const req3 = httpMock.expectOne('http://localhost:5000/api/tortas');
    req3.flush([]);

    tick();

    const unsubscribeSpy = spyOn(component['authSubscription'], 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  }));

  it('should not try to unsubscribe if no subscription exists', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  it('should handle 401 authentication error', fakeAsync(() => {
    component.ngOnInit();

    const req1 = httpMock.expectOne('http://localhost:5000/api/ingredientes');
    req1.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    const req2 = httpMock.expectOne('http://localhost:5000/api/subrecetas');
    req2.flush([{ id: 1 }]);

    const req3 = httpMock.expectOne('http://localhost:5000/api/tortas');
    req3.flush([{ id: 1 }]);

    tick();

    expect(component.totalIngredientes).toBe(0);
    expect(component.totalSubrecetas).toBe(1);
    expect(component.totalTortas).toBe(1);
  }));

  it('should handle network errors', fakeAsync(() => {
    component.ngOnInit();

    const req1 = httpMock.expectOne('http://localhost:5000/api/ingredientes');
    req1.error(new ErrorEvent('Network error'));

    // ✅ Responder a las otras 2 peticiones también
    const req2 = httpMock.expectOne('http://localhost:5000/api/subrecetas');
    req2.flush([{ id: 1 }]);

    const req3 = httpMock.expectOne('http://localhost:5000/api/tortas');
    req3.flush([{ id: 1 }]);

    tick();

    expect(component.totalIngredientes).toBe(0);
    expect(component.totalSubrecetas).toBe(1); // ✅ Verificar las otras también
    expect(component.totalTortas).toBe(1);     // ✅ Verificar las otras también
  }));
});
