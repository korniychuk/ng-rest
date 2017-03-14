import { Headers, RequestMethod, URLSearchParams } from '@angular/http';
import { DefaultObject } from 'app/helpers/typed-object';

import { RestRequestData } from './rest-request-data';
import { RequestData } from '../request/request-data';

/**
 * Usage example:
 *
 * 1. Implement abstract prepare() method
 *
 *  class MyRequestFormatter extends BaseRequestFormatter {
 *
 *    protected prepare(data: RestRequestData): void {
 *      // ...
 *    }
 *
 *  }
 *
 * 2. This class convert data from {@link RestRequestData} to {@link RequestData}
 *   for use in {@link RequestService} class, so let's work with it.
 * For every request you need to create new instance of a formatter.
 *
 *     \@Injectable()
 *     class MyRestService {
 *       public constructor(private request: RequestService) {}
 *
 *       protected send(data: RestRequestData): Observable<any> {
 *         const formatter = new MyRequestFormatter(data);
 *         const data      = formatter.makeRequestData();
 *
 *         return this.request.send(data);
 *       }
 *     }
 *
 */
export abstract class BaseRequestFormatter<T extends RestRequestData> {

  protected method: RequestMethod;
  protected headers: Headers;
  protected search: URLSearchParams;
  protected params: DefaultObject;
  protected body: any;

  public constructor(data: T, isCallPrepare: boolean = true) {
    this.method  = this._prepareMethod(data);
    this.headers = this._prepareHeaders(data);
    this.search  = this._prepareSearchParams(data);
    this.params  = data.params;
    this.body    = data.body;

    if (isCallPrepare) {
      this.prepare(data);
    }
  } // end constructor()

  /**
   * This method prepares full data for fire {@link RequestService#send} method
   */
  public makeRequestData(): RequestData {
    return {
      method:  this.method,
      headers: this.headers,
      search:  this.search,
      params:  this.params,
      body:    this.body,
    };
  } // end makeRequestData()

  /**
   * Implement this method for custom preparation of the request
   */
  protected abstract prepare(data: T): void;

  /**
   * Convert query params from different formats to {@link URLSearchParams}
   */
  private _prepareSearchParams(data: T): URLSearchParams {
    const rawSearch = data.search;
    const isStringObject =
            rawSearch instanceof Object &&
            rawSearch instanceof URLSearchParams === false;

    if (isStringObject) {
      return Object.keys(rawSearch)
                   .reduce(
                     (search, name) => {
                       search.append(name, rawSearch[ name ]);
                       return search;
                     },
                     new URLSearchParams()
                   );
    } else if (typeof rawSearch === 'string') {
      return new URLSearchParams(rawSearch);
    } else if (!rawSearch) { // search is not specified
      return new URLSearchParams();
    } else {
      return <URLSearchParams> rawSearch;
    }
  } // end _prepareSearchParams()

  /**
   * This method was created in order to make the query verb determination logic in one place
   */
  private _prepareMethod(data: T): RequestMethod {
    const rawMethod = data.method || RequestMethod.Get;

    if (typeof rawMethod === 'string') {
      const key    = rawMethod.slice(0, 1).toUpperCase() + rawMethod.slice(1);
      const method = RequestMethod[ key ];

      if (method === undefined) {
        console.warn(`BaseRequestFormatter#_prepareMethod: Invalid method '${method}' `);
        return RequestMethod.Get;
      }

      return method;
    }

    return  rawMethod;
  } // end _prepareMethod

  /**
   * Adding some default headers to all requests
   */
  private _prepareHeaders(data: T): Headers {
    const headers = new Headers(data.headers);

    return headers;
  } // end _prepareHeaders()

}

export type RequestFormatterConstructor = {
  new (data: RestRequestData): BaseRequestFormatter<RestRequestData>
};
