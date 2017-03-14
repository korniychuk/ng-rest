import { Collection } from './collection';
import { Pagination } from './pagination';

class User {

  public constructor(public name: string) {
  }

}

describe('REST Module: Collection class', () => {
  let users: User[];

  beforeEach(() => {
    users = [ new User('tester') ];
  });

  it('Should set data via constructor and access via getter', () => {
    let collection = new Collection<User, Pagination>(users, {});

    expect(collection.data).toBe(users);
  });

  it('Should set pagination via constructor and access via getter', () => {
    const pagination = { page: 1 };
    const collection = new Collection<User, Pagination>(users, pagination);

    expect(collection.pagination).toBe(pagination);
  });

  it('Should to show warning if the data is not an array', () => {
    spyOn(console, 'warn');

    const data = { data: 13 };
    const model = new Collection<User, Pagination>(<any> data, {});

    expect(console.warn).toHaveBeenCalledWith(
      'Collection#constructor: models should be an array of Model instances:',
      data
    );
  });

});
