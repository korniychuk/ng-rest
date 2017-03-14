import { status } from './status';
import { ResponseError } from '../request/response-error';

import { Observable } from 'rxjs/Observable';

/**
 * Notice: In this cases Observable.throw() is synchronous operation
 */
describe('REST Module: status function', () => {

  it('Should filter response status', (done) => {
    const Fn200 = status(200, (err) => new Error('The fail'));
    let error: ResponseError;

    Fn200('not ResponseError instance')
      .do(() => done.fail('Not Response instance case: not thrown'))
      .catch((err) => {
        expect(err).toEqual('not ResponseError instance', 'Not Response instance case');
        return Observable.of(true);
      }).subscribe();

    error = new ResponseError({}, 'msg');
    error.status = 200;
    Fn200(error)
      .do(() => done.fail('Status match case: not thrown'))
      .catch((err: Error) => {
        expect(err.message).toEqual('The fail', 'Status match case');
        return Observable.of(true);
      }).subscribe();

    // Other status
    error = new ResponseError({}, 'msg');
    error.status = 204;
    Fn200(error)
      .do(() => done.fail('Other status case: not thrown'))
      .catch((err) => {
        expect(err).toBe(error, 'Other status case');
        return Observable.of(true);
      }).subscribe();

    done();
  });

});
