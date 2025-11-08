import { TestBed } from '@angular/core/testing';

import { GastosFixoService } from './gastos-fixo.service';

describe('GastosFixoService', () => {
  let service: GastosFixoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GastosFixoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
