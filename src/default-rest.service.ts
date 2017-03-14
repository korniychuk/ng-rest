import { RequestMethod } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { AnyObject } from 'app/helpers/typed-object';

import { BaseRestService } from './base-rest/base-rest.service';
import { Entity } from './base-rest/entity';
import { Collection } from './base-rest/collection';
import { RestRequestSearchParams } from './base-rest/rest-request-search-params';
import { Model } from './base-rest/model';
import { Pagination } from './base-rest/pagination';
import { RequestService } from './request/request.service';

/**
 * Implementation default rest methods
 */
export abstract class DefaultRestService<M extends Model<M>> extends BaseRestService<M> {

  public constructor(request: RequestService) {
    super(request);
  }

  public view(id: string | number, options: RestRequestSearchParams = {}): Observable<Entity<M>> {
    return this.send(options, `/${id}`)
               .map(this.mapEntity)
      ;
  } // end get()

  public list(options: RestRequestSearchParams = {}): Observable<Collection<M, Pagination>> {
    return this.send(options)
               .map(this.mapCollection)
      ;
  } // end list()

  public create(model: M, options: RestRequestSearchParams = {}): Observable<Entity<M>> {
    const summaryOptions = {
      method: RequestMethod.Post,
      body:   this.makeRawEntity(model),
      ...options,
    };

    return this.send(summaryOptions)
               .map(this.mapEntity)
               .catch(this.catchValidation)
      ;
  } // end create()

  public update(model: M, options: RestRequestSearchParams = {},
                pk: string = 'id',
  ): Observable<Entity<M>> {
    const summaryOptions = {
      method: RequestMethod.Put,
      body:   this.makeRawEntity(model),
      ...options,
    };

    return this.send(summaryOptions, `/${model[ pk ]}`)
               .map(this.mapEntity)
               .catch(this.catchValidation)
      ;
  } // end update()

  public delete(model: M,
                options: RestRequestSearchParams = {},
                pk: string = 'id',
  ): Observable<AnyObject> {
    const summaryOptions = {
      method: RequestMethod.Delete,
      ...options,
    };

    return this.send(summaryOptions, `/${model[ pk ]}`)
               // .map(this.mapEntity)
               .catch(this.catchValidation)
      ;
  } // end delete()

} // end DefaultRestService
