/* tslint:disable:no-unused-variable */
/* tslint:disable:max-classes-per-file */

import { Injectable } from '@angular/core';
import { RequestMethod } from '@angular/http';
import { TestBed, async, inject } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { DefaultRestService } from './default-rest.service';
import { RequestService } from './request/request.service';
import { Model } from './base-rest/model';

class MockRequestService {
}

class User extends Model<User> {
}

@Injectable()
class UserApiService extends DefaultRestService<User> {
  protected baseUrl: string = '/users';

  protected modelClass      = User;

  public constructor(request: RequestService) {
    super(request);
  } // end constructor()

}

describe('Service: DefaultRest', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserApiService,
        {
          provide: RequestService,
          useClass: MockRequestService,
        },
      ],
    });
  });

  it('Should create service instance with Request dependency and baseUrl', inject(
    [UserApiService],
    (service: UserApiService) => {
      expect(service['request'] instanceof MockRequestService).toBeTruthy();
      expect(service['baseUrl']).toBe('/users');
    },
  ));

  it('Method view() should make GET request for an entity by id and parse it as Entity', (done) => (
    inject(
    [ UserApiService, RequestService ],
    (service: UserApiService, req: MockRequestService) => {
      const model = { name: 'test' };
      const chanel$ = new Subject<any>();

      spyOn(<any> service, 'send').and.returnValue(chanel$);

      Object.defineProperty(service, 'mapEntity', {
        value: (entity) => {
          expect(entity).toBe('arg-to-send-method');
          return model;
        },
      });
      service.view(123, <any> 'options')
        .subscribe(
          (localModel: any) => {
            expect(localModel).toBe(model);
            done();
          },
          (err: any) => {
            done.fail('Fail: Catch block fired');
          },
        );

      expect(service['send']).toHaveBeenCalledWith('options', '/123');

      chanel$.next('arg-to-send-method');
      chanel$.complete();
    },
  )()));

  it('Method list() should make GET request for collection and parse it as Collection', (done) => (
    inject(
    [ UserApiService ],
    (service: UserApiService) => {
      const model = { name: 'test' };
      const chanel$ = new Subject<any>();

      spyOn(<any> service, 'send').and.returnValue(chanel$);

      Object.defineProperty(service, 'mapCollection', {
        value: (entities) => {
          expect(entities).toBe('arg-to-send-method');
          return model;
        },
      });
      service.list(<any> 'options')
             .subscribe(
               (localModel: any) => {
                 expect(localModel).toBe(model);
                 done();
               },
               (err: any) => {
                 done.fail('Fail: Catch block fired');
               },
             );

      expect(service['send']).toHaveBeenCalledWith('options');

      chanel$.next('arg-to-send-method');
      chanel$.complete();
    },
  )()));

  it('Method create() should make POST request for creation an entity', (done) => (
    inject(
      [ UserApiService ],
      (service: UserApiService) => {
        const model: any = { name: 'test '};
        const entity: any = { name: 'test 2' };
        const savedModel: any = { id: 123 };

        const chanel$ = new Subject<any>();
        const options = { prop: 'value' };

        let doneCount = 0;

        spyOn(<any> service, 'send').and.returnValue(chanel$);
        spyOn(<any> service, 'makeRawEntity').and.returnValue(entity);

        Object.defineProperties(service, {
          mapEntity: { value: (rawRequestModel) => {
            expect(rawRequestModel).toBe('arg-to-send-method');

            return savedModel;
          }},
          catchValidation: { value: (localErr: Error) => {
            expect(localErr.message).toBe('validation-error');
            return Observable.throw(new Error('processed-validation-error'));
          }},
        });
        service.create(model, options)
               .subscribe(
                 (data) => {
                   expect(data).toBe(savedModel);
                   if (doneCount++) {
                     done();
                   }
                 },
                 (localErr: Error) => {
                   expect(localErr.message).toBe('processed-validation-error');
                   if (doneCount++) {
                     done();
                   }
                 },
               );

        expect(service['makeRawEntity']).toHaveBeenCalledWith(model);
        expect(service[ 'send' ]).toHaveBeenCalledWith(jasmine.objectContaining({
          method: RequestMethod.Post,
          body:   entity,
          ...options,
        }));

        chanel$.next('arg-to-send-method');
        chanel$.error(new Error('validation-error'));
      },
    )()));

  it('Method update() should make PUT request for update an entity', (done) => (
    inject(
      [ UserApiService ],
      (service: UserApiService) => {
        const model: any = { name: 'test ', id: 234 };
        const entity: any = { name: 'test 2' };
        const savedModel: any = { id: 123 };

        const chanel$ = new Subject<any>();
        const options = { prop: 'value' };

        let doneCount = 0;

        spyOn(<any> service, 'send').and.returnValue(chanel$);
        spyOn(<any> service, 'makeRawEntity').and.returnValue(entity);

        Object.defineProperties(service, {
          mapEntity: { value: (rawRequestModel) => {
            expect(rawRequestModel).toBe('arg-to-send-method');

            return savedModel;
          }},
          catchValidation: { value: (localErr: Error) => {
            expect(localErr.message).toBe('validation-error');
            return Observable.throw(new Error('processed-validation-error'));
          }},
        });
        service.update(model, options)
               .subscribe(
                 (data) => {
                   expect(data).toBe(savedModel);
                   if (doneCount++) {
                     done();
                   }
                 },
                 (localErr: Error) => {
                   expect(localErr.message).toBe('processed-validation-error');
                   if (doneCount++) {
                     done();
                   }
                 },
               );

        expect(service['makeRawEntity']).toHaveBeenCalledWith(model);
        expect(service[ 'send' ]).toHaveBeenCalledWith(
          jasmine.objectContaining({
            method: RequestMethod.Put,
            body:   entity,
            ...options,
          }),
          '/234',
        );

        chanel$.next('arg-to-send-method');
        chanel$.error(new Error('validation-error'));
      },
    )()));

  it('Method delete() should make DELETE request for delete an entity', (done) => (
    inject(
      [ UserApiService ],
      (service: UserApiService) => {
        const model: any        = { name: 'test ', id: 234 };

        const chanel$ = new Subject<any>();
        const options = { prop: 'value' };

        let doneCount = 0;

        spyOn(<any> service, 'send').and.returnValue(chanel$);

        Object.defineProperties(service, {
          catchValidation: { value: (localErr: Error) => {
            expect(localErr.message).toBe('validation-error');
            return Observable.throw(new Error('processed-validation-error'));
          }},
        });
        service.delete(model, options)
               .subscribe(
                 (data) => {
                   expect(data).toBe('arg-to-send-method');
                   if (doneCount++) {
                     done();
                   }
                 },
                 (localErr: Error) => {
                   expect(localErr.message).toBe('processed-validation-error');
                   if (doneCount++) {
                     done();
                   }
                 },
               );

        expect(service[ 'send' ]).toHaveBeenCalledWith(
          jasmine.objectContaining({
            method: RequestMethod.Delete,
            ...options,
          }),
          '/234',
        );

        chanel$.next('arg-to-send-method');
        chanel$.error(new Error('validation-error'));
      },
    )()));

});
