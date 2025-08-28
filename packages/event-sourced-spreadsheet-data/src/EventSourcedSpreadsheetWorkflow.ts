import { EventLog, BlobStore, PendingWorkflowMessage, InfiniSheetWorker, 
  ResultAsync, err, Result, InfinisheetError } from "@candidstartup/infinisheet-types";

import type { SpreadsheetLogEntry } from "./SpreadsheetLogEntry";
import { EventSourcedSpreadsheetEngine } from "./EventSourcedSpreadsheetEngine"
import { openSnapshot } from "./SpreadsheetSnapshot";

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
    const endSequenceId = message.sequenceId;
    await this.syncLogsAsync(endSequenceId);
    if (this.content.logLoadStatus.isErr())
      return err(this.content.logLoadStatus.error);
    if (this.content.mapLoadStatus.isErr())
      return err(this.content.mapLoadStatus.error);
    if (!this.content.logLoadStatus.value)
      throw Error("Somehow syncLogs() is still in progress despite promise having resolved");

    const { logSegment, cellMap } = this.content;
    const snapshotIndex = Number(endSequenceId - logSegment.startSequenceId);
    const blob = cellMap.saveSnapshot(snapshotIndex);
    const name = message.sequenceId.toString();

    const dir = await this.blobStore.getRootDir();
    if (dir.isErr())
      return err(dir.error);

    const snapshotResult = await openSnapshot(dir.value, name);
    if (snapshotResult.isErr())
      return err(snapshotResult.error);
    const snapshot = snapshotResult.value;

    const blobResult = await snapshot.saveTile(0, 0, this.content.rowCount, this.content.colCount, blob);
    if (blobResult.isErr())
      return err(blobResult.error);

    const indexResult = await snapshot.saveIndex();
    if (indexResult.isErr())
      return err(indexResult.error);

    return this.eventLog.setMetadata(message.sequenceId, { pending: undefined, snapshot: name });
  }

  protected worker: InfiniSheetWorker<PendingWorkflowMessage>;
}
