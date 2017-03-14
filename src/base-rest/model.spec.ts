import { Model } from './model';
import { ModelApply } from './model-apply';

class TestUser extends Model<TestUser> {
  public id: number;
  public name: string;

  public initExecuted: boolean;

  public constructor(data: any = {}) {
    super(data);

    this.id   = +data.id || null;
    this.name = data.name || null;
  } // end constructor()

  public init(): void {
    this.initExecuted = true;
  } // end ini()

}

describe('REST Module: Model class', () => {

  it('Init method should be called from constructor', () => {
    let user = new TestUser();

    expect(user.initExecuted).toBeTruthy();
  });
  //
  // it('Test getting entity name', () => {
  //   let user = new TestUser();
  //
  //   // expect(TestUser.entityName).toEqual('test-user');
  //   // expect(user.constructor['entityName']).toEqual('test-user');
  // });

  it('Clone method', () => {
    let user1 = new TestUser();
    let user2 = new TestUser({ name: 'Petro' });

    expect(user1).toEqual(jasmine.any(TestUser));
    expect(user1).toBeTruthy();
    expect(user2.name).toEqual('Petro');
    expect(user2.id).toBeNull();

    let clone1 = user2.clone();
    let clone2 = user2.clone({ id: 2 });
    let clone3 = user2.clone({ name: 'Ivan', id: 3 });

    expect(clone1).not.toBe(user2);
    expect(clone1).toEqual(user2);
    expect(clone2.name).toEqual(user2.name);
    expect(clone3.name).toBe('Ivan');
    expect(clone3.id).toBe(3);
  });

  it('fill() method should return instance of ModelApply', () => {
    const user = new TestUser();
    const ma   = user['fill']({});

    expect(ma instanceof ModelApply).toBeTruthy();
  });

});
