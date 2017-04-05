import { Injectable } from '@angular/core';
import {
  Http, RequestMethod,
  Response,
  RequestOptionsArgs
} from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';

import { ResponseError } from './response-error';
import { RequestData } from './request-data';

/**
 * Main service for all http requests
 */
@Injectable()
export class RequestService {

  /**
   * Enable requests logging to browser console
   */
  protected enableRequestLogging: boolean = false;
  /**
   * Enable responses logging for successful codes (>=200 & < 300) to browser console
   */
  protected enableResponseLogging: boolean = false;
  /**
   * Enable logging http errors to browser console
   */
  protected enableErrorLogging: boolean = true;

  /** Unique for this service, request number */
  protected requestCounter: number = 0;

  public constructor(
    private http: Http,
  ) {
  }

  /**
   * Send an http request
   */
  public send(url: string, options: RequestData): Observable<Response> {
    url = this.prepareUrl(url, options);
    this.prepareHeaders(options);

    const summaryOptions: RequestOptionsArgs = {
      method:  options.method,
      headers: options.headers,
      search:  options.search,
      body:    options.body,
    };

    this.requestCounter++;

    this.logRequest(url, options);

    return this.http
               .request(url, summaryOptions)
               .map(this.parseResponse.bind(this))
               .do(this.logResponse.bind(this))
               .catch(this.handleError.bind(this));
  } // end send()

  /**
   * Replace url-params in the url
   * Example:
   *
   *     this.parseUrlParams(
   *       '/articles/:articleId/comments/:id',
   *       { params: { articleId: 5, id: 3 } }
   *     )
   *     // Result: '/articles/5/comments/3'
   *
   */
  protected prepareUrl(sourceUrl: string, options: RequestData): string {
    return !options.params ? sourceUrl : Object
      .keys(options.params)
      .reduce(
        (url, param) => url.replace(new RegExp(`:${param}`, 'g'), String(options.params[ param ])),
        sourceUrl
      );
  } // end prepareUrl()

  /**
   * Adding some default headers to all requests
   * You can override the method for adding additional headers
   */
  protected prepareHeaders(options: RequestData): void {
    const headers = options.headers;

    if (!headers.has('Accept')) {
      headers.append('Accept', 'application/json');
    }
    if (!headers.has('Content-Type') && this.hasBody(options)) {
      headers.append('Content-Type', 'application/json');
    }
  } // end prepareHeaders()

  /**
   * Override this method if you want to add custom data parse logic to every response
   */
  protected parseResponse(res: Response): Response {
    return res;
  }

  /**
   * Handle and wrap an http error
   */
  protected handleError(res: Response | any): ErrorObservable<ResponseError> {
    let errMsg: string;

    if (res instanceof Response) {
      const body = res.json() || '';
      const err  = body.res || JSON.stringify(body);

      errMsg = `[${res.url}] ${res.status} - ${res.statusText || ''} ${err}`;
    } else {
      errMsg = res.message ? res.message : res.toString();
    }

    const error = new ResponseError(res, errMsg);
    this.logError(error);

    return Observable.throw(error);
  } // end handleError()

  /**
   * Log http errors (200 > status >= 300)
   * In a real world app, you might use a remote logging infrastructure
   * Fill free to override this method
   */
  protected logError(err: ResponseError): void {
    if (this.enableErrorLogging) {
      console.error('HTTP Error #%d::[%d]: %s', this.requestCounter, err.status, err.msg());
    }
  }
  /**
   * Log every request
   */
  protected logRequest(url: string, options: RequestData): void {
    if (this.enableRequestLogging) {
      console.info('HTTP Request #%d::%s', this.requestCounter, url, options);
    }
  }
  /**
   * Log every successful response
   */
  protected logResponse(res: Response): void {
    if (this.enableResponseLogging) {
      console.info('HTTP Response #%d::', this.requestCounter, res);
    }
  }

  /**
   * Check if the request method can has a body (checking by verb type)
   */
  protected hasBody(options: RequestData): boolean {
    return [
        RequestMethod.Get, RequestMethod.Head, RequestMethod.Options,
      ].indexOf(options.method) === -1;
  }

}
