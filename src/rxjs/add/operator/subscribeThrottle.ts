import { Observable } from 'rxjs/Observable';
import { subscribeThrottle } from '../../operator/subscribeThrottle';

Observable.prototype.subscribeThrottle = subscribeThrottle;

declare module 'rxjs/Observable' {
  interface Observable<T> {
    subscribeThrottle: typeof subscribeThrottle;
  }
}
