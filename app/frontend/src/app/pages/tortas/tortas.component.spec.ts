import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DomSanitizer } from '@angular/platform-browser';

import { TortasComponent } from './tortas.component';

// Mock del DomSanitizer
class MockDomSanitizer {
  bypassSecurityTrustResourceUrl(url: string) {
    return url;
  }
}

// Mock del MatSnackBar para evitar timers
class MockMatSnackBar {
  open() {
    return {
      onAction: () => ({ subscribe: () => {} })
    };
  }
}

describe('TortasComponent', () => {
  let component: TortasComponent;
  let fixture: ComponentFixture<TortasComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TortasComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        MatDialogModule,
        MatSnackBarModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: DomSanitizer, useClass: MockDomSanitizer },
        { provide: MatSnackBar, useClass: MockMatSnackBar } // Usar mock en lugar del real
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TortasComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load tortas successfully', fakeAsync(() => {
    fixture.detectChanges();

    const mockTortas = [
      { _id: '1', nombre: 'Torta Test 1', subrecetas: [] },
      { _id: '2', nombre: 'Torta Test 2', subrecetas: [] }
    ];

    const req = httpMock.expectOne('http://localhost:5000/api/tortas');
    expect(req.request.method).toBe('GET');
    req.flush(mockTortas);

    tick(); // Procesar operaciones asíncronas

    expect(component.tortas).toEqual(mockTortas);
    expect(component.totalTortas).toBe(2);
    expect(component.isLoading).toBeFalse();
  }));

  it('should handle error when loading tortas', fakeAsync(() => {
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:5000/api/tortas');
    req.error(new ErrorEvent('Network error'));

    tick(); // Procesar operaciones asíncronas

    expect(component.tortas).toEqual([]);
    expect(component.isLoading).toBeFalse();
  }));

  it('should extract YouTube ID correctly', () => {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const id = (component as any).extractYouTubeId(url);
    expect(id).toBe('dQw4w9WgXcQ');
  });

  it('should return null for invalid YouTube URL', () => {
    const url = 'https://invalid-url.com';
    const id = (component as any).extractYouTubeId(url);
    expect(id).toBeNull();
  });

  it('should call cargarTortas manually', fakeAsync(() => {
    const mockTortas = [
      { _id: '3', nombre: 'Torta Manual', subrecetas: [] }
    ];

    component.cargarTortas();

    const req = httpMock.expectOne('http://localhost:5000/api/tortas');
    expect(req.request.method).toBe('GET');
    req.flush(mockTortas);

    tick(); // Procesar operaciones asíncronas

    expect(component.tortas).toEqual(mockTortas);
    expect(component.totalTortas).toBe(1);
  }));
});
