/* tslint:disable:no-consecutive-blank-lines */
import { RequestFormatter } from './request-formatter';
import { RestRequestData } from './rest-request-data';
import { URLSearchParams } from '@angular/http';

describe('REST Module: RequestFormatter', () => {
  let data: RestRequestData;
  let formatter: RequestFormatter<RestRequestData>;

  it('Should create instance and fire prepare() method in the parent constructor', () => {
    data = { body: 'some body' };

    spyOn(<any> RequestFormatter.prototype, 'prepare');
    formatter = new RequestFormatter(data);
    expect(RequestFormatter.prototype['prepare']).toHaveBeenCalledWith(data);
    expect(formatter['body']).toBe('some body');

    (<any> RequestFormatter.prototype['prepare']).calls.reset();
    formatter = new RequestFormatter(data, false);
    expect(RequestFormatter.prototype['prepare']).not.toHaveBeenCalled();
  });

  it('Method prepareHeaders() should add auth token to headers list', () => {
    // Without token case
    formatter = new RequestFormatter({});
    expect(formatter['headers'].get('Authorization')).toBeNull('Failed on without token');

    // Default case with token
    data = { token: 'my-token' };
    formatter = new RequestFormatter(data);
    expect(formatter['headers'].get('Authorization'))
      .toBe('Bearer ' + data.token, 'Failed on default case with token');
  });

  it('Method prepare() should call all other preparation methods', () => {
    data = {};
    formatter = new  RequestFormatter(data);

    spyOn(<any> RequestFormatter.prototype, 'prepareHeaders');
    spyOn(<any> RequestFormatter.prototype, 'preparePagination');
    spyOn(<any> RequestFormatter.prototype, 'prepareQueryParams');

    formatter['prepare'](data);

    expect(RequestFormatter.prototype['prepareHeaders']).toHaveBeenCalledWith(data);
    expect(RequestFormatter.prototype['preparePagination']).toHaveBeenCalledWith(data);
    expect(RequestFormatter.prototype['prepareQueryParams']).toHaveBeenCalledWith(data);
  });

  it('Method prepareQueryParams() should add "fields" and "expand" params if it set', () => {
    // Non-array values should not be processed
    data = <any> {
      fields: 'non-array-value',
      expand: 'non-array-value',
    };
    formatter = new RequestFormatter(data);

    expect(formatter['search'].get('fields')).toBeNull();
    expect(formatter['search'].get('expand')).toBeNull();


    // If fields or expand should be ignored if it set via search params
    data = {
      search: { fields: 'surname', expand: 'access' },
      fields: ['name', 'age'],
      expand: ['city', 'country'],
    };
    formatter = new RequestFormatter(data);

    expect(formatter['search'].get('fields')).toBe('surname');
    expect(formatter['search'].get('expand')).toBe('access');


    // Should not be set if the it not specified in data object
    formatter = new RequestFormatter({});

    expect(formatter['search'].get('fields')).toBeNull('Failed on empty: fields');
    expect(formatter['search'].get('expand')).toBeNull('Failed on empty: expand');


    // Default call
    data = {
      fields: ['name', 'age'],
      expand: ['city', 'country'],
    };
    formatter = new RequestFormatter(data);

    expect(formatter['search'].get('fields')).toBe('name,age', 'Failed on default call: fields');
    expect(formatter['search'].get('expand'))
      .toBe('city,country', 'Failed on default call: fields');


    // Renamed fields
    const Formatter = class extends RequestFormatter<RestRequestData> {
      protected expandQueryParam = 'expand-2';
      protected fieldsQueryParam = 'fields-2';

      public constructor(localData: any) {
        super(localData, false);

        this.prepare(localData);
      } // end constructor()
    };

    // Uses data from previous test
    formatter = new Formatter(data);

    expect(formatter['search'].get('fields-2')).toBe('name,age', 'Failed renamed: fields');
    expect(formatter['search'].get('expand-2')).toBe('city,country', 'Failed renamed: expand');
  });

  it('Method prepare pagination should query pagination params but only it', () => {
    let search: URLSearchParams;

    // Without data
    search = new RequestFormatter({})['search'];
    expect(search.get('page')).toBeNull('Failed on empty page');
    expect(search.get('perPage')).toBeNull('Failed on empty perPage');
    expect(search.get('from')).toBeNull('Failed on empty from');
    expect(search.get('to')).toBeNull('Failed on empty to');

    // Default case with data
    data = {
      pagination: {
        perPage: 20,
        page: 3,
        from: 11,
        to: 99,
      },
    };
    search = new RequestFormatter(data)['search'];
    expect(search.get('page')).toBe(data.pagination.page, 'Param page failed');
    expect(search.get('perPage')).toBe(data.pagination.perPage, 'Param perPage failed');
    expect(search.get('from')).toBe(data.pagination.from, 'Param from failed');
    expect(search.get('to')).toBe(data.pagination.to, 'Param to failed');

    // Should not override search params
    data = {
      search: { page: 5 },
      pagination: {
        perPage: 20,
        page: 3,
      },
    };
    search = new RequestFormatter(data)['search'];
    expect(search.get('page'))
      .toBe(data.search['page'], 'Failed on should not override search: page');
    expect(search.get('perPage'))
      .toBe(data.pagination.perPage, 'Failed on should not override search: perPage');
  });

});
