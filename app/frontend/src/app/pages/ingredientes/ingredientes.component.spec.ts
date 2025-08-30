import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IngredientesComponent } from './ingredientes.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';

// Definir la interfaz Ingrediente aquí para las pruebas
interface Ingrediente {
  _id?: string;
  nombre: string;
  precio: number | null;
  medida: number;
  unidad: string;
  createdAt?: string;
  updatedAt?: string;
}

describe('IngredientesComponent', () => {
  let component: IngredientesComponent;
  let fixture: ComponentFixture<IngredientesComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        IngredientesComponent // Proporcionar el componente como provider
      ]
    }).compileComponents();

    // Crear el componente manualmente sin usar TestBed.createComponent
    // para evitar problemas con el template y componentes hijos
    component = TestBed.inject(IngredientesComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load ingredients successfully', () => {
    const mockIngredients: Ingrediente[] = [
      { _id: '1', nombre: 'Tomate', precio: 2.5, medida: 1, unidad: 'kg' }
    ];

    component.cargarIngredientes();

    const req = httpMock.expectOne('http://localhost:5000/api/ingredientes');
    req.flush(mockIngredients);

    expect(component.ingredientes).toEqual(mockIngredients);
    expect(component.totalIngredientes).toBe(1);
    expect(component.isLoading).toBeFalse();
  });

  it('should handle error when loading ingredients fails', () => {
    spyOn(console, 'error');

    component.cargarIngredientes();

    const req = httpMock.expectOne('http://localhost:5000/api/ingredientes');
    req.flush('Error', { status: 500, statusText: 'Server Error' });

    expect(console.error).toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
  });

  it('should delete ingredient when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(component, 'cargarIngredientes');

    component.eliminarIngrediente('1');

    const req = httpMock.expectOne('http://localhost:5000/api/ingredientes/1');
    req.flush({});

    expect(component.cargarIngredientes).toHaveBeenCalled();
  });

  it('should not delete ingredient when not confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.eliminarIngrediente('1');

    httpMock.expectNone('http://localhost:5000/api/ingredientes/1');
  });
});
