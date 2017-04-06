import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

/**
 * This method is really helpful for do Non-overlapping http requests.
 *
 * For example it can be used in infinite page scroll. When you want to ignore sending next http
 * request until previous is not came.
 *
 * @see {@link subscribeDebounce} for understanding usage example. There is one deference: if you
 * send both `null` or normal data to `.filter$` stream and previous request is not finished nothing
 * will happen. If previous request came, and next message in `.filter$` stream is `null` nothing
 * will happen too.
 *
 * @param {function(value: T): Subscription} project The function to apply
 * to each `value` emitted by the source Observable.
 * @param {any} [thisArg] An optional argument to define what `this` is in the
 * `project` function.
 *
 * @return {Subscription}
 *
 * @method subscribeThrottle
 */
export function subscribeThrottle<T>(
  this: Observable<T>,
  project: (data: T) => Subscription,
  thisArg?: any
): Subscription {
  const source$ = this;
  let projectSub: Subscription;

  const sub = source$
    .subscribe(
      (data: T) => {
        if (data && projectSub.closed) {
          projectSub = project.call(thisArg || source$, data);
        }
      },
      (error) => {
        console.error('Error#subscribeThrottle:', error);
      },
      () => projectSub && projectSub.unsubscribe(),
    );

  return sub;
} // end subscribeThrottle()
