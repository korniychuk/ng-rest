import { Headers, URLSearchParams } from '@angular/http';
import { DefaultObject } from 'typed-object-interfaces';
import { Pagination } from './pagination';

export interface RestRequestSearchParams {
  /**
   * {@link DefaultObject } is recommended to use
   *
   * Examples:
   *
   *  - 'param=val&param2=val2'
   *  - new URLSearchParams(...)
   *  - { param: 'val', param2: 'val2' }
   *
   */
  search?: string | URLSearchParams | DefaultObject;
  /**
   * {@link DefaultObject} is recommended to use
   */
  headers?: Headers | DefaultObject;

  /**
   * Additional model fields
   * Recommended to use: array of strings
   */
  expand?: string[];
  /**
   * Get only specified model fields of all main fields
   * Recommended to use: array of strings
   */
  fields?: string[];

  /**
   * Parameters to replacing in URL
   */
  params?: DefaultObject;

  /**
   * token for Bearer authorization
   */
  token?: string;

  /**
   *
   */
  pagination?: Pagination;
}
