import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresupuestoTortaComponent } from './presupuesto-torta.component';

describe('PresupuestoTortaComponent', () => {
  let component: PresupuestoTortaComponent;
  let fixture: ComponentFixture<PresupuestoTortaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresupuestoTortaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresupuestoTortaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
