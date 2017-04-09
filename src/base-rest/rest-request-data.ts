import { RequestMethod } from '@angular/http';
import { RestRequestSearchParams } from './rest-request-search-params';

type StringRequestMethod = 'get' | 'post' | 'put' | 'putch' | 'delete' | 'options' | 'head';

export interface RestRequestData extends RestRequestSearchParams {
  // path: string;
  /**
   * {@link RequestMethod} enum is recommended to use
   */
  method?: StringRequestMethod | RequestMethod;

  /**
   * Any data for body
   */
  body?: any;
}
