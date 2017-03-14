import { ResponseError } from './response-error';
import { Headers, Response, ResponseOptions } from '@angular/http';

describe('REST Module: ResponseError class', () => {

  it('Should create an instance with Response as argument', () => {
    const errMsg       = 'The error';
    const fakeResponse = new Response(<ResponseOptions> {
      headers: new Headers({'Content-Type': 'application/json'}),
      status: 204,
      body:   JSON.stringify({ name: 'test' }),
    });

    const err = new ResponseError(fakeResponse, errMsg);

    expect(err.status).toEqual(204);
    expect(err.data).toEqual(fakeResponse.json());

    expect(err['_raw']).toBe(fakeResponse);
    expect(err.raw()).toBe(fakeResponse);

    expect(err['_msg']).toEqual(errMsg);
    expect(err.msg()).toEqual(errMsg);
  });

  it('Should create an instance with non-Response argument', () => {
    const errMsg      = 'The error';
    const nonResponse = { name: 'test2' };

    const err = new ResponseError(nonResponse, errMsg);

    expect(err.status).toEqual(0);
    expect(err.data).toEqual(nonResponse);

    expect(err.raw()).toBe(nonResponse);
    expect(err.msg()).toEqual(errMsg);
  });

});
