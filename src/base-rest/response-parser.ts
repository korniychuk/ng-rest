import { Response } from '@angular/http';

import { AnyObject } from 'typed-object-interfaces';
import { Collection } from './collection';
import { Entity, EntityConstructor } from './entity';
import { CollectionConstructor } from './collection';
import { Pagination } from './pagination';
import { BaseRestService } from './base-rest.service';
import { ValidationErrors } from './validation-errors';
import { ResponseError } from '../request/response-error';
import { Model } from './model';

/**
 *
 */
export class ResponseParser<M extends Model<M>, P extends Pagination> {
  /** Constructor of collection. You can override it if you want to extend collection */
  protected collectionClass: CollectionConstructor<M, P> = Collection;

  /** Constructor of an entity. You can override it if you want to extend entity object */
  protected entityClass: EntityConstructor<M> = Entity;

  public constructor(
    protected rest: BaseRestService<M>,
  ) {
  }

  public get collection() {
    return (res: Response): Collection<M, P> => {
      const data = this.extractCollectionData(res);

      const model = data.map((entity) => this.rest.makeModel(entity));
      const pagination: P = this.extractPagination(res);

      return new this.collectionClass(model, pagination);
    };
  } // end collection()

  public get entity() {
    return (res: Response): Entity<M> => {
      const data = this.extractEntityData(res);

      const model = this.rest.makeModel(data);

      return new this.entityClass(model);
    };
  } // end entity()

  public get json() {
   return (res: Response): AnyObject|any[] => {
      const data = this.extractData(res);

      return data;
    };
  } // end json()

  public validation(res: ResponseError, map: { (raw: AnyObject): AnyObject }): ValidationErrors {
    const raw: RawValidation = res.data;

    const firstErrors = Object.keys(raw).reduce(
      (all, field) => Object.assign(all, { [field]: raw[ field ][ 0 ] }),
      {},
    );

    return new ValidationErrors(map(firstErrors));
  } // end validation()

  protected extractPagination(res: Response): P {
    const body = this.extractData(res);

    const pagination = <P> {
      prevPage : +body.prevPage || null,
      nextPage : +body.nextPage || null,
      perPage  : +body.perPage  || null,
      page     : +body.page     || null,
      from     : +body.from     || null,
      to       : +body.to       || null,
    };

    return pagination;
  } // end extractPagination()

  protected extractEntityData(res: Response): AnyObject {
    const body = this.extractData(res);
    const data = body['data'];

    return data;
  } // end extractEntityData()

  protected extractCollectionData(res: Response): AnyObject[] {
    const body = this.extractData(res);
    const data: any[] = body['data'];

    // body[ this.pluralName ] = entities.map((entity) => this.makeModel(entity));

    return data;
  } // end extractCollectionData()

  protected extractData(res: Response): AnyObject {
    let body = res.json();
    if ( body instanceof Object === false                     // all responses body should be object
      || res.status === 204 && body instanceof Array === true // created object
    ) {
      throw new Error('Incorrect body');
    }

    return body;
  } // end extractData()

}

export type ResponseParserConstructor<M extends Model<M>, P extends Pagination> = {
  new (rest: BaseRestService<M>): ResponseParser<M, P>
};

export type RawValidation = {
  [field: string]: string[];
};

/*
// Yii2: validation errors

interface RawValidationError {
  field: string;
  message: string;
}

export type RawValidation = RawValidationError[];
*/
