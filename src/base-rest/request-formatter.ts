import { RestRequestData } from './rest-request-data';
import { BaseRequestFormatter } from './base-request-formatter';

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

  public constructor(data: T, isCallPrepare: boolean = true) {
    super(data, false);

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
      this.headers.append('Authorization', `Bearer ${data.token}`);
    }
  } // end prepareHeaders()

  /**
   * 1. Parse and prepare default query params.
   * 2. Handling some custom query params like 'expand' of 'fields'
   * Example:
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
      this.search.set(this.expandQueryParam, data.expand.join());
    }

    if ( this.fieldsQueryParam // should to use this feature?
      && data.fields
      && data.fields instanceof Array
      && !this.search.has(this.fieldsQueryParam) // is it not set another way
    ) {
      this.search.append(this.fieldsQueryParam, data.fields.join());
    }
  } // end prepareQueryParams()

  /**
   * Apply pagination parameters to the request.
   * In the most cases only `page` and `perPage` will used,
   *   but `from` and `to` also can be implemented on a backend
   */
  protected preparePagination(data: T): void {
    const p = data.pagination;
    if (!p) {
      return;
    }

    ['page', 'perPage', 'from', 'to'].forEach((param) => {
      if (p[param] && !this.search.has(param)) {
        this.search.set(param, p[param]);
      }
    });
  } // end preparePagination()

}
