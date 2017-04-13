import { RestRequestData } from './rest-request-data';
import { BaseRequestFormatter } from './base-request-formatter';
import { Pagination } from './pagination';
import { BaseRestService } from './base-rest.service';

/**
 * This is common server-specific implementation of {@link BaseRequestFormatter}
 *
 * Extend this class for customize and\or implement some custom logic for your specific server
 *
 * If the logic of interaction with your server is very different from that which is implemented
 * in this class, extend direct {@link BaseRequestFormatter} and implement what you need
 *
 * For examples to usage see {@link BaseRequestFormatter}
 */
export class RequestFormatter<T extends RestRequestData> extends BaseRequestFormatter<T> {
  /**
   * Name of the query parameter for request additional response fields
   * Set null for disable this functionality
   */
  protected expandQueryParam = 'expand';
  /**
   * Name of the query parameter for configure response fields
   * Set null for disable this functionality
   */
  protected fieldsQueryParam = 'fields';

  /**
   * In the most cases only `page` and `perPage` will used,
   *   but `from` and `to` also can be implemented on a backend.
   *
   * Override this map if you has different pagination interface
   *
   * Keys is fields of the pagination object,
   * Values is corresponding url parameter names
   */
  protected paginationUrlMap = <{[name in (keyof Pagination)]: string}> {
    page:    'page',
    perPage: 'perPage',
    from:    'from',
    to:      'to',
  };

  public constructor(data: T, rest: BaseRestService<any>, isCallPrepare: boolean = true) {
    super(data, rest, false);

    if (isCallPrepare) {
      this.prepare(data);
    }
  }

  /**
   * @inheritDoc
   */
  protected prepare(data: T) {
    this.prepareHeaders(data);
    this.preparePagination(data);
    this.prepareQueryParams(data);
  }

  /**
   * Adding some default headers to all requests
   * This is simple bearer authentication,
   *   you can override the method for implement your custom authentication.
   */
  protected prepareHeaders(data: T): void {
    if (data.token) {
      this.headers.set('Authorization', `Bearer ${data.token}`);
    }
  } // end prepareHeaders()

  /**
   * 1. Parse and prepare default query params.
   * 2. Handling some custom query params like 'expand' of 'fields'
   *
   * Note: use mapped field names. For example if in the {@link BaseRestService.fieldsMap()}
   *  specified that `user_surname` is `surname` than in the `fields` and `expand` you should use
   *  `surname`, not `user_surname`.
   *
   * @example
   *
   *    const search = { param1: 'val1' };
   *    const fields = ['field1', 'field2'];
   *    const expand = ['extraField1', 'extraField2'];
   *    const options = { search, fields, expand };
   *
   *    this.prepareQueryParams(options);
   *    // Result: param1=val1&fields=field1,field2&expand=extraField1,extraField2
   *
   */
  protected prepareQueryParams(data: T): void {

    if ( this.expandQueryParam // should to use this feature?
      && data.expand
      && Array.isArray(data.expand)
      && !this.search.has(this.expandQueryParam) // is it not set another way
    ) {
      const rawFields = this.mapModelFields(data.expand);
      this.search.set(this.expandQueryParam, rawFields.join());
    }

    if ( this.fieldsQueryParam // should to use this feature?
      && data.fields
      && data.fields instanceof Array
      && !this.search.has(this.fieldsQueryParam) // is it not set another way
    ) {
      const rawFields = this.mapModelFields(data.expand);
      this.search.append(this.fieldsQueryParam, rawFields.join());
    }
  } // end prepareQueryParams()

  /**
   * Apply pagination parameters to the request.
   */
  protected preparePagination(data: T): void {
    const p = data.pagination;
    if (!p) {
      return;
    }

    Object.keys(this.paginationUrlMap).forEach((param) => {
      const urlName = this.paginationUrlMap[ param ];
      const value   = p[ param ];

      if (value !== undefined && value !== null && !this.search.has(urlName)) {
        this.search.set(urlName, value);
      }
    });
  } // end preparePagination()

  /**
   * Replace replace normal object field names with raw names that specified in
   * {@link BaseRestService.fieldsMap()}
   *
   * Note: if you want to map field names in the object(not in array) just use
   * {@link BaseRestService.makeRawEntity()}
   */
  protected mapModelFields(fields: string[]): string[] {
    const simpleObject = fields.reduce((res, key) => Object.assign(res, {[key]: true}), {});

    const mapped = this.rest.map(simpleObject, true);

    return Object.keys(mapped);
  } // end mapModelFields()

}
