import { Observable } from 'rxjs/Observable';
import { subscribeDebounce } from '../../operator/subscribeDebounce';

Observable.prototype.subscribeDebounce = subscribeDebounce;

declare module 'rxjs/Observable' {
  interface Observable<T> {
    subscribeDebounce: typeof subscribeDebounce;
  }
}
