import { RequestMethod, Headers, URLSearchParams } from '@angular/http';
import { DefaultObject } from 'app/helpers/typed-object';

export interface RequestData {
  // path: string;
  // method?: string | RequestMethod;
  method?: RequestMethod;
  // search?: string | URLSearchParams | DefaultObject;
  search?: URLSearchParams;
  // headers?: Headers | DefaultObject;
  headers?: Headers;
  /**
   * Parameters to replacing in URL
   */
  params?: DefaultObject;
  // /**
  //  * Additional model fields
  //  */
  // expand?: string[];
  // /**
  //  * Get only specified model fields of all main fields
  //  */
  // fields?: string[];
  // /**
  //  * token for Bearer authorization
  //  */
  // token?: string;

  /**
   * Any serializable to json data
   */
  body?: any;
}
