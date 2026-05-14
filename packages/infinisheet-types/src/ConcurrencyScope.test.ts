import { ConcurrencyScope, withScope, withScopeAsync } from "./ConcurrencyScope";
import { Result, ok, err } from "./Result";
import { ResultAsync, okAsync } from "./ResultAsync";
import { ValidationError, StorageError, validationError, cancelError, timeoutError } from "./Error";

function myFunc(_scope: ConcurrencyScope): Promise<Result<boolean,ValidationError>> {
  return Promise.resolve(ok(true));
}

function myOtherFunc(_scope: ConcurrencyScope): ResultAsync<number,StorageError> {
  return okAsync(4);
}

async function isPendingPromise(promise: Promise<unknown>) {
  const pending = {};

  // Standard idiom for determining status of a promise. Works because pending
  // is not a promise so race returns pending immediately if promise hasn't settled.
  // eslint-disable-next-line
  const ret = await Promise.race([promise,pending]);
  return ret === pending;
}

describe('ConcurrencyScope', () => {
  afterEach(() => {
    vi.useRealTimers();
  })

  it('should construct', () => {
    const scope = new ConcurrencyScope(null);
    expect(scope.parent).toEqual(null);
  })

  it('sleep', async () => {
    vi.useFakeTimers();
    const scope = new ConcurrencyScope(null);
    const promise = scope.sleep(100);
    expect(await isPendingPromise(promise)).toEqual(true);
    const now = Date.now();

    await vi.runAllTimersAsync();
    expect(await isPendingPromise(promise)).toEqual(false);
    const elapsed = Date.now() - now;
    expect(elapsed).toEqual(100);
    const result = await promise;
    expect(result).toBeOk();
  })

  it('cancel sleep', async () => {
    vi.useFakeTimers();
    const scope = new ConcurrencyScope(null);
    const promise = scope.sleep(100);
    const now = Date.now();

    scope.cancel();
    await vi.runAllTimersAsync();
    expect((await scope.anyError())._unsafeUnwrapErr()).toEqual(cancelError());
    expect(await isPendingPromise(promise)).toEqual(false);
    const elapsed = Date.now() - now;
    expect(elapsed).toEqual(0);
    const result = await promise;
    expect(result._unsafeUnwrapErr()).toEqual(cancelError());
  })

  it('timeout sleep', async () => {
    vi.useFakeTimers();
    const scope = new ConcurrencyScope(null, { timeout: 50 });
    const promise = scope.sleep(100);
    const now = Date.now();
    await vi.runAllTimersAsync();
    expect(await isPendingPromise(promise)).toEqual(false);
    const elapsed = Date.now() - now;
    expect(elapsed).toEqual(50);
    const result = await promise;
    expect(result._unsafeUnwrapErr()).toEqual(timeoutError());
  })
})

describe('withScope', () => {
  afterEach(() => {
    vi.useRealTimers();
  })

  it('void', async () => {
    await withScope(null, (scope) => {
      void scope.started(myFunc(scope));
      void scope.started(myOtherFunc(scope));
    }, { cancelOnExit: false })
  })

  it('rejected', async () => {
    vi.useFakeTimers();
    const now = Date.now();

    await expect(withScope(null, (scope) => {
      void scope.started(myFunc(scope));
      void scope.sleep(100);
      throw Error("thrown");
    }, { cancelOnExit: false })).rejects.toThrow(Error("thrown"));

    // If unexpected error everything else should be canceled regardless of options
    await vi.runAllTimersAsync();
    const elapsed = Date.now() - now;
    expect(elapsed).toEqual(0);
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
  afterEach(() => {
    vi.useRealTimers();
  })
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

