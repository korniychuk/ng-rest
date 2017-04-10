import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import { RequestService } from '../request/request.service';
import { RestRequestData } from './rest-request-data';
import { RequestFormatterConstructor } from './base-request-formatter';
import { RequestFormatter } from './request-formatter';

/**
 * This abstraction level created to make possible require many dependencies and modify every
 * request before send and/or after sent.
 * {@link beforeSend} and {@link afterSend} logic could be done in the {@link BaseRestService} but
 * if that if it were done and if we need to include any other services via DI we had to do it in
 * the every child class. To avoid this inconvenience class {@link RestRequestService} was created.
 *
 * Feel free to extend it and override {@link beforeSend} and {@link afterSend} methods.
 */
@Injectable()
export class RestRequestService {
  /**
   * Constructor of the class that convert request data from Rest format RequestService format
   */
  protected requestFormatterClass: RequestFormatterConstructor = RequestFormatter;

  public constructor(
    private request: RequestService,
    init: boolean = true,
  ) {
    if (init) {
      this.init();
    }
  } // end constructor()

  /**
   * Initialize the class
   * Use this method instead of the {@link RestRequestService.constructor()}
   */
  protected init(): void {
  }

  /**
   * Do some logic before every request. You can modify request data before every request.
   * For example you can inject SessionService to the service and add token to request data.
   */
  protected beforeSend(data: RestRequestData): RestRequestData {
    return data;
  }

  /**
   * Do some logic after every request is parsed.
   * For example you can handle 403\401 status error here and logout or redirect the user.
   */
  protected afterSend(stream$: Observable<Response>): Observable<Response> {
    return stream$;
  }

  /**
   * Make request with base url using {@link RequestService}
   *
   * This is final method. No need to override it!
   *
   * @param data
   * @param url  full resource url
   */
  public send(data: RestRequestData, url: string): Observable<Response> {
    const extendedData: RestRequestData = this.beforeSend(data);

    const formatter = new this.requestFormatterClass(extendedData);
    const res$ = this.request.send(url, formatter.makeRequestData());

    return this.afterSend(res$);
  } // end send()

}
