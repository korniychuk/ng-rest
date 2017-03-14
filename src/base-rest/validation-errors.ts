import { StringObject } from '../../helpers/typed-object';

export class ValidationErrors implements StringObject {
  [name: string]: string;

  public constructor(errors: StringObject) {
    Object.assign(this, errors);
  } // end constructor()

}
