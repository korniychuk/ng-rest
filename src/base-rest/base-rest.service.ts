/* tslint:disable:member-ordering */
import { Response } from '@angular/http';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { Observable } from 'rxjs/Observable';

import { AnyObject, StringObject } from 'typed-object-interfaces';

import { ResponseError } from '../request/response-error';
import { RequestService } from '../request/request.service';

import { Collection } from './collection';
import { Entity } from './entity';
import { Pagination } from './pagination';
import { ValidationErrors } from './validation-errors';
import { Model, ModelConstructor } from './model';
import { status } from './status';
import { RequestFormatterConstructor } from './base-request-formatter';
import { RestRequestData } from './rest-request-data';
import { RequestFormatter } from './request-formatter';
import { ResponseParser, ResponseParserConstructor } from './response-parser';

/**
 * Base REST service for making api requests.
 *
 * Example of usage:
 *
 *     //
 *     // Declaration
 *     //
 *     class UserApiService extends BaseRestService<User> {
 *       protected baseUrl    = 'http://api.domein.com/shops/:shopId/users';
 *       protected pluralName = 'users';
 *       protected singleName = 'user';
 *       protected modelClass = User;
 *
 *       public constructor(request: RequestService) {
 *         super(request);
 *       }
 *
 *       // method example
 *       public findByShop(options: GetRequestOptions = {}): Observable<Collection<M>> {
 *         return this.send(options)
 *                    .map(this.mapCollection)
 *           ;
 *       }
 *
 *       public makeModel(entity: AnyObject): User {
 *         let mapped = this.map(entity);
 *
 *         return new User(mapped);
 *       } // end makeModel()
 *
 *       public makeRawEntity(model: User): AnyObject {
 *         let raw = this.map(model, true);
 *
 *         return raw;
 *       } // end makeRawEntity()
 *
 *       protected fieldsMap(): StringObject {
 *         return {
 *           created_at: 'createdAt',
 *           ...
 *         };
 *       } // end fieldsMap()
 *     }
 *
 *     //
 *     // Usage
 *     //
 *     class ExampleComponent {
 *       public users: User[];
 *
 *       public constructor(
 *         private userApi: UserApiService,
 *       ) {
 *       }
 *
 *       public getUsers(shopId: string) {
 *         this.userApi
 *             .findByShop({params: { shopId }})
 *             .subscribe(collection => this.users = collection.data);
 *       }
 *     }
 *
 */
export abstract class BaseRestService<M extends Model<M>> {

  /**
   * Relative entity base slash base. Should be override in child class
   */
  protected abstract baseUrl: string;
  /**
   * Constructor of a model
   */
  protected abstract modelClass: ModelConstructor<M>;
  /**
   * Constructor of the class that convert request data from Rest format RequestService format
   */
  protected requestFormatterClass: RequestFormatterConstructor = RequestFormatter;
  /**
   * Constructor of the class that convert response from raw format to Entity or Collection or
   * extracts ValidationErrors
   */
  protected responseParserClass: ResponseParserConstructor<M, Pagination> = ResponseParser;
  /**
   * Instance of the RequestParser. This is individual instance for every api service
   */
  protected parser: ResponseParser<M, Pagination>;

  /**
   * @param request
   * @param init    call {@link BaseRestService.init()} method or not?
   *                put false if you want do initialization in the child class
   */
  public constructor(
    private request: RequestService,
    init: boolean = true,
  ) {
    if (init) {
      this.init();
    }
  }

  /**
   * Initialize the class
   * Use this method instead of the {@link BaseRestService.constructor()}
   */
  protected init(): void {
    this.parser = new this.responseParserClass(this);
  }

