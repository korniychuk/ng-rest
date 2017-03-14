/* tslint:disable:no-empty */
/* tslint:disable:no-consecutive-blank-lines */

import { Response } from '@angular/http';

import { Model } from './model';
import { Pagination } from './pagination';
import { ResponseParser } from './response-parser';
import { BaseRestService } from './base-rest.service';
import { Collection } from './collection';
import { Entity } from './entity';
import { ResponseError } from '../request/response-error';
import { ValidationErrors } from './validation-errors';

class User extends Model<User> {

}

describe('REST Module: ResponseParser class', () => {
  let userApiService: BaseRestService<User>;
  let parser: ResponseParser<User, Pagination>;

  beforeEach(() => {
    userApiService = <any> {};
    parser = new ResponseParser(userApiService);
  });

  it('Should create instance and set rest service to property', () => {
    expect(parser['rest']).toEqual(userApiService);
  });

  it('Getter collection() should return callback that create a Collection from a response', () => {
    spyOn(<any> parser, 'extractCollectionData').and.returnValue([ 1, 2, 3 ]);
    spyOn(<any> parser, 'extractPagination').and.returnValue('test-pagination');
    userApiService.makeModel = (m: any): any => m * 2;
    const res: any = 'response';

    const collection = parser.collection(res);

    expect(collection instanceof Collection).toBeTruthy('Failed to make Collection instance');
    expect(collection.data).toEqual([ 2, 4, 6 ], 'Fail call makeModel() on every entity');
    expect(collection.pagination).toEqual('test-pagination');

    expect(parser[ 'extractCollectionData' ]).toHaveBeenCalledWith(res);
    expect(parser[ 'extractPagination' ]).toHaveBeenCalledWith(res);
  });

  it('Getter entity() should return callback that create an Entity from a response', () => {
    spyOn(<any> parser, 'extractEntityData').and.returnValue(5);
    userApiService.makeModel = (m: any): any => m * 2;
    const res: any = 'response';

    const entity = parser.entity(res);

    expect(entity instanceof Entity).toBeTruthy('Failed to make Entity instance');
    expect(entity.data).toEqual(10);
    expect(parser['extractEntityData']).toHaveBeenCalledWith(res);
  });

  it('Getter json() should return callback that create default object from response', () => {
    const res: any = 'response';
    spyOn(<any> parser, 'extractData').and.returnValue('my-data');

    const data = parser.json(res);

    expect(data).toBe('my-data');
    expect(parser['extractData']).toHaveBeenCalledWith(res);
  });

  it('Method validation() should convert data from RawValidation format to ValidationErrors',
    () => {
      const raw = {
        name: [
          'error 1',
          'error 2',
        ],
        age: [
          'error 3',
        ],
      };
      const res = <ResponseError> { data: raw };

      const map = (data) => {
        return {
          name2: data['name'],
          age2: data['age'],
        };
      };

      const errors = parser.validation(res, map);

      expect(errors instanceof ValidationErrors).toBeTruthy();
      expect(errors).toEqual(jasmine.objectContaining({
        name2: 'error 1',
        age2: 'error 3'
      }));
    }
  );

  it('Method extractPagination() should extract validation object from response', () => {
    const body = {
      page: '2',
      perPage: '10',
      prevPage: '1',
      nextPage: '3',

      from: '11',
      to: '22',

      otherProperty: 123,
    };
    const res: any = {};


    spyOn(<any> parser, 'extractData').and.returnValue(body);
    const pagination = parser['extractPagination'](res);

    expect(pagination).not.toBe(body);
    expect(pagination['page']).toBe(2);
    expect(pagination['perPage']).toBe(10);
    expect(pagination['prevPage']).toBe(1);
    expect(pagination['nextPage']).toBe(3);
    expect(pagination['from']).toBe(11);
    expect(pagination['to']).toBe(22);
    expect(pagination['otherProperty']).toBeUndefined();
    expect(parser['extractData']).toHaveBeenCalledWith(res);

    (<any> parser['extractData']).calls.reset();


    (<any> parser['extractData']).and.returnValue({});
    const pagination2 = parser['extractPagination'](res);

    ['page', 'perPage', 'prevPage', 'nextPage', 'from', 'to'].forEach((name) =>
      expect(pagination2[name]).toBeNull()
    );
  });

  it('Method extractEntityData() should retrieve data from "data" body property', () => {
    const body = {
      data: 'An Entity',
    };
    const res: any = 'Response object';
    spyOn(<any> parser, 'extractData').and.returnValue(body);

    const data = parser['extractEntityData'](res);

    expect(parser['extractData']).toHaveBeenCalledWith(res);
    expect(data).toBe(body.data);
  });

  it('Method extractCollectionData() should retrieve data from "data" body property', () => {
    const body = {
      data: 'A Collection',
    };
    const res: any = 'Response object';
    spyOn(<any> parser, 'extractData').and.returnValue(body);

    const data = parser['extractCollectionData'](res);

    expect(parser['extractData']).toHaveBeenCalledWith(res);
    expect(data).toBe(body.data);
  });

  it('Method extractData() should retrieve body as json from angular Response object', (done) => {
    const body1 = ['item 1'];
    const res1: Response = <any> {
      json: () => body1,
      status: 200,
    };

    const body2 = { prop: 'value' };
    const res2: Response = <any> {
      json: () => body2,
      status: 204,
    };

    const errRes1: Response = <any> {
      // Non-object response is error
      json: () => 'non-object',
    };
    const errRes2: Response = <any> {
      // Collection response with 204 status is error
      json: () => ['item 1'],
      status: 204,
    };

    const data1 = parser['extractData'](res1);
    expect(data1).toBe(body1);

    const data2 = parser['extractData'](res2);
    expect(data2).toBe(body2);

    try {
      parser['extractData'](errRes1);
      done.fail('Do not throw an exception if body is not object');
    } catch (e) {}

    try {
      parser['extractData'](errRes2);
      done.fail('Do not throw an exception if body is collection and status 204');
    } catch (e) {}

    done();
  });

});
