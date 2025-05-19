import { errAsync as neverthrow_errAsync, okAsync as neverthrow_okAsync, ResultAsync as neverthrow_ResultAsync } from "neverthrow";

// Needed for Intellisense links
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Result, Ok, Err } from "./Result"

/**
 * `ResultAsync` allows you to work with asynchronous Results in a type safe way
 * 
 * `ResultAsync<T,E>` is a wrapper around `Promise<Result<T,E>>` which provides the same methods for chaining different
 * `Result` and `ResultAsync` together as {@link Result}, while also chaining the asynchronous operations together using
 * `Promise.then`.
 * 
 * `ResultAsync` is *thenable* (implements `PromiseLike<T>`) so can be used in most places that a `Promise` can, including with `await`.
 * 
 * Compatible with [`neverthrow`](https://github.com/supermacro/neverthrow)
 * 
 * @typeParam T - The type of the value contained in the `ResultAsync` for the success case
 * @typeParam E - The type of the error contained in the `ResultAsync` for the failure case
 */
export class ResultAsync<T,E> extends neverthrow_ResultAsync<T,E> {}

/**
 * Create an instance of `ResultAsync` containing an {@link Ok} variant of {@link Result}
 *
 * Equivalent to `new ResultAsync(Promise.resolve(new Ok(value)))`
 *
 * @typeParam T - The type of the value contained in the `ResultAsync` for the success case
 * @typeParam E - The type of the error contained in the `ResultAsync` for the failure case
 * @param value - The value to wrap in a `Result.Ok`.
 */
export function okAsync<T, E = never>(value: T): ResultAsync<T, E>
export function okAsync<_T extends void = void, E = never>(value: void): ResultAsync<void, E>
export function okAsync<T, E = never>(value: T): ResultAsync<T, E> {
  return neverthrow_okAsync(value);
}

/**
 * Create an instance of `ResultAsync` containing an {@link Err} variant of {@link Result}
 *
 * Equivalent to `new ResultAsync(Promise.resolve(new Err(err)))`
 *
 * @typeParam T - The type of the value contained in the `Result` for the success case
 * @typeParam E - The type of the error contained in the `Result` for the failure case
 * @param err - The value to wrap in a `Result.Err`.
 */
export function errAsync<T = never, E = unknown>(err: E): ResultAsync<T, E>
export function errAsync<T = never, _E extends void = void>(err: void): ResultAsync<T, void>
export function errAsync<T = never, E = unknown>(err: E): ResultAsync<T, E> {
  return neverthrow_errAsync<T,E>(err)
}
