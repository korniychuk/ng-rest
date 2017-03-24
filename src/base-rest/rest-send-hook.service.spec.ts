/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { RestSendHookService } from './rest-send-hook.service';

describe('Service: RestSendHookService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RestSendHookService]
    });
  });

  it('should ...', inject([RestSendHookService], (service: RestSendHookService) => {
    expect(service).toBeTruthy();
  }));
});
