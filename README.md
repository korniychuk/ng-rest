# Ng Rest
Powerful and flexible angular REST client. Fully abstraction layer.

### How to use:
**Step 0.** Register services in `AppModule`. `src/app/app.module.ts`

```ts
// ...,
import { RequestService, RestRequestService } from 'ng-rest';

@NgModule({
  // ...,
  providers: [
    // ...,
    RequestService,
    RestRequestService,
  ],
  // ...,
})
class AppModule {
  // ...
}
```

**Step 1.** Make a model. For example `src/app/models/user.model.ts`
```ts
import { Model } from 'ng-rest';

class User extends Model<User> {
  public id: number;
  public name: string;
  public isAdmin: boolean;
  
  public constructor(data: any = {}) {
    super(data);
    
    this.fill(data)
        .number('id')
        .string('name')
        .boolean('isAdmin');
  }
}
```

**Step 2.** Make an api service. For example `src/app/core/api/user-api.service.ts`
```ts
import { Injectable, Injector } from '@angular/core';

import { AnyObject, StringObject } from 'typed-object-interfaces';
import { DefaultRestService, RestRequestService } from 'ng-rest';

import { User } from 'app/models/user.model';
import { config } from 'app/config';

/**
 * User Api Service
 */
@Injectable()
export class UserApiService extends DefaultRestService<User> {
  protected baseUrl    = `${config.apiBaseUrl}/users`;
  protected modelClass = User;

  public constructor(
    restRequest: RestRequestService,
  ) {
    super(restRequest);
  }

  /**
   * Rename fields that we want
   */
  protected fieldsMap(): StringObject {
    return {
      'is_admin':  'isAdmin',
      'user_name': 'name',
    };
  }
}
```

**Step 3.** Just use :)

```ts
// ...
imoprt { Entity } from 'ng-rest';

import { User } fom 'app/models/user.model.ts';
import { UserApiService } from 'app/core/api/user-api.service.ts';

// ...
class MyComponent implements OnInit {
    public constructor(
      private userApi: UserApiService,
    ) {}
    
    public ngOnInit() {
      let user = new User();
      
      user.name = 'Mike';
      user.isAdmin = false;
      
      this.userApi.create(user).subscribe((entity: Entity<User>) => {
        let savedUser: User = entity.data;
        
        console.log(savedUser.id); // is a number
        console.log(savedUser instanceof User); // true
      });
    }
}
```

### F.A.Q.

- **How to add token to every request?**  
  You need to do:
  - extend `RestRequestService` and override `beforeSend` method.
  - register in `AppModule` and inject into every your `*ApiService` your own `RestRequestService` instead of the service from `ng-rest`
  
  Example:
  ```ts
  import { Injectable } from '@angular/core';
  
  import {
    RestRequestData, RequestService,
    RestRequestService as RestRequestService_
  } from 'ng-rest';
  
  import { SessionService } from 'app/core/services/session.service';
  
  @Injectable()
  export class RestRequestService extends RestRequestService_ {
  
    public constructor(
      request: RequestService,
      private session: SessionService,
    ) {
      super(request);
    }
  
    protected beforeSend(data: RestRequestData): RestRequestData {
      const updatedData: RestRequestData = { ...data };
  
      if (!data.token && this.session.token) {
        updatedData.token = this.session.token;
      }
  
      return updatedData;
    }
  
  }
  ```

### Todo

- fix and add comments in the code
- write documentation
- configure trevis
- configure webpack
- make and commit a build

**Yarn Warning:** if you use `yarn` instead of the `npm`, please specify the exact version of the package.  
For example `1.0.0-beta.4.4` without any `^` or `~` at the start.
It is need because yarn incorrect work with `beta` sub-versions.
If you specify `^1.0.0-beta.4.0` then version `1.0.0.beta.1` will be installed. 
