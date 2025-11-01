import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GastosFixoComponent } from './gastos-fixo.component';

describe('GastosFixoComponent', () => {
  let component: GastosFixoComponent;
  let fixture: ComponentFixture<GastosFixoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GastosFixoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GastosFixoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
