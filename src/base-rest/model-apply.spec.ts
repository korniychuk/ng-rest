/* tslint:disable:max-line-length */
import { Model } from './model';
import { ModelApply } from './model-apply';

describe('REST Module: ModelApply class', () => {
  let model: Model<any>;

  beforeEach(() => {
    model = <any> {};
  });

  it('Method create instance and save model and data objects as non-enumerable', () => {
    const ma = new ModelApply<any>(model, {});

    expect(Object.keys(ma).length).toEqual(0);
  });

  it('Method empty() should write null in the field for null|undefined and call valueFunc for other', () => {
    const ma = new ModelApply<any>(model, {
      value1: null,
      value2: undefined,
      value3: '',
      value4: 0,
      value5: false,
      value6: 'val',
      // value7 is not set
    });

    ma.empty('value1', (v) => v)
      .empty('value2', (v) => v)
      .empty('value3', (v) => v)
      .empty('value4', (v) => v)
      .empty('value5', (v) => v)
      .empty('value6', (v) => v)
      .empty('value7', (v) => v);

    expect(model['value1']).toBeNull();
    expect(model['value2']).toBeNull();
    expect(model['value7']).toBeNull();
    expect(model['value3']).toBe('');
    expect(model['value4']).toBe(0);
    expect(model['value5']).toBe(false);
    expect(model['value6']).toBe('val');
  });

  it('Method boolean() should convert value to boolean', () => {
    const ma = new ModelApply(model, {
      value1: true,
      value2: 1,
      value3: 0,
    });

    ma.boolean('value1')
      .boolean('value2')
      .boolean('value3');

    expect(model['value1']).toBe(true);
    expect(model['value2']).toBe(true);
    expect(model['value3']).toBe(false);
  });

  it('Method string() should convert value to string', () => {
    const ma = new ModelApply(model, {
      value1: 'asdf',
      value2: 1234,
    });

    ma.string('value1')
      .string('value2');

    expect(model['value1']).toBe('asdf');
    expect(model['value2']).toBe('1234');
  });

  it('Method number() should convert value to number', () => {
    const ma = new ModelApply(model, {
      value1: '1234',
      value2: 2345,
    });

    ma.number('value1')
      .number('value2');

    expect(model['value1']).toBe(1234);
    expect(model['value2']).toBe(2345);
  });

  it('Method model() should clone model', () => {
    class User extends Model<User> {
      public name: string;

      public constructor(data: any = {}) {
        super();
        this.name = data.name;
      }

    }

    const user = new User({ name: 'test' });
    const ma = new ModelApply(model, {
      value1: user,
      value2: 123,
    });

    ma.model('value1');
    ma.model('value2');

    expect(model['value1'] instanceof Model).toBeTruthy();
    expect(model['value1'] === user).toBeFalsy();
    expect(model['value1'].name).toBe('test');
    expect(model['value2']).toBeNull();
  });

  it('Method date() should clone date', () => {
    const date = new Date();
    const ma = new ModelApply(model, {
      value1: date,
      value2: 123,
    });

    ma.date('value1');
    ma.date('value2');

    expect(model['value1'] instanceof Date).toBeTruthy();
    expect(model['value1'] === date).toBeFalsy();
    expect(+model['value1']).toBe(+date);
    expect(model['value2']).toBeNull();
  });

  it('Method array() should  make clone of the array', () => {
    const arr = [ 1, 2, 3 ];
    const ma = new ModelApply(model, {
      value1: arr,
      value2: 123,
    });

    ma.array('value1');
    ma.array('value2');

    expect(model['value1'] instanceof Array).toBeTruthy();
    expect(model['value1'] === arr).toBeFalsy();
    expect(model['value1']).toEqual(arr);
    expect(model['value2']).toBeNull();
  });

});
