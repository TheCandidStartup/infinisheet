import { ResultAsync } from "./ResultAsync";
import { StorageError } from "./Error"

export interface WorkerMessage {
  /** Used as a discriminated union tag by implementations */
  type: string;
}

/** Errors that can be returned by {@link PostMessageWorkerHost.postMessage}  */
export type MessageError = StorageError;

/** Type of handler function for {@link InfiniSheetWorker.onReceiveMessage} */
export type MessageHandler<MessageT extends WorkerMessage> = (message: MessageT) => ResultAsync<void,MessageError>;

/** Base interface for all workers interfaces
 * 
 * Use `isWorker` and `hasPostMessage` to determine whether this is a worker, an implicit worker host or 
 * a worker host with an explicit `postMessage` method.
 */
export interface WorkerBase<MessageT extends WorkerMessage> {
  isWorker(): this is InfiniSheetWorker<MessageT>;
  hasPostMessage(): this is PostMessageWorkerHost<MessageT>;
}

export abstract class WorkerHost<MessageT extends WorkerMessage> implements WorkerBase<MessageT> { 
  isWorker(): this is InfiniSheetWorker<MessageT> { return false }
  abstract hasPostMessage(): this is PostMessageWorkerHost<MessageT>;
}

export abstract class PostMessageWorkerHost<MessageT extends WorkerMessage> extends WorkerHost<MessageT> {
  hasPostMessage(): this is PostMessageWorkerHost<MessageT> { return true }
  abstract postMessage(message: MessageT): ResultAsync<void,MessageError>
}

export abstract class InfiniSheetWorker<MessageT extends WorkerMessage> implements WorkerBase<MessageT> {
  isWorker(): this is InfiniSheetWorker<MessageT> { return true }
  hasPostMessage(): this is PostMessageWorkerHost<MessageT> { return false }
  abstract onReceiveMessage: MessageHandler<MessageT> | undefined;
}
