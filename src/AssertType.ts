import Ajv from 'ajv';
import { Static } from '@sinclair/typebox';

class ValidationError extends Error {
  // see parent
}

export default function assertType<T extends Record<string, unknown>>(
  type: T,
  payload: unknown,
): asserts payload is Static<typeof type> {
  const ajv = new Ajv().addKeyword('kind').addKeyword('modifier');
  if (!ajv.validate(type, payload)) {
    throw new ValidationError(
      'error while validating payload: '
        + ajv.errors?.map((error) => error.message).join(', ')
        + ' payload: '
        + JSON.stringify(payload),
    );
  }
}
