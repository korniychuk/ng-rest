import { StringObject } from 'typed-object-interfaces';

export class ValidationErrors implements StringObject {
  [name: string]: string;

  public constructor(errors: StringObject) {
    Object.assign(this, errors);
  } // end constructor()

}
