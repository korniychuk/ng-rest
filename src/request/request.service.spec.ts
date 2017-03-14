/* tslint:disable:no-unused-variable */

import {
  Headers, Http, RequestMethod, RequestOptionsArgs, Response, ResponseOptions,
  URLSearchParams
} from '@angular/http';
import { TestBed, async, inject } from '@angular/core/testing';

import { Observable } from 'rxjs/Observable';

import { Subject } from 'rxjs/Subject';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';

import { RequestService } from './request.service';
import { ResponseError } from './response-error';

class HttpFake {

  public response = new Subject<any>();
  public url: string;
  public options: RequestOptionsArgs;

  public request(url: string, options: RequestOptionsArgs): Observable<Response> {
    this.url = url;
    this.options = options;

    return this.response.asObservable();
  } // end request()

}

describe('REST Module: Request class', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RequestService,
        {
          provide: Http,
          useClass: HttpFake,
        },
      ],
    });
  });
  it('Should send configured request using send()', (done) => inject(
    [ RequestService, Http ], (service: RequestService, http: HttpFake) => {
      const options = { body: 'body-val' };
      function doubleDone() {
        doubleDone['counter'] = (doubleDone['counter'] || 0) + 1;
        if (doubleDone['counter'] === 2) {
          done();
        }
      }

      // spyOn(<any> service, 'prepareQueryParams').and.returnValue('query-params-object');
      spyOn(<any> service, 'prepareUrl').and.returnValue('url-with-params');
      spyOn(<any> service, 'prepareHeaders');
      spyOn(<any> service, 'parseResponse').and.returnValue('res-val');
      spyOn(<any> service, 'logRequest');
      spyOn(<any> service, 'logResponse');
      spyOn(<any> service, 'handleError').and.returnValue(Observable.throw('handled-error'));

      const res$ = service['send']('source-url', options);
      expect(http.url).toEqual('url-with-params');
      expect(http.options.body).toBe('body-val');
      res$.subscribe(
        (res) => {
          expect(res).toEqual('res-val');

          // expect(service['prepareQueryParams']).toHaveBeenCalledWith(options);
          expect(service['prepareUrl']).toHaveBeenCalledWith('source-url', options);
          expect(service['prepareHeaders']).toHaveBeenCalledWith(options);
          expect(service['parseResponse']).toHaveBeenCalledWith('some-value', 0);
          expect(service['logRequest']).toHaveBeenCalled();
          expect(service['logResponse']).toHaveBeenCalled();

          doubleDone();
        },
        (err) => {
          expect(err).toEqual('handled-error');
          doubleDone();
        });

      http.response.next('some-value');
      http.response.error(Observable.throw(new Error()));
    }
  )());

  /*
  // The method deleted
  it('Should build query params using buildQueryParams()', inject(
    [ RequestService ], (service: RequestService) => {
      const search     = { param1: 'val1' };
      const fields     = [ 'field1', 'field2' ];
      const expand     = [ 'extraField1', 'extraField2' ];
      let options: any = { search, fields, expand };

      let query: URLSearchParams;

      // Default test
      query = service[ 'prepareQueryParams' ](options);
      expect(query.toString())
        .toEqual(`param1=val1&expand=${expand.join(',')}&fields=${fields.join(',')}`);

      // Search override fields & expand
      query = service[ 'prepareQueryParams' ]({
        search: { ...search, fields: 'field0', expand: 'extraField0' },
        fields,
        expand
      });
      expect(query.toString())
        .toEqual(`param1=val1&fields=field0&expand=extraField0`);

      // disable fields & expand
      service['expandQueryParam'] = null;
      service['fieldsQueryParam'] = null;
      query = service[ 'prepareQueryParams' ](options);
      expect(query.toString())
        .toEqual(`param1=val1`);

      // URLSearchParams format
      options = { search: new URLSearchParams() };
      options.search.append('param3', 'val3');
      options.search.append('param4', 'val4');
      query = service[ 'prepareQueryParams' ](options);
      expect(query.toString())
        .toEqual(`param3=val3&param4=val4`);

      // Query string format
      options = { search: `param1=val1&param2=val2` };
      query = service[ 'prepareQueryParams' ](options);
      expect(query.toString())
        .toEqual(`param1=val1&param2=val2`);
    }
  ));
  */

  it('Should build url params with prepareUrlParams()', inject(
    [ RequestService ], (service: RequestService) => {
      const url = service['prepareUrl'](
        '/articles/:articleId/comments/:id',
        { params: { articleId: 5, id: 3 } }
      );

      expect(url).toEqual('/articles/5/comments/3');
    }
  ));

  it('Should build headers with prepareHeaders()', inject(
    [ RequestService ], (service: RequestService) => {
      let headers: Headers = new Headers();

      // Get request (without body)
      service['prepareHeaders']({ headers, method: RequestMethod.Get });
      expect(headers instanceof Headers).toBeTruthy();
      expect(headers.get('Accept')).toEqual('application/json');
      expect(headers.get('Content-Type')).toBeNull();

      // Post request (with body)
      service['prepareHeaders']({ headers, method: RequestMethod.Post });
      expect(headers.get('Content-Type')).toEqual('application/json');
    }
  ));

  /*
  // Method removed
  it('Should determine request verb with prepareMethod()', inject(
    [ RequestService ], (service: RequestService) => {
      let method: string | RequestMethod;

      method = service['prepareMethod']({});
      expect(method).toEqual(RequestMethod.Get);

      method = service['prepareMethod']({ method: 'patch' });
      expect(method).toEqual('patch');
    }
  ));
  */

  it('Should return the passed object from parseResponse()', inject(
    [ RequestService ], (service: RequestService) => {
      const obj = {};
      expect(service['parseResponse'](<Response> obj)).toBe(obj);
    }
  ));

  it('Should make ErrorResponse of raw http error using handleError()', inject(
    [ RequestService ], (service: RequestService) => {
      let body: any = { res: 'redirect' };
      let res = new Response(new ResponseOptions({
        url: 'my-url',
        status: 300,
        statusText: 'status-desc',
        body,
      }));
      let error: ErrorObservable<ResponseError>;
      let err: any;

      spyOn(<any> service, 'logError');

      error = service['handleError'](res);
      expect(error['error'] instanceof ResponseError).toBeTruthy();

      err = body.res;
      expect(error['error'].msg()).toEqual(
        `[${res.url}] ${res.status} - ${res.statusText || ''} ${err}`
      );

      body = { prop: 'val' };
      res = new Response(new ResponseOptions({
        url: 'my-url',
        status: 300,
        statusText: 'status-desc',
        body,
      }));
      err = JSON.stringify(body);
      error = service['handleError'](res);
      expect(error['error'].msg()).toEqual(
        `[${res.url}] ${res.status} - ${res.statusText || ''} ${err}`
      );

      body = { message: 'non-response-with-message' };
      error = service['handleError'](body);
      expect(error['error'].msg()).toEqual(body.message);

      body = { prop: 'non-response-no-message' };
      error = service['handleError'](body);
      expect(error['error'].msg()).toEqual('[object Object]');

      expect(service['logError']).toHaveBeenCalledTimes(4);
      expect(service['logError']).toHaveBeenCalledWith(error['error']);
    }
  ));

  it('Should print error using logError() if it enabled', inject(
    [ RequestService ], (service: RequestService) => {
      service['enableErrorLogging'] = true;
      spyOn(console, 'error');
      service[ 'logError' ](new ResponseError({}, 'msg'));
      expect(console.error).toHaveBeenCalledWith(
        'HTTP Error [%d]: %s',
        0, // status for not Response object passed in ResponseError
        'msg');

      service['enableErrorLogging'] = false;
      console.error['calls'].reset();
      service[ 'logError' ](new ResponseError({}, 'msg'));
      expect(console.error).not.toHaveBeenCalled();
    }
  ));

  it('Should print request using logRequest() if it enabled', inject(
    [ RequestService ], (service: RequestService) => {
      const options = { prop: 'val'};

      service['enableRequestLogging'] = true;
      spyOn(console, 'info');
      service[ 'logRequest' ]('my-url', options);
      expect(console.info).toHaveBeenCalledWith(
        'HTTP Request ::',
        'my-url',
        options,
      );

      service['enableRequestLogging'] = false;
      (<jasmine.Spy> console.info).calls.reset();
      service[ 'logRequest' ]('my-url', {});
      expect(console.info).not.toHaveBeenCalled();
    }
  ));

  it('Should print response using logResponse() if it enabled', inject(
    [ RequestService ], (service: RequestService) => {
      const response = new Response(new ResponseOptions({}));

      service['enableResponseLogging'] = true;
      spyOn(console, 'info');
      service[ 'logResponse' ](response);
      expect(console.info).toHaveBeenCalledWith(
        'HTTP Response ::',
        response,
      );

      service['enableResponseLogging'] = false;
      (<jasmine.Spy> console.info).calls.reset();
      service[ 'logResponse' ](response);
      expect(console.info).not.toHaveBeenCalled();
    }
  ));

  it('should detect requests without body using hasBody()', inject(
    [RequestService], (service: RequestService) => {
      const verbs = [
        RequestMethod.Get, RequestMethod.Head, RequestMethod.Options,
      ];

      verbs.forEach((verb) =>
        expect(service[ 'hasBody' ]({ method: verb })).toBeFalsy()
      );

      expect(service[ 'hasBody' ]({ method: RequestMethod.Post })).toBeTruthy();
    }
  ));

});
