import type { Ok as neverthrow_Ok, Err as neverthrow_Err } from "neverthrow";
import { err as neverthrow_err, ok as neverthrow_ok } from "neverthrow";

/**
 * An `Ok` instance is the *successful* variant of the {@link Result} type, 
 * representing a successful outcome from an operation which may fail.
 * 
 * Implemented using [`neverthrow`](https://github.com/supermacro/neverthrow)
 * 
 * @typeParam T - The type of the value contained in the `Result` for the success case
 * @typeParam E - The type of the error contained in the `Result` for the failure case
 */
export interface Ok<T,E> extends neverthrow_Ok<T,E> {}

/**
 * An `Err` instance is the failure variant of the {@link Result} type, 
 * representing a failure outcome from an operation which may fail.
 * 
 * Implemented using [`neverthrow`](https://github.com/supermacro/neverthrow)
 * 
 * @typeParam T - The type of the value contained in the `Result` for the success case
 * @typeParam E - The type of the error contained in the `Result` for the failure case
 */
export interface Err<T,E> extends neverthrow_Err<T,E> {}

/**
 * A `Result` represents success ({@link Ok}) or failure ({@link Err}).
 * 
 * Compatible with [`neverthrow`](https://github.com/supermacro/neverthrow)
 * 
 * @typeParam T - The type of the value contained in the `Result` for the success case
 * @typeParam E - The type of the error contained in the `Result` for the failure case
 */
export type Result<T,E> = Ok<T,E> | Err<T,E>;

/**
 * Create an instance of {@link Ok}.
 *
 * If you need to create an instance with a specific type (as you do whenever you
 * are not constructing immediately for a function return or as an argument to a
 * function), you can use a type parameter:
 *
 * ```ts
 * const yayNumber = ok<number, string>(12);
 * ```
 *
 * Note: passing nothing will produce a `Result<void, E>`, passing `undefined` will
 * produce a `Result<undefined, E>` which is compatible with `Result<void, E>`.
 *
 * ```ts
 * const normalResult = ok<number, string>(42);
 * const explicitUndefined = ok<undefined, string>(undefined);
 * const implicitVoid = ok<void, string>();
 * ```
 *
 * In the context of an immediate function return, or an arrow function with a
 * single expression value, you do not have to specify the types, so this can be
 * quite convenient.
 *
 * ```ts
 * const arrowValidate = (data: SomeData): Result<void, string> =>
 *   isValid(data) ? ok() : err('something was wrong!');
 *
 * function fnValidate(data: someData): Result<void, string> {
 *   return isValid(data) ? ok() : err('something was wrong');
 * }
 * ```
 *
 * @typeParam T - The type of the value contained in the `Result` for the success case
 * @typeParam E - The type of the error contained in the `Result` for the failure case
 * @param value - The value to wrap in a `Result.Ok`.
 */
export function ok<T, E = never>(value: T): Ok<T, E>
export function ok<_T extends void = void, E = never>(value: void): Ok<void, E>
export function ok<T, E = never>(value: T): Ok<T, E> {
  return neverthrow_ok<T,E>(value); 
}

/**
 * Create an instance of {@link Err}.
 *
 * If you need to create an instance with a specific type (as you do whenever you
 * are not constructing immediately for a function return or as an argument to a
 * function), you can use a type parameter:
 *
 * ```ts
 * const notString = err<number, string>('something went wrong');
 * ```
 *
 * Note: passing nothing will produce a `Result<T, void>`, passing `undefined` will
 * produce a `Result<T, undefined>` which is compatible with `Result<T, void>`.
 *
 * ```ts
 * const normalResult = err<number, string>('oh no');
 * const explicitUndefined = err<number, undefined>(undefined);
 * const implicitVoid = err<number, void>();
 * ```
 *
 * In the context of an immediate function return, or an arrow function with a
 * single expression value, you do not have to specify the types, so this can be
 * quite convenient.
 *
 * ```ts
 * const arrowValidate = (data: SomeData): Result<number, string> =>
 *   isValid(data) ? ok(42) : err('something went wrong');
 *
 * function fnValidate(data: someData): Result<number, string> {
 *   return isValid(data) ? ok(42) : err('something went wrong');
 * }
 * ```
 *
 * @typeParam T - The type of the value contained in the `Result` for the success case
 * @typeParam E - The type of the error contained in the `Result` for the failure case
 * @param err - The value to wrap in a `Result.Err`.
 */
export function err<T = never, E extends string = string>(err: E): Err<T, E>
export function err<T = never, E = unknown>(err: E): Err<T, E>
export function err<T = never, _E extends void = void>(err: void): Err<T, void>
export function err<T = never, E = unknown>(err: E): Err<T, E> {
  return neverthrow_err<T,E>(err)
}