  /**
   * 1. Retrieve first every first error for every field.
   * 2. Map remote fields name to local fields name.
   *
   * Example:
   *
   *     let validationErrorsFromServer = {
   *       city_id: [
   *         'error 1',
   *         'error 2',
   *       ],
   *       email: [
   *         'email error 1'
   *       ],
   *     };
   *
   *     // Suppose fieldsMap() returns next object
   *     {
   *       city_id: 'cityId',
   *     }
   *
   *     let errors = this.parseValidation(validationErrorsFromServer);
   *
   *     // errors will be equal to:
   *     {
   *       cityId: 'error 1',       // key was replaced
   *       email:  'email error 1', // key used as is
   *     }
   *
   */
  private parseValidation(res: ResponseError): ValidationErrors {
    return this.parser.validation(res, this.map.bind(this));
  }

  /**
   * Apply fields map to a raw object
   * {@link BaseRestService.parseValidation}
   *
   * @param raw
   * @param revert specify true for revert fieldsMap() and create raw entity from a model
   * @param map    use custom map for mapping {@link BaseRestService.map}
   */
  protected map(raw: AnyObject, revert: boolean = false, map: StringObject = null): AnyObject {
    if (!map) {
      map = this.fieldsMap();
    }
    if (revert) {
      map = Object.keys(map).reduce((res, key) => {
        const value  = map[ key ];
        res[ value ] = key;
        return res;
      }, {});
    }

    return Object
      .keys(raw)
      .reduce<AnyObject>(
        (mapped, rawName) => {
          const rawValue = raw[ rawName ];

          const targetFieldName       = map[ rawName ] || rawName;
          mapped[ targetFieldName ] = rawValue;

          return mapped;
        },
        {},
      );
  } // end map()

  /**
   * Returns function for quick add validation parsing layout
   * Example:
   *
   *     public myRequest() {
   *       return this.request
   *         .send( ... )
   *         .catch(this.catchValidation)
   *         .map( ... );
   *     }
   *
   */
  protected get catchValidation(): {
    (res: ResponseError | any): ErrorObservable<ResponseError | any>
  } {
    return status(
      422,
      (res: ResponseError) => this.parseValidation(res.data),
    );
  } // end catchValidation()

  /**
   * Returns function for quickly add default body parser for single entity response
   *
   * Example:
   *
   *     public myViewRequest() {
   *       return this.request
   *         .send( ... )
   *         .catch( ... )
   *         .map(this.mapEntity);
   *     }
   *
   */
  protected get mapEntity(): { (res: Response): Entity<M> } {
    return this.parser.entity;
  }

  /**
   * Returns function for quickly add default body parser for response with collection of entities
   *
   * Example:
   *
   *     public myListRequest() {
   *       return this.request
   *         .send( ... )
   *         .catch( ... )
   *         .map(this.mapCollection);
   *     }
   *
   */
  protected get mapCollection(): { (res: Response): Collection<M, Pagination> } {
    return this.parser.collection;
  }

  /**
   * Make request with base url using {@link RequestService}
   *
   * @param data
   * @param path        relative path
   * @param useBaseUrl  it need to concatenate baseUrl at begining
   */
  protected send(
    data: RestRequestData,
    path: string = '',
    useBaseUrl: boolean = true,
  ): Observable<any> {
    const formatter = new this.requestFormatterClass(data);

    return this.request.send(
      useBaseUrl ? `${this.baseUrl}${path}` : path,
      formatter.makeRequestData(),
    );
  } // end send()

  /**
   * Parse one entity from response and create instance one of Model classes
   */
  public makeModel(entity: AnyObject): M {
    const mapped = this.map(entity);

    return new this.modelClass(mapped);
  }

  /**
   * Take a Model class and prepare to sending on server
   */
  public makeRawEntity(model: M): AnyObject {
    const raw = this.map(model, true);

    return raw;
  }

  /**
   * This method suppose for overriding.
   *
   * Map remote field names to local field names.
   * If a field has the same name no need to specify it in this map.
   *
   * Example:
   *
   *     {
   *       // remote_name : localName
   *
   *       city_id:        'cityId',
   *       full_user_name: 'name',
   *     }
   *
   */
  protected fieldsMap(): StringObject {
    return {};
  };

}
