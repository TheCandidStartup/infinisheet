import { ConcurrencyScope, withScope, withScopeAsync } from "./ConcurrencyScope";
import { Result, ok } from "./Result";
import { ResultAsync, okAsync } from "./ResultAsync";
import { ValidationError, StorageError } from "./Error";

function myFunc(_scope: ConcurrencyScope): Promise<Result<number,ValidationError>> {
  return Promise.resolve(ok(3));
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
    })
  })

  it('promise', async () => {
    const ret = await withScope(null, (scope) => {
      return scope.started(myFunc(scope));
    })
    expect(ret).toBeOk();
    expect(ret._unsafeUnwrap()).toEqual(3);
  })

  it('resultAsync', async () => {
    const ret = await withScope(null, (scope) => {
      return scope.started(myOtherFunc(scope));
    })
    expect(ret).toBeOk();
    expect(ret._unsafeUnwrap()).toEqual(4);
  })

  it('result', async () => {
    const result: Result<number, ValidationError|StorageError> = await withScope(null, async (scope) => {
      const ret = scope.startSoon(myFunc);
      const result = await scope.startSoon(myOtherFunc);
      if (result.isErr())
        return result;
      return await ret;
    })
    expect(result).toBeOk();
    expect(result._unsafeUnwrap()).toEqual(3);
  })
})

describe('withScopeAsync', () => {
  it('promise', async () => {
    const ret = await withScopeAsync(null, (scope) => {
      return scope.started(myFunc(scope));
    })
    expect(ret).toBeOk();
    expect(ret._unsafeUnwrap()).toEqual(3);
  })

  it('resultAsync', async () => {
    const ret = await withScopeAsync(null, (scope) => {
      return scope.started(myOtherFunc(scope));
    })
    expect(ret).toBeOk();
    expect(ret._unsafeUnwrap()).toEqual(4);
  })

  it('result', async () => {
    const result = await withScopeAsync(null, async (scope): Promise<Result<number, ValidationError|StorageError>> => {
      const ret = scope.startSoon(myFunc);
      const result = await scope.startSoon(myOtherFunc);
      if (result.isErr())
        return result;
      return await ret;
    })
    expect(result).toBeOk();
    expect(result._unsafeUnwrap()).toEqual(3);
  })
})

