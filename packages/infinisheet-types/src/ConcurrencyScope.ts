import { InfinisheetError, CancelError, TimeoutError, cancelError, timeoutError } from "./Error";
import { Result, ok, err } from "./Result"
import { ResultAsync } from "./ResultAsync"

export type Task<T,E> = (scope: ConcurrencyScope) => Promise<Result<T,E>> | ResultAsync<T,E>

export type InferPromiseLikeType<R> = R extends PromiseLike<infer T> ? T : never;
export type InferOkTypes<R> = R extends Result<infer T, unknown> ? T : never;
export type InferErrTypes<R> = R extends Result<unknown, infer E> ? E : never;
export type InferPromiseOkTypes<R> = R extends Promise<infer T> ? InferOkTypes<T> : never;
export type InferPromiseErrTypes<R> = R extends Promise<infer T> ? InferErrTypes<T> : never;

export interface ConcurrencyScopeOptions {
  timeout?: number | undefined;
  cancelOnExit?: boolean | undefined;
  newCancelScope?: boolean | undefined;
  newConcurrencyScope?: boolean | undefined;
}

function reasonToError(signal: AbortSignal): CancelError | TimeoutError {
  return (signal.reason?.name === 'TimeoutError') ? timeoutError() : cancelError();
}

// Not using AbortSignal.timeout because it isn't supported by fake-timers in unit tests
// As this is a tracer bullet doing the most expedient thing. Using my own functionally equivalent
// implementation based on setTimeout which fake timers does support.
// Long term switch back to AbortSignal.timeout for production use or enhance this to use
// a WeakRef so signal/controller can be GCed if nobody cares about timeout anymore, plus a
// finalization registry to clearTimeout if signal/controller GCed.
function abortSignalTimeout(delay: number) {
  const controller = new AbortController();
  setTimeout(() => controller.abort(new DOMException("Timed out!", "TimeoutError")), delay);
  return controller.signal;
}

export class ConcurrencyScope {
  constructor(parent: ConcurrencyScope | null, options: ConcurrencyScopeOptions = {}) {
    const { newCancelScope = true, newConcurrencyScope = true } = options;
    this.parent = parent;
    this.options = options;

    if (newConcurrencyScope || !parent) {
      this.ownPromises = true;
      this.promises = [];
    } else {
      this.ownPromises = false;
      this.promises = parent.promises;
    }

    if (newCancelScope || !parent) {
      this.abortController =  new AbortController();
      this.abortSignal = parent ? AbortSignal.any([this.abortController.signal, parent.abortController.signal]) : this.abortController.signal;
    } else {
      this.abortController = parent.abortController;
      this.abortSignal = parent.abortSignal;
    }

    if (options.timeout) {
      this.abortSignal = AbortSignal.any([this.abortSignal, abortSignalTimeout(options.timeout)]);
    }
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
    this.abortController.abort();
  }

  async all(): Promise<void> {
    if (this.ownPromises)
      await Promise.all(this.promises);
  }
  
  async allSettled(): Promise<void> {
    if (this.ownPromises)
      await Promise.allSettled(this.promises);
  }

  async anyError(): Promise<Result<void,InfinisheetError>> {
    if (this.ownPromises) {
      const results = await Promise.all(this.promises);
      for (const result of results) {
        if (result.isErr())
          return err(result.error);
      }
    }
    return ok();
  }

  sleep(delay: number): Promise<Result<void,CancelError|TimeoutError>> {
    const signal = this.abortSignal;

    return this.started(new Promise<Result<void,CancelError|TimeoutError>>((resolve) => {
      function onAbort() {
        clearTimeout(timerId);
        resolve(err(reasonToError(signal)));
      }

      signal.addEventListener("abort", onAbort, { once: true });

      const timerId = setTimeout(() => {
        signal.removeEventListener("abort", onAbort );
        resolve(ok());
      }, delay);
    }));
  }

  readonly parent: ConcurrencyScope | null;
  readonly options: ConcurrencyScopeOptions;
  private ownPromises: boolean;
  private promises: PromiseLike<Result<unknown,InfinisheetError>>[];
  private abortController: AbortController;
  private abortSignal: AbortSignal;
}

export function withScope<R extends PromiseLike<unknown>>(parentScope: ConcurrencyScope | null, 
  body: (scope: ConcurrencyScope) => R, options?: ConcurrencyScopeOptions): Promise<InferPromiseLikeType<R>>;
export async function withScope<R>(parentScope: ConcurrencyScope | null, 
  body: (scope: ConcurrencyScope) => R, options?: ConcurrencyScopeOptions): Promise<R>;
export async function withScope<R>(parentScope: ConcurrencyScope | null, 
  body: (scope: ConcurrencyScope) => R, options?: ConcurrencyScopeOptions): Promise<R>
{
  const scope = new ConcurrencyScope(parentScope, options);
  const { cancelOnExit = true } = scope.options;

  let completed = false;
  try {
    const ret = await body(scope);
    completed = true;
    return ret;
  } finally {
    if (cancelOnExit || !completed)
      scope.cancel();
    await scope.allSettled();
  }
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
  const { cancelOnExit = true } = scope.options;

  return new ResultAsync((async () => {
    const ret = await body(scope);
    if (cancelOnExit)
      scope.cancel();
    await scope.allSettled();
    return ret;
  })())
}

