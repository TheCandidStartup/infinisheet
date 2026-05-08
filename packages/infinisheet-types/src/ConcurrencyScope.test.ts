import { ConcurrencyScope, withScope, withScopeAsync } from "./ConcurrencyScope";
import { Result, ok, err } from "./Result";
import { ResultAsync, okAsync } from "./ResultAsync";
import { ValidationError, StorageError, validationError } from "./Error";

function myFunc(_scope: ConcurrencyScope): Promise<Result<boolean,ValidationError>> {
  return Promise.resolve(ok(true));
}

function myOtherFunc(_scope: ConcurrencyScope): ResultAsync<number,StorageError> {
  return okAsync(4);
}

describe('ConcurrencyScope', () => {
  it('should construct', () => {
    const scope = new ConcurrencyScope(null);
    expect(scope.parent).toEqual(null);
  })
})

describe('withScope', () => {
  it('void', async () => {
    await withScope(null, (scope) => {
      void scope.started(myFunc(scope));
      void scope.started(myOtherFunc(scope));
    }, { cancelOnExit: false })
  })

  it('promise', async () => {
    const ret: Result<boolean, ValidationError> = await withScope(null, (scope) => {
      return scope.started(myFunc(scope));
    })
    expect(ret._unsafeUnwrap()).toEqual(true);
  })

  it('resultAsync', async () => {
    const ret = await withScope(null, (scope) => {
      return scope.started(myOtherFunc(scope));
    })
    expect(ret._unsafeUnwrap()).toEqual(4);
  })

  it('infer mixed types', async () => {
    const result: Result<number|boolean, ValidationError|StorageError> = await withScope(null, async (scope) => {
      const ret = scope.startSoon(myFunc);
      const result = await scope.startSoon(myOtherFunc);
      if (result.isErr())
        return result;
      return await ret;
    })
    expect(result._unsafeUnwrap()).toEqual(true);
  })
})

describe('withScopeAsync', () => {
  it('promise', async () => {
    const ret: Result<boolean, ValidationError> = await withScopeAsync(null, (scope) => {
      return scope.started(myFunc(scope));
    })
    expect(ret._unsafeUnwrap()).toEqual(true);
  })

  it('resultAsync', async () => {
    const ret: Result<number, StorageError> = await withScopeAsync(null, (scope) => {
      return scope.started(myOtherFunc(scope));
    })
    expect(ret._unsafeUnwrap()).toEqual(4);
  })

  it('result err', async () => {
    const ret: Result<number,ValidationError> = await withScopeAsync(null, (_scope) => {
      return err<number,ValidationError>(validationError("fail"));
    })
    expect(ret._unsafeUnwrapErr()).toEqual(validationError("fail"));
  })

    it('result ok', async () => {
    const ret: Result<number,ValidationError> = await withScopeAsync(null, (_scope) => {
      return ok<number,ValidationError>(3);
    })
    expect(ret._unsafeUnwrap()).toEqual(3);
  })

  it('infer mixed types', async () => {
    const result: Result<number | boolean, StorageError | ValidationError> = await withScopeAsync(null, async (scope) => {
      const ret = scope.startSoon(myFunc);
      const result = await scope.startSoon(myOtherFunc);
      if (result.isErr())
        return result;
      return await ret;
    })
    expect(result._unsafeUnwrap()).toEqual(true);
  })
})

