import { Static, TSchema } from '@sinclair/typebox';
import Ajv from 'ajv';

class ValidationError extends Error {
  // see parent
}

export default function assertType<T extends TSchema>(
  type: T,
  payload: unknown,
): asserts payload is Static<typeof type> {
  const ajv = new Ajv().addKeyword('kind').addKeyword('modifier');
  const validate = ajv.compile(type);
  if (!validate(payload)) {
    throw new ValidationError(
      'error while validating payload: ' + JSON.stringify(validate.errors) + ' payload: ' + JSON.stringify(payload),
    );
  }
}
