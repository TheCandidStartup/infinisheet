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

export interface WorkerHost<MessageT extends WorkerMessage> { 
  /** 
   * Place holder until we have some real implementation. Need something concrete
   * to stop TypeScript moaning about the unused generic parameter and implementations
   * without any properties in common with the interface they're implementing. 
   * @internal 
   */
  isHost(): this is WorkerHost<MessageT>
}

export interface PostMessageWorkerHost<MessageT extends WorkerMessage> extends WorkerHost<MessageT> {
  postMessage(message: MessageT): void
}

export interface InfiniSheetWorker<MessageT extends WorkerMessage> {
  onReceiveMessage: MessageHandler<MessageT> | undefined;
}
