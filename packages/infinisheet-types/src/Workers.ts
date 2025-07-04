import type { SequenceId, WorkflowId } from "./EventLog";

export interface WorkerMessage {
  /** Used as a discriminated union tag by implementations */
  type: string;
}

export interface PendingWorkflowMessage {
  type: "PendingWorkflowMessage",

  /** Workflow requested */
  workflow: WorkflowId;

  /** Sequence id of log entry that requested workflow */
  sequenceId: SequenceId;
}

/** Type of handler function for {@link InfiniSheetWorker.onReceiveMessage} */
export type MessageHandler<MessageT extends WorkerMessage> = (message: MessageT) => void;

/** Base interface for all workers interfaces
 * 
 * Use `isWorker` to determine whether this is a worker, or a worker host.
 */
export interface WorkerBase<MessageT extends WorkerMessage> {
  isWorker(): this is InfiniSheetWorker<MessageT>;
}

export abstract class WorkerHost<MessageT extends WorkerMessage> implements WorkerBase<MessageT> { 
  isWorker(): this is InfiniSheetWorker<MessageT> { return false }
}

export abstract class PostMessageWorkerHost<MessageT extends WorkerMessage> extends WorkerHost<MessageT> {
  abstract postMessage(message: MessageT): void
}

export abstract class InfiniSheetWorker<MessageT extends WorkerMessage> implements WorkerBase<MessageT> {
  isWorker(): this is InfiniSheetWorker<MessageT> { return true }
  abstract onReceiveMessage: MessageHandler<MessageT> | undefined;
}
