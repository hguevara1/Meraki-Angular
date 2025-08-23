import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubrecetasComponent } from './subrecetas.component';

describe('SubrecetasComponent', () => {
  let component: SubrecetasComponent;
  let fixture: ComponentFixture<SubrecetasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubrecetasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubrecetasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
