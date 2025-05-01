import { validationError, infinisheetRangeError, storageError } from './Error'

it('validationError', () => {
  const error = validationError("test");
  expect(error.type).toEqual('ValidationError');
  expect(error.message).toEqual("test");
})

it('infinisheetRangeError', () => {
  const error = infinisheetRangeError("test");
  expect(error.type).toEqual('InfinisheetRangeError');
  expect(error.message).toEqual("test");
})

it('storageError', () => {
  const error = storageError("test", 501);
  expect(error.type).toEqual('StorageError');
  expect(error.message).toEqual("test");
  expect(error.statusCode).toEqual(501);
})
