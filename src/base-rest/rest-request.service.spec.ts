/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { RestRequestService } from './rest-request.service';

describe('Service: RestRequestService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RestRequestService]
    });
  });

  it('should ...', inject([RestRequestService], (service: RestRequestService) => {
    expect(service).toBeTruthy();
  }));
});
