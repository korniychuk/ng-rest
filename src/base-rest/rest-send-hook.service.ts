import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import { RestRequestData } from './rest-request-data';

/**
 * This service uses for doing configuration that depend of other services
 */
@Injectable()
export class RestSendHookService {

  public constructor(
  ) {
  }

  public beforeSend(data: RestRequestData): RestRequestData {
    return data;
  }

  public afterSend(stream$: Observable<Response>): Observable<Response> {
    return stream$;
  }

}
