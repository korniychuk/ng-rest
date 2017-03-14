import { Response } from '@angular/http';

export class ResponseError {
  public status: number;
  public data: any;

  protected _raw: Response | any;
  protected _msg: string;

  public constructor(res: Response | any, msg) {
    if (res instanceof Response) {
      this.status = +res.status;
      this.data = res.json();
    } else {
      this.status = 0;
      this.data = res;
    }

    Object.defineProperties(this, {
      _raw: {
        value: res,
      },
      _msg: {
        value: msg,
      },
    });
  } // end constructor()

  public msg(): string {
    return this._msg;
  } // end msg()

  public raw(): Response | any {
    return this._raw;
  } // end raw()

}
