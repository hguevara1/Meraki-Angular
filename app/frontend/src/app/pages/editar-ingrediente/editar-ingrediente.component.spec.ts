import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarIngredienteComponent } from './editar-ingrediente.component';

describe('EditarIngredienteComponent', () => {
  let component: EditarIngredienteComponent;
  let fixture: ComponentFixture<EditarIngredienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarIngredienteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarIngredienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
