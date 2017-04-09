import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

/**
 * This method is really helpful for wrap repeatable http requests.
 *
 * For example: you have many filter in you online-store catalog. After change any filters you want
 * to send an http request for get new data and update catalog. But if one request sending now
 * (in process) and filters changed again, you want to reject previous http request and send new,
 * with new filters data.
 *
 * @example
 *
 *     ngOnInit() {
 *       const sub: Subscription = this
 *         .filters$
 *         .do((options: any) => console.log(options)
 *         .subscribeDebounce((options: any) => {
 *
 *           const sub = this.http
 *             .get('http://...', options)
 *             .subscribe((res) => {
 *               // ... do something. Handle and apply response
 *             });
 *
 *           return sub;
 *
 *         });
 *
 *       // you can fire `sub.unsubscribe();` for:
 *       // - stop listen `.filters$` stream
 *       // - reject current http request, if it is
 *     }
 *
 * Note: if `null` will be sent to `.filters$` stream previous request will be rejected, and nothing
 * more will happen
 *
 * @param {function(value: T): Subscription} project The function to apply
 * to each `value` emitted by the source Observable.
 * @param [thisArg] An optional argument to define what `this` is in the
 * `project` function.
 *
 * @return {Subscription}
 *
 * @method subscribeDebounce
 */
export function subscribeDebounce<T>(
  this: Observable<T>,
  project: (data: T) => Subscription,
  thisArg?: any
): Subscription {
  const source$ = this;
  let projectSub: Subscription;

  const sub = source$
    .subscribe(
      (data: T) => {
        if (projectSub) {
          projectSub.unsubscribe();
        }
        if (data) {
          projectSub = project.call(thisArg || this, data);
        }
      },
      (error) => {
        console.error('Error#subscribeDebounce:', error);
      },
      () => projectSub && projectSub.unsubscribe(),
    );

  return sub;
} // end subscribeDebounce()
