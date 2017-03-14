/**
 * This collection returns in list() request.
 * Feel free to extend this class for specific requests.
 */
export class Collection<M, P> {

  public get data(): M[] { return this._data; }
  public get pagination(): P { return this._pagination; }

  private _data: M[];
  private _pagination: P;

  public constructor(models: M[], pagination: P) {
    this._pagination = pagination;
    this._data       = models;

    if (this._data instanceof Array === false) {
      console.warn('Collection#constructor: models should be an array of Model instances:', models);
    }
  } // end constructor()

}

export interface CollectionConstructor<M, P> {
  new (models: M[], pagination: P): Collection<M, P>;
}
