import type { WorkerMessage, MessageHandler } from "@candidstartup/infinisheet-types";
import { InfiniSheetWorker, PostMessageWorkerHost } from "@candidstartup/infinisheet-types";

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

  /** @internal */
  isHost(): this is PostMessageWorkerHost<T> { return true; }

  postMessage(message: T): void {
    const handler = this.worker.onReceiveMessage;
    if (handler) {
      // Using setTimeout ensures message is delivered via the event loop
      setTimeout(() => { 
        const result = handler(message);
        result.orTee((error) => {
          console.log(`SimpleWorker returned error ${JSON.stringify(error)}`);
          throw Error("SimpleWorker returned error", { cause: error });
        })
      }, 0);
    } else {
      throw Error("Worker has no message handler");
    }
  }

  private worker: SimpleWorker<T>;
}
