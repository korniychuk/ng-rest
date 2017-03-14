import { ValidationErrors } from './validation-errors';

describe('REST Module: ValidationErrors class', () => {

  it('Should create instance and assign properties', () => {
    const errors = {
      email:    'invalid',
      password: 'fail',
    };
    const validationErrors = new ValidationErrors(errors);

    expect(validationErrors).toEqual(jasmine.objectContaining(errors));
  });

});
