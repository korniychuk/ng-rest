/* tslint:disable:member-ordering */
import { Response } from '@angular/http';

import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { Observable } from 'rxjs/Observable';
import { AnyObject, StringObject, DefaultObject } from 'typed-object-interfaces';

import { ResponseError } from '../request/response-error';

import { Collection } from './collection';
import { Entity } from './entity';
import { Pagination } from './pagination';
import { ValidationErrors } from './validation-errors';
import { Model, ModelConstructor } from './model';
import { status } from './status';
import { RestRequestData } from './rest-request-data';
import { ResponseParser, ResponseParserConstructor } from './response-parser';
import { RestRequestService } from './rest-request.service';

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
   * Constructor of the class that convert response from raw format to Entity or Collection or
   * extracts ValidationErrors
   */
  protected responseParserClass: ResponseParserConstructor<M, Pagination> = ResponseParser;
  /**
   * Instance of the RequestParser. This is individual instance for every api service
   */
  protected parser: ResponseParser<M, Pagination>;

  protected static revert(map: DefaultObject): StringObject {
    return Object
      .keys(map)
      .reduce((reverted, key) => Object.assign(reverted, { [ map[ key ] /* value */ ]: key }), {});
  }

  /**
   * @param restRequest
   * @param init     call {@link BaseRestService.init()} method or not?
   *                 put false if you want do initialization in the child class
   */
  public constructor(
    private restRequest: RestRequestService,
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
  private parseValidation(body: any): ValidationErrors {
    return this.parser.validation(body, this.map.bind(this));
  }

  /**
   * Apply fields map to a raw object
   * {@link BaseRestService.parseValidation}
   *
   * @example
   *
   *     const user = {
   *       id: 5,
   *       name: 'Mike',
   *       isAdmin: true
   *     };
   *
   *     const rawUser = this.map(
   *       user,
   *       true,
   *       {
   *         user_name: 'name',
   *         is_admin: 'isAdmin'
   *       }
   *     );
   *     rawUser; // { id: 5, user_name: 'Mike', is_admin: true }
   *
   *     const user2 = this.map(
   *       rawUser,
   *       false,
   *       {
   *         user_name: 'name',
   *         is_admin: 'isAdmin'
   *       }
   *     );
   *     user2; // { id: 5, name: 'Mike', isAdmin: true }
   *
   * @param raw
   * @param revert specify true for revert fieldsMap() and create raw entity from a model
   * @param map    use custom map for mapping {@link BaseRestService.map}
   */
  public map(raw: AnyObject, revert: boolean = false, map: StringObject = null): AnyObject {
    if (!map) {
      map = this.fieldsMap();
    }
    if (revert) {
      map = BaseRestService.revert(map);
    }

    return Object
      .keys(raw)
      .reduce<AnyObject>(
        (mapped, rawName) => {
          const rawValue        = raw[ rawName ];
          const targetFieldName = map[ rawName ] || rawName;

          mapped[ targetFieldName ] = rawValue;

          return mapped;
        },
        {},
      );
  } // end map()

  /**
   * Apply model fields map to mapped with default {@link map()} object
   */
  public mapModelFields(source: M | AnyObject/*, isRawEntity: boolean = false*/): M | AnyObject {
    let modelFieldsMap = this.modelFieldsMap();

    const revertedFieldsMap = BaseRestService.revert(this.fieldsMap());
    modelFieldsMap = Object
      .keys(modelFieldsMap)
      .reduce((res, field) =>
        Object.assign(res, { [ revertedFieldsMap[ field ] ]: modelFieldsMap[ field ] }),
        {}
      );

    const patched = Object
      .keys(modelFieldsMap)
      .filter((field) => source[ field ])
      .reduce(
        (res, field) =>
          res[ field ] = /* submodel */ modelFieldsMap[ field ].makeModel(source[ field ]),

        Object.assign({}, source) /* clone */
      );

    return patched;
  } // end mapModelFields()

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
    (res: ResponseError | any): ErrorObservable
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
  public get mapEntity(): { (res: Response): Entity<M> } {
    return this.parser.entity.bind(this.parser);
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
  public get mapCollection(): { (res: Response): Collection<M, Pagination> } {
    return this.parser.collection.bind(this.parser);
  }

  /**
   * Make full url and delegate request to {@link RestRequestService}
   *
   * @param data
   * @param path        relative path
   * @param useBaseUrl  it need to concatenate baseUrl at beginning
   */
  protected send(
    data: RestRequestData<any>,
    path: string = '',
    useBaseUrl: boolean = true,
  ): Observable<Response> {
    const url: string = useBaseUrl ? `${this.baseUrl}${path}` : path;

    return this.restRequest.send(data, url, this);
  } // end send()

  /**
   * Parse one entity from response and create instance one of Model classes
   */
  public makeModel(entity: AnyObject): M {
    const entityWithSubmodels = this.mapModelFields(entity);

    const mapped = this.map(entityWithSubmodels);

    return new this.modelClass(mapped);
  }

  /**
   * Take a Model class and prepare to sending on server
   */
  public makeRawEntity(model: M): AnyObject {
    const raw = this.map(model, true);

    const rawWithSubmodels = this.mapModelFields(raw);

    return rawWithSubmodels;
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

  /**
   * Submodel-services map with field names that should be processed in {@link makeModel()} and
   * {@link makeRawEntity} methods.
   *
   * Example:
   *
   *     {
   *       user:          this.userApi,
   *       userLocation: this.locationApi,
   *     }
   */
  protected modelFieldsMap(): {[name: string]: BaseRestService<any>} {
    return {};
  } // end modelFieldsMap()

}
