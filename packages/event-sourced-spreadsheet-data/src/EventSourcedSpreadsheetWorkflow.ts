import type { EventLog, BlobStore, PendingWorkflowMessage, InfiniSheetWorker} from "@candidstartup/infinisheet-types";

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

    worker.onReceiveMessage = (message: PendingWorkflowMessage) => { this.onReceiveMessage(message); }
  }

  protected notifyListeners(): void {}

  private onReceiveMessage(_message: PendingWorkflowMessage): void {
  }

  protected worker: InfiniSheetWorker<PendingWorkflowMessage>;
}
