import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarTortaComponent } from './agregar-torta.component';

describe('AgregarTortaComponent', () => {
  let component: AgregarTortaComponent;
  let fixture: ComponentFixture<AgregarTortaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarTortaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarTortaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
