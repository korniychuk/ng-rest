/**
 * Wrapper for model. Instance of this class will be returned from view() request.
 * Feel free to extend this class for specific requests.
 */
export class Entity<M> {

  public get data(): M { return this._data; }

  private _data: M;

  public constructor(model: M) {
    this._data = model;
  }

}

export interface EntityConstructor<M> {
  new (model: M): Entity<M>;
}
