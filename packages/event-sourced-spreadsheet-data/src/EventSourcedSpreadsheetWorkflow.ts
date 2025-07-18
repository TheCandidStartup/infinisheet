import { EventLog, BlobStore, PendingWorkflowMessage, InfiniSheetWorker, 
  ResultAsync, err, Result, InfinisheetError } from "@candidstartup/infinisheet-types";

import type { SpreadsheetLogEntry } from "./SpreadsheetLogEntry";
import { EventSourcedSpreadsheetEngine } from "./EventSourcedSpreadsheetEngine"

/**
 * Event sourced implementation of spreadsheet {@link EventLog} triggered workflows
 *
 */
export class EventSourcedSpreadsheetWorkflow  extends EventSourcedSpreadsheetEngine {
  constructor (eventLog: EventLog<SpreadsheetLogEntry>, blobStore: BlobStore<unknown>, worker: InfiniSheetWorker<PendingWorkflowMessage>) {
    super(eventLog, blobStore);

    this.worker = worker;

    worker.onReceiveMessage = (message: PendingWorkflowMessage) => this.onReceiveMessage(message);
  }

  protected notifyListeners(): void {}

  private onReceiveMessage(message: PendingWorkflowMessage): ResultAsync<void,InfinisheetError> {
    if (message.workflow !== 'snapshot')
      throw Error(`Unknown workflow ${message.workflow}`);

    return new ResultAsync(this.onReceiveMessageAsync(message));
  }

  private async onReceiveMessageAsync(message: PendingWorkflowMessage): Promise<Result<void,InfinisheetError>> {
    const endSequenceId = message.sequenceId + 1n;
    await this.syncLogsAsync(endSequenceId);
    if (this.content.loadStatus.isErr())
      return err(this.content.loadStatus.error);
    if (!this.content.loadStatus.value)
      throw Error("Somehow syncLogs() is still in progress despite promise having resolved");

    const logSegment = this.content.logSegment;
    const snapshotIndex = Number(endSequenceId - logSegment.startSequenceId);
    const blob = logSegment.cellMap.saveSnapshot(snapshotIndex);
    const name = message.sequenceId.toString();

    const dir = await this.blobStore.getRootDir();
    if (dir.isErr())
      return err(dir.error);

    const blobResult = await dir.value.writeBlob(name, blob);
    if (blobResult.isErr())
      return err(blobResult.error);

    return this.eventLog.setMetadata(message.sequenceId, { pending: undefined, snapshot: name });
  }

  protected worker: InfiniSheetWorker<PendingWorkflowMessage>;
}
