import { Model } from './model';

/**
 * Model Helper class for filling model properties.
 * Using in the {@link Model.fill}
 */
export class ModelApply<M> {
  private _model: Model<M>;
  private _data: any;

  public constructor(model: Model<M>, data: any) {
    Object.defineProperties(this, {
      _model: {
        value:        model,
        configurable: true,
        writable:     true,
      },
      _data:  {
        value:        data,
        configurable: true,
        writable:     true,
      },
    });
  } // end constructor()

  public empty(name: string, valueFunc: { (value: any): any }): ModelApply<M> {
    const value         = this._data[ name ];
    this._model[ name ] = value === undefined || value === null ? null : valueFunc(value);

    return this;
  }

  public boolean(name: string): ModelApply<M> {
    return this.empty(name, Boolean);
  }

  public string(name: string): ModelApply<M> {
    return this.empty(name, String);
  }

  public number(name: string): ModelApply<M> {
    return this.empty(name, Number);
  }

  public model(name: string): ModelApply<M> {
    return this.empty(name, (model: Model<any> | any) => {
      return model instanceof Model ? model.clone() : null;
    });
  }

  /**
   * Make clone of an {@link Date} object
   */
  public date(name: string): ModelApply<M> {
    return this.empty(name, (date: Date | any) => {
      return date instanceof Date ? new Date(date) : null;
    });
  }

  /**
   * Clone array without deep clone
   */
  public array(name: string): ModelApply<M> {
    return this.empty(name, (array: any[] | any) => {
      return array instanceof Array ? array.concat() : null;
    });
  }

  // public object(name: string): ModelApply<M> {
  //   return this.empty(name, (obj: any) => {
  //     if (obj instanceof Object) {
  //       const Constructor: { new(...args: any[]): any } = Object.getPrototypeOf(obj).constructor;
  //       let clone = new ();
  //     } else {
  //       return null;
  //     }
  //   });
  // }

}
