import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

// Componente a testear
import { AgregarTortaComponent } from './agregar-torta.component';

// Material modules
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

describe('AgregarTortaComponent', () => {
  let component: AgregarTortaComponent;
  let fixture: ComponentFixture<AgregarTortaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]),
        ReactiveFormsModule,
        FormsModule,
        NoopAnimationsModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatCardModule,
        MatChipsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatExpansionModule,
        MatSelectModule,
        MatTableModule,
        AgregarTortaComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AgregarTortaComponent);
    component = fixture.componentInstance;
  });

  it('debería crear el componente', () => {
    // No llamamos fixture.detectChanges() para evitar que se ejecute ngOnInit
    expect(component).toBeTruthy();
  });

  it('debería calcular costo total de subreceta', () => {
    const mockSubreceta = {
      _id: '1',
      nombre: 'Crema Pastelera',
      ingredientes: [
        {
          ingrediente: {
            _id: 'ing1',
            nombre: 'Leche',
            precio: 1.5,
            medida: 1,
            unidad: 'litro'
          },
          cantidad: 0.5,
          costo: 0.75
        }
      ],
      costoTotal: 0.75
    };

    const costo = component.calcularCostoTotalSubreceta(mockSubreceta);
    expect(costo).toBe(0.75);
  });

  it('debería retornar 0 si no hay subrecetas en la torta', () => {
    component.torta.subrecetas = [];
    const costoTotal = component.calcularCostoTotalTorta();
    expect(costoTotal).toBe(0);
  });

  it('debería retornar string vacío para subreceta nula', () => {
    const display = component.displaySubreceta(null);
    expect(display).toBe('');
  });

  it('debería eliminar una subreceta', () => {
    component.torta.subrecetas = ['1', '2'];
    component.eliminarSubreceta(0);
    expect(component.torta.subrecetas.length).toBe(1);
    expect(component.torta.subrecetas[0]).toBe('2');
  });
});
