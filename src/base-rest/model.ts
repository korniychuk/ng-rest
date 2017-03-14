import { ModelApply } from './model-apply';

/**
 * Base model class.
 * - Every model should extend this class.
 * - Don't use interfaces for models
 * - Always set primary key field
 *
 * Example:
 *
 *     class User extends Model<User> {
 *       public id: number;
 *       public name: string;
 *       public isAdmin: boolean;
 *       public roles: string[];
 *       public createdAt: Date;
 *       public cityId: number;
 *       public city: City;
 *
 *       /**
 *        * @inheritDoc
 *        * /
 *       public constructor(data: any = {}) {
 *         super(data);
 *
 *         this.fill(data)
 *             .number('id')
 *             .string('name')
 *             .boolean('isAdmin')
 *             .array('roles')
 *             .date('createdAt')
 *             .number('cityId')
 *             .model('city')
 *         ;
 *       }
 *
 *     }
 *
 */
export abstract class Model<M> {

  /**
   * Use `data` parameter for set initial values for a model.
   * Constructor suppose only for set initial properties.
   * All initial logic should be moved to `init()` method.
   *
   * @param data
   */
  public constructor(data: any = {}) {
    this.init();
  } // end constructor()

  /**
   * Any initializing logic
   */
  // tslint:disable-next-line:no-empty
  public init(): void {
  } // end init()

  /**
   * Clone and extend the forTask in the same method
   * @param updates
   *
   * Example:
   *
   *     let user = new User();
   *     user2 = user.clone({saved: false});
   */
  public clone(updates: any = {}): M {
    const ModelConstructor = Object.getPrototypeOf(this).constructor;

    const model = new ModelConstructor(Object.assign({}, this, updates));

    return model;
  } // end clone()

  /**
   * This method make and return instance of helper class {@link ModelApply}
   *   that can filter and fill model properties.
   *
   *
   * This method typically uses in a {@link Model.constructor}.
   *
   * Example: {@link Model}
   */
  protected fill(data: any): ModelApply<M> {
    return new ModelApply(this, data);
  }

  // /**
  //  * Get class name
  //  *
  //  * Example:
  //  *
  //  *     class SuperUser extends Model<SuperUser> {}
  //  *
  //  *     expect(SuperUser.modelName).toEqual('SuperUser')
  //  */
  // public static get modelName(isKebabCase: false): string {
  //   let name = this.name;
  // } // end get modelName()

  // /**
  //  * Get entity name (kebab-case)
  //  * Warning: this is not works with ES5
  //  *
  //  * Example:
  //  *
  //  *     class SuperUser extends Model<SuperUser> {}
  //  *
  //  *     expect(SuperUser.entityName).toEqual('entity-name')
  //  */
  // public static get entityName(): string {
  //
  //   return this.name
  //              .replace(/\.?([A-Z])/g, function (x, y) {
  //                return '_' + y.toLowerCase()
  //              })
  //              .replace(/^_/, '');
  // } // end get entityName()
}

export type ModelConstructor<M extends Model<M>> = { new (data?: any): M };

// export interface ModelConstructor<M> {
//   new (data?: any): Model<M>;
//   // entityName: string;
// }
