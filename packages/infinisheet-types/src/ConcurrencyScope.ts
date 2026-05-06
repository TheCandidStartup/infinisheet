import { InfinisheetError, StorageError, ValidationError } from "./Error";
import { Result, ok, err } from "./Result"
import { ResultAsync, okAsync } from "./ResultAsync"

export type Task<T,E> = (scope: ConcurrencyScope) => Promise<Result<T,E>> | ResultAsync<T,E>

type InferPromiseLikeType<R> = R extends PromiseLike<infer T> ? T : never;
type InferOkTypes<R> = R extends Result<infer T, unknown> ? T : never;
type InferErrTypes<R> = [R] extends [Result<unknown, infer E>] ? E : never;
type InferPromiseOkTypes<R> = R extends Promise<Result<infer T, unknown>> ? T : never;
type InferPromiseErrTypes<R> = R extends Promise<Result<unknown, infer E>> ? E : never;

interface ConcurrencyScopeOptions {
  timeout: number;
}

export class ConcurrencyScope {
  constructor(parent: ConcurrencyScope | null, options?: ConcurrencyScopeOptions) {
    this.parent = parent;
    this.options = options;
    this.promises = [];
  }

  started<R extends ResultAsync<unknown,InfinisheetError>>(promise: R): R;
  started<R extends Promise<Result<unknown,InfinisheetError>>>(promise: R): R;
  started<R extends PromiseLike<Result<unknown,InfinisheetError>>>(promise: R): R;
  started<R extends PromiseLike<Result<unknown,InfinisheetError>>>(promise: R): R {
    this.promises.push(promise);
    return promise;
  }

  startSoon<R extends ResultAsync<unknown,InfinisheetError>>(task: (scope: ConcurrencyScope) => R): R;
  startSoon<R extends Promise<Result<unknown,InfinisheetError>>>(task: (scope: ConcurrencyScope) => R): R;
  startSoon<R extends PromiseLike<Result<unknown,InfinisheetError>>>(task: (scope: ConcurrencyScope) => R): R;
  startSoon<R extends PromiseLike<Result<unknown,InfinisheetError>>>(task: (scope: ConcurrencyScope) => R) {
    const ret = task(this);
    return this.started(ret);
  }

  cancel(): void {
  }

  async all(): Promise<void> {
    await Promise.all(this.promises);
  }
  
  async allSettled(): Promise<void> {
    await Promise.allSettled(this.promises);
  }

  async anyError(): Promise<Result<void,InfinisheetError>> {
    // Optimize: Only need to wait for first error, can then cancel the rest
    const results = await Promise.all(this.promises);
    for (const result of results) {
      if (result.isErr())
        return err(result.error);
    }
    return ok();
  }

  readonly parent: ConcurrencyScope | null;
  readonly options?: ConcurrencyScopeOptions | undefined;
  private promises: PromiseLike<Result<unknown,InfinisheetError>>[];
}

/*
export function withScope<R extends Promise<Result<unknown,unknown>>>(parentScope: ConcurrencyScope | null, 
  body: (scope: ConcurrencyScope) => R, options?: ConcurrencyScopeOptions): Promise<Result<InferPromiseOkTypes<R>, InferPromiseErrTypes<R>>>;
export function withScope<E extends InfinisheetError = InfinisheetError>(parentScope: ConcurrencyScope | null, 
  body: (scope: ConcurrencyScope) => void, options?: ConcurrencyScopeOptions):  Promise<Result<void,E>>;
export function withScope<R>(parentScope: ConcurrencyScope | null, 
  body: (scope: ConcurrencyScope) => R, options?: ConcurrencyScopeOptions): Promise<Result<unknown, unknown>>
{
  const scope = new ConcurrencyScope(options);
  const ret = body(scope);
  if (ret === undefined)
    return Promise.resolve(ok())
  else
    return scope.all().then((_) => ret as Promise<Result<unknown,unknown>>)
}*/

export function withScope<R extends PromiseLike<unknown>>(parentScope: ConcurrencyScope | null, 
  body: (scope: ConcurrencyScope) => R, options?: ConcurrencyScopeOptions): Promise<InferPromiseLikeType<R>>;
export async function withScope<R>(parentScope: ConcurrencyScope | null, 
  body: (scope: ConcurrencyScope) => R, options?: ConcurrencyScopeOptions): Promise<R>;
export async function withScope<R>(parentScope: ConcurrencyScope | null, 
  body: (scope: ConcurrencyScope) => R, options?: ConcurrencyScopeOptions): Promise<R>
{
  const scope = new ConcurrencyScope(parentScope, options);
  const ret = await body(scope);
  scope.cancel();
  await scope.allSettled();
  return ret;
}

export function withScopeAsync<R extends ResultAsync<unknown, unknown>>(parentScope: ConcurrencyScope | null, 
  body: (scope: ConcurrencyScope) => R, options?: ConcurrencyScopeOptions): R;
export function withScopeAsync<R extends Promise<Result<unknown, unknown>>>(parentScope: ConcurrencyScope | null, 
  body: (scope: ConcurrencyScope) => R, options?: ConcurrencyScopeOptions): ResultAsync<InferPromiseOkTypes<R>,InferPromiseErrTypes<R>>
export function withScopeAsync<R extends Result<unknown, unknown>>(parentScope: ConcurrencyScope | null, 
  body: (scope: ConcurrencyScope) => R, options?: ConcurrencyScopeOptions): ResultAsync<InferOkTypes<R>,InferErrTypes<R>>
export function withScopeAsync<R extends PromiseLike<Result<unknown, unknown>> | Result<unknown, unknown>>(parentScope: ConcurrencyScope | null, 
  body: (scope: ConcurrencyScope) => R, options?: ConcurrencyScopeOptions): ResultAsync<unknown,unknown>
{
  const scope = new ConcurrencyScope(parentScope, options);

  return new ResultAsync((async () => {
    const ret = await body(scope);
    scope.cancel();
    await scope.allSettled();
    return ret;
  })())
}

function myFunc(_scope: ConcurrencyScope): Promise<Result<number,ValidationError>> {
  return Promise.resolve(ok(3));
}

function myOtherFunc(_scope: ConcurrencyScope): ResultAsync<number,StorageError> {
  return okAsync(4);
}

export async function mainish() {
  await withScope(null, (scope) => {
    void scope.started(myFunc(scope));
    void scope.started(myOtherFunc(scope));
  })

  await withScope(null, (scope) => {
    void scope.startSoon(myFunc);
    void scope.startSoon(myOtherFunc);
  }, { timeout: 10000 })

  await withScope(null, (scope) => {
    void scope.startSoon(myFunc);
    void scope.startSoon(myOtherFunc);
  }, { timeout: 10000 })

  await withScope(null, async (scope: ConcurrencyScope) => {
      const ret = scope.startSoon(myFunc);
    const result = await scope.startSoon(myOtherFunc);
    if (result.isErr())
      return result;
    return await ret;
  }, { timeout: 10000 })

  await withScopeAsync(null, async (scope: ConcurrencyScope): Promise<Result<number,StorageError|ValidationError>> => {
      const ret = scope.startSoon(myFunc);
    const result = await scope.startSoon(myOtherFunc);
    if (result.isErr())
      return result;
    return await ret;
  }, { timeout: 10000 })

  await withScopeAsync(null, (_scope: ConcurrencyScope) => {
      return ok(3);
  }, { timeout: 10000 })

  await withScopeAsync(null, (_scope: ConcurrencyScope) => {
      return okAsync(3);
  }, { timeout: 10000 })
}