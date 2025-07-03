import type { PostMessageWorkerHost, InfiniSheetWorker, ResultAsync, 
  WorkerMessage, MessageError, MessageHandler } from "@candidstartup/infinisheet-types";
import { errAsync, storageError } from "@candidstartup/infinisheet-types";
import { delayResult } from "./DelayEventLog"

/**
 * Reference implementation of {@link InfiniSheetWorker}
 * 
 * In-process event loop based workers
 * 
 * Intended for use as a mock, to compare with an optimized implementation when testing and
 * for simple sample apps. Simplest possible implementation, no attempt at optimization.
 */
export class SimpleWorker<T extends WorkerMessage> implements InfiniSheetWorker<T> {
  constructor() {
  }

  isWorker(): this is InfiniSheetWorker<T> { return true; }
  hasPostMessage(): this is PostMessageWorkerHost<T> { return false; }

  onReceiveMessage: MessageHandler<T> | undefined;
}

/**
 * Reference implementation of {@link PostMessageWorkerHost}
 * 
 * In-process event loop based workers
 * 
 * Intended for use as a mock, to compare with an optimized implementation when testing and
 * for simple sample apps. Simplest possible implementation, no attempt at optimization.
 */
export class SimpleWorkerHost<T extends WorkerMessage> implements PostMessageWorkerHost<T> {
  constructor(worker: SimpleWorker<T>) {
    this.worker = worker;
  }

  isWorker(): this is InfiniSheetWorker<T> { return false }
  hasPostMessage(): this is PostMessageWorkerHost<T> { return true; }

  postMessage(message: T): ResultAsync<void,MessageError> {
    if (this.worker.onReceiveMessage) {
      // Using delayResult (wrapper around setTimeout) ensures message is delivered via the event loop
      return delayResult(this.worker.onReceiveMessage(message), 0);
    } else
      return errAsync(storageError("Worker has no message handler", 501));
  }

  private worker: SimpleWorker<T>;
}