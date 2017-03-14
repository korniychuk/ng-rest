import { Headers, RequestMethod, URLSearchParams } from '@angular/http';

import { BaseRequestFormatter } from './base-request-formatter';
import { RestRequestData } from './rest-request-data';

class RequestFormatter extends BaseRequestFormatter<RestRequestData> {

  public constructor(data, isCallPrepare = true) {
    super(data, isCallPrepare);
  }

  protected prepare(data: RestRequestData): void {
    console.log('prepared');
  }

}

describe('REST Module: BaseRequestFormatter class', () => {
  let data: RestRequestData;
  let formatter: BaseRequestFormatter<RestRequestData>;

  beforeEach(() => {
    data = null;
    formatter = null;
  });

  it('Should create instance without any data', () => {
    data = {};

    spyOn(<any> RequestFormatter.prototype, 'prepare');
    formatter = new RequestFormatter(data);
    expect(RequestFormatter.prototype['prepare']).toHaveBeenCalledWith(data);

    expect(formatter['body']).toBeUndefined();
    expect(formatter['params']).toBeUndefined();
    expect(formatter['search'] instanceof URLSearchParams).toBeTruthy();
    expect(formatter['headers'] instanceof Headers).toBeTruthy();
    expect(formatter['method']).toBe(RequestMethod.Get);

    (<any> RequestFormatter.prototype['prepare']).calls.reset();
    formatter = new RequestFormatter(data, false);
    expect(RequestFormatter.prototype['prepare']).not.toHaveBeenCalled();
  });

  it('Should add headers from data using two source format', () => {
    data = {
      headers: {
        header1: 'value 1',
        header2: 'value 2',
      },
    };
    formatter = new RequestFormatter(data);
    expect(formatter['headers'].get('header1')).toBe('value 1');
    expect(formatter['headers'].get('header2')).toBe('value 2');

    data = {
      headers: new Headers({
        header1: 'value 3',
        header2: 'value 4',
      }),
    };
    formatter = new RequestFormatter(data);
    expect(formatter['headers'].get('header1')).toBe('value 3');
    expect(formatter['headers'].get('header2')).toBe('value 4');
  });

  it('Should set method using two sources format', () => {
    formatter = new RequestFormatter({ method: 'get' });
    expect(formatter['method']).toBe(RequestMethod.Get);

    formatter = new RequestFormatter({ method: 'put' });
    expect(formatter['method']).toBe(RequestMethod.Put);

    formatter = new RequestFormatter({ method: RequestMethod.Get });
    expect(formatter['method']).toBe(RequestMethod.Get);

    formatter = new RequestFormatter({ method: RequestMethod.Put });
    expect(formatter['method']).toBe(RequestMethod.Put);

    spyOn(console, 'warn');
    formatter = new RequestFormatter({ method: <any> 'unknown-verb' });
    expect(console.warn).toHaveBeenCalled();
    expect(formatter['method']).toBe(RequestMethod.Get);
  });

  it('Should assign search params in three ways', () => {
    data = {
      search: {
        param1: 'value 1',
        param2: 'value 2',
      }
    };
    formatter = new RequestFormatter(data);
    expect(formatter['search'].get('param1')).toBe('value 1');
    expect(formatter['search'].get('param2')).toBe('value 2');

    data = {
      search: 'param1=value+1&param2=value+2'
    };
    formatter = new RequestFormatter(data);
    expect(formatter['search'].get('param1')).toBe('value+1');
    expect(formatter['search'].get('param2')).toBe('value+2');

    const search = new URLSearchParams();
    search.set('param1', 'value 11');
    search.set('param2', 'value 22');
    formatter = new RequestFormatter({ search });
    expect(formatter['search'].get('param1')).toBe('value 11');
    expect(formatter['search'].get('param2')).toBe('value 22');
  });

  it('Method makeRequestData() should make the data base on input parameters', () => {
    data = {
      body: 'some-body',
      params: { id: 123 },
    };
    formatter = new RequestFormatter(data);

    const requestData = formatter.makeRequestData();

    expect(requestData.method).toBe(formatter['method']);
    expect(requestData.headers).toBe(formatter['headers']);
    expect(requestData.search).toBe(formatter['search']);
    expect(requestData.params).toBe(data.params);
    expect(requestData.body).toBe(data.body);
  });

});
