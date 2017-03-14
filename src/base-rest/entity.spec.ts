import { Entity } from './entity';

class User {
  public constructor(public name: string) {
  }
}

describe('REST Module: Entity class', () => {
  let model: User;

  beforeEach(() => {
    model = new User('test');
  });

  it('Should create an instance and data property for valid model name', () => {
    const entity = new Entity<User>(model);

    expect(entity.data).toBe(model);
  });

});
