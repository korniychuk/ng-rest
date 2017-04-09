import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { Observable } from 'rxjs/Observable';

import { ResponseError } from '../request/response-error';

/**
 * Function for simplify catching server errors
 * Example:
 *
 *     class ... extends BaseRestService {
 *       public myRequest() {
 *         return this.request
 *                    .send( ... )
 *                    .catch(status(400, (res: ResponseError) => ...)
 *                    .catch(status(415, (res: ResponseError) => ...)
 *                    .catch((res: ResponseError | any) => ...)
 *                    .map( ... );
 *       }
 *     }
 *
 */
export function status(
  status: number,
  handler: { (res: ResponseError | any): any }
): { (res: ResponseError | any): ErrorObservable } {

  return (res: ResponseError | any): ErrorObservable => {
    if (res instanceof ResponseError && res.status === status) {
      return Observable.throw(
        handler(res)
      );
    }

    return Observable.throw(res);
  };

} // end status()
