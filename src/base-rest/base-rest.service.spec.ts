/* tslint:disable:no-unused-variable */
/* tslint:disable:max-classes-per-file */
/* tslint:disable:max-line-length */
/* tslint:disable:no-consecutive-blank-lines */

import { Injectable } from '@angular/core';
import { TestBed, async, inject } from '@angular/core/testing';

import { Observable } from 'rxjs/Observable';

import { AnyObject } from 'typed-object-interfaces';
import { RequestService } from '../request/request.service';

import { BaseRestService } from './base-rest.service';
import { Model, ModelConstructor } from './model';
import { BaseRequestFormatter } from './base-request-formatter';
import { ResponseError } from '../request/response-error';
import { ResponseParser } from './response-parser';

class User extends Model<User> {

  public constructor(data: any = {}) {
    super(data);

    Object.assign(this, data);
  }

}

@Injectable()
class UserApiService extends BaseRestService<User> {
  public baseUrl: string = 'http://localhost';
  public modelClass: ModelConstructor<User> = User;

  public constructor(request: RequestService) {
    super(request);
  }

  public makeModel(entity: AnyObject): User {
    const model = super.makeModel(entity);

    model['children'] = 'value 1';

    return model;
  }

  public makeRawEntity(model: User): AnyObject {
    const entity = super.makeRawEntity(model);

    entity['children'] = 'value 2';

    return entity;
  }

} // end UserApiService

describe('REST Module: BaseRestService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserApiService,
        {
          provide: RequestService,
          useValue: {},
        },
      ],
    });
  });

  it('Should create instance and init pre-defined properties', inject(
    [UserApiService],
    (service: UserApiService) => {
      expect(service instanceof UserApiService).toBeTruthy();

      expect(BaseRequestFormatter.isPrototypeOf(service['requestFormatterClass']))
        .toBeTruthy('BaseRequestFormatter failed');

      expect(ResponseParser).toBe(service['responseParserClass'], 'responseParserClass failed');

      expect(service['parser'] instanceof ResponseParser)
        .toBeTruthy('Response Parser instance failed');
    }
  ));

  it('Getter catchValidation() should return error handler callback that will call'
   + 'parseValidation() method for convert validation errors', (done) => (inject(
    [UserApiService],
    (service: UserApiService) => {
      const catcher = service['catchValidation'];
      let error: ResponseError;


      error = new ResponseError('some data', 'error msg');
      error.status = 422;

      const parser: any = {
        validation: (res, map) => {
          expect(res).toBe('some data');
          expect(map.constructor.prototype.isPrototypeOf(service['map']));
          return 'parsed-validation-errors';
        }
      };
      service['parser'] = parser;

      catcher(error)
        .do(() => done.fail('Status match case: not thrown'))
        .catch((err: Error) => {
          expect(err).toBe('parsed-validation-errors');
          return Observable.of(true);
        })
        .subscribe();


      spyOn(<any> service, 'parseValidation').and.returnValue('parsed');

      error = new ResponseError('some data', 'error msg');
      error.status = 200;
      catcher(error)
        .do(() => done.fail('Other status case: not thrown'))
        .catch((err: Error) => {
          expect(service['parseValidation']).not.toHaveBeenCalled();
          return Observable.of(true);
        })
        .subscribe();

      done();
    }
  )()));

  it('Getter mapEntity() should return result of the call of the parser getter "entity"', inject(
    [UserApiService],
    (service: UserApiService) => {
      const parser: any = {
        entity: 'entity-getter-result',
      };
      service['parser'] = parser;

      expect(service['mapEntity']).toBe('entity-getter-result');
    }
  ));

  it('Getter mapCollection() should return result of the call of the parser getter "collection',
    inject([UserApiService], (service: UserApiService) => {
      const parser: any = {
        collection: 'collection-getter-result',
      };
      service['parser'] = parser;

      expect(service['mapCollection']).toBe('collection-getter-result');
    }
  ));

  it('Method send() should call Request#send() method with prepared RequestData and url', inject(
    [UserApiService],
    (service: UserApiService) => {
      const data: any = 'rest-request-data';
      const request: any = { send: () => '' };
      const url = '/users';
      const formatter = { makeRequestData: () => 'prepared-' + data };

      service['request'] = request;
      spyOn(<any> service, 'requestFormatterClass').and.returnValue(formatter);
      spyOn(<any> request, 'send').and.returnValue('send-result');


      const res = service['send'](data, url);
      expect(request.send).toHaveBeenCalledWith(service.baseUrl + url, 'prepared-' + data);
      expect(res).toEqual('send-result');

      request.send.calls.reset();
      service['send'](data, url, false);
      expect(request.send).toHaveBeenCalledWith(url, 'prepared-' + data);

      request.send.calls.reset();
      service['send'](data);
      expect(request.send).toHaveBeenCalledWith(service.baseUrl, 'prepared-' + data);

    }
  ));

  it('map() method should replace properties correctly', inject(
    [UserApiService],
    (service: UserApiService) => {
      const map = {
        raw_name: 'targetName',
      };
      const rawObj = {
        raw_name:      'test1',
        normalRawName: 'test2',
      };

      const targetObj = service['map'](rawObj, false, map);
      expect(targetObj.targetName).toBe('test1', 'Fail convert property name to target');
      expect(targetObj.normalRawName).toBe('test2', 'Fail skip to rename not-mapped properties');

      const reverseObj = service['map'](rawObj, true, map);
      expect(reverseObj.raw_name).toBe('test1', 'Fail reverse renaming the property');
      expect(reverseObj.normalRawName).toBe('test2', 'Fail reverse skip to rename not-mapped properties');

      spyOn(<any> service, 'fieldsMap').and.returnValue(map);

      const targetObj2 = service['map'](rawObj);
      expect(targetObj2.targetName).toBe('test1', 'Using fieldsMap(): Fail convert property name to target');
      expect(targetObj2.normalRawName).toBe('test2', 'Using fieldsMap(): Fail skip to rename not-mapped properties');

      const reverseObj2 = service['map'](rawObj, true);
      expect(reverseObj2.raw_name).toBe('test1', 'Using fieldsMap(): Fail reverse renaming the property');
      expect(reverseObj2.normalRawName).toBe('test2', 'Using fieldsMap(): Fail reverse skip to rename not-mapped properties');

    }
  ));

  it('Method makeModel() should return instance of the model', inject(
    [UserApiService],
    (service: UserApiService) => {
      const mappedUserEntity = { name: 'ivan' };

      spyOn(<any> service, 'map').and.returnValue(mappedUserEntity);

      const model = service.makeModel(<any> 'user-entity');
      expect(service['map']).toHaveBeenCalledWith('user-entity');
      expect(model instanceof User).toBeTruthy();
      expect(model).toEqual(jasmine.objectContaining({ name: 'ivan', children: 'value 1' }));
    }
  ));

  it('Method makeRawEntity() should create mapped raw model by Model instance', inject(
    [UserApiService],
    (service: UserApiService) => {
      const user = new User({ name: 'jak' });
      const mappedUser = { name: 'ivan' };

      spyOn(<any> service, 'map').and.returnValue(mappedUser);

      const raw = service.makeRawEntity(user);

      expect(raw).toEqual(jasmine.objectContaining({ name: 'ivan', children: 'value 2' }));
      expect(service['map']).toHaveBeenCalledWith(user, true);
    }
  ));

  it('Method fieldsMap() should return empty object be default', inject(
    [UserApiService],
    (service: UserApiService) => {
      const map = service['fieldsMap']();
      expect(map instanceof Object).toBeTruthy();
    }
  ));

});
