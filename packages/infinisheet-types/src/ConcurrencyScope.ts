import { InfinisheetError } from "./Error";
import { Result, ok, err } from "./Result"
import { ResultAsync } from "./ResultAsync"

export type Task<T,E> = (scope: ConcurrencyScope) => Promise<Result<T,E>> | ResultAsync<T,E>

export type InferPromiseLikeType<R> = R extends PromiseLike<infer T> ? T : never;
export type InferOkTypes<R> = R extends Result<infer T, unknown> ? T : never;
export type InferErrTypes<R> = [R] extends [Result<unknown, infer E>] ? E : never;
export type InferPromiseOkTypes<R> = R extends Promise<Result<infer T, unknown>> ? T : never;
export type InferPromiseErrTypes<R> = R extends Promise<Result<unknown, infer E>> ? E : never;

export interface ConcurrencyScopeOptions {
  timeout?: number | undefined;
  noCancelOnExit?: boolean | undefined;
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
  startSoon<R extends PromiseLike<Result<unknown,InfinisheetError>>>(task: (scope: ConcurrencyScope) => R): R {
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

export function withScope<R extends PromiseLike<unknown>>(parentScope: ConcurrencyScope | null, 
  body: (scope: ConcurrencyScope) => R, options?: ConcurrencyScopeOptions): Promise<InferPromiseLikeType<R>>;
export async function withScope<R>(parentScope: ConcurrencyScope | null, 
  body: (scope: ConcurrencyScope) => R, options?: ConcurrencyScopeOptions): Promise<R>;
export async function withScope<R>(parentScope: ConcurrencyScope | null, 
  body: (scope: ConcurrencyScope) => R, options?: ConcurrencyScopeOptions): Promise<R>
{
  const scope = new ConcurrencyScope(parentScope, options);
  const ret = await body(scope);
  if (!options?.noCancelOnExit)
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
    if (!options?.noCancelOnExit)
      scope.cancel();
    await scope.allSettled();
    return ret;
  })())
}

