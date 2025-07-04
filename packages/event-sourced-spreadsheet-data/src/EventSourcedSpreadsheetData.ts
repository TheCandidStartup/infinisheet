import type { CellValue, SpreadsheetData, ItemOffsetMapping, Result, ResultAsync, StorageError, 
  SpreadsheetDataError, ValidationError, SequenceId, BlobId, EventLog, 
  BlobStore, WorkerBase, PendingWorkflowMessage } from "@candidstartup/infinisheet-types";
import { FixedSizeItemOffsetMapping, ok, err, storageError } from "@candidstartup/infinisheet-types";

import type { SpreadsheetLogEntry, SetCellValueAndFormatLogEntry } from "./SpreadsheetLogEntry";

const EVENT_LOG_CHECK_DELAY = 10000;

interface LogSegment {
  startSequenceId: SequenceId;
  entries: SpreadsheetLogEntry[];
  snapshot?: BlobId | undefined;
}

interface EventSourcedSnapshotContent {
  endSequenceId: SequenceId;
  logSegment: LogSegment;
  loadStatus: Result<boolean,StorageError>;
  rowCount: number;
  colCount: number;
}

/** 
 * Branding Enum. Used by {@link EventSourcedSnapshot} to ensure that
 * you'll get a type error if you pass some random object where a `EventSourcedSnapshot`
 * is expected.
 * @internal
 */
export enum _EventSourcedSnapshotBrand { _DO_NOT_USE="" };

/**
 * Opaque type representing an {@link EventSourcedSpreadsheetData} snapshot. All the
 * internal implementation details are hidden from the exported API.
 */
export interface EventSourcedSnapshot {
  /** @internal */
  _brand: _EventSourcedSnapshotBrand;
}

const rowItemOffsetMapping = new FixedSizeItemOffsetMapping(30);
const columnItemOffsetMapping = new FixedSizeItemOffsetMapping(100);

function asContent(snapshot: EventSourcedSnapshot) {
  return snapshot as unknown as EventSourcedSnapshotContent;
}

function asSnapshot(snapshot: EventSourcedSnapshotContent) {
  return snapshot as unknown as EventSourcedSnapshot;
}

/**
 * Event sourced implementation of {@link SpreadsheetData}
 *
 */
export class EventSourcedSpreadsheetData implements SpreadsheetData<EventSourcedSnapshot> {
  constructor (eventLog: EventLog<SpreadsheetLogEntry>, blobStore: BlobStore<unknown>, workerOrHost?: WorkerBase<PendingWorkflowMessage>) {
    this.intervalId = undefined;
    this.isInSyncLogs = false;
    this.eventLog = eventLog;
    this.blobStore = blobStore;
    this.workerOrHost = workerOrHost;
    this.listeners = [];
    this.content = {
      endSequenceId: 0n,
      logSegment: { startSequenceId: 0n, entries: [] },
      loadStatus: ok(false),
      rowCount: 0,
      colCount: 0
    }

    if (workerOrHost?.isWorker()) {
      workerOrHost.onReceiveMessage = (message: PendingWorkflowMessage) => { this.onReceiveMessage(message); }
    } else {
      this.syncLogs();
    }
  }

  subscribe(onDataChange: () => void): () => void {
    if (!this.intervalId)
      this.intervalId = setInterval(() => { this.syncLogs() }, EVENT_LOG_CHECK_DELAY);
    this.listeners = [...this.listeners, onDataChange];
    return () => {
      this.listeners = this.listeners.filter(l => l !== onDataChange);
      if (this.listeners.length == 0 && this.intervalId !== undefined) {
        clearInterval(this.intervalId);
        this.intervalId = undefined;
      }
    }
  }

  getSnapshot(): EventSourcedSnapshot {
    return asSnapshot(this.content);
  }

  getLoadStatus(snapshot: EventSourcedSnapshot): Result<boolean,StorageError> {
    return asContent(snapshot).loadStatus;
  }

  getRowCount(snapshot: EventSourcedSnapshot): number {
    return asContent(snapshot).rowCount;
  }

  getRowItemOffsetMapping(_snapshot: EventSourcedSnapshot): ItemOffsetMapping {
    return rowItemOffsetMapping;
  }

  getColumnCount(snapshot: EventSourcedSnapshot): number {
    return asContent(snapshot).colCount;
  }

  getColumnItemOffsetMapping(_snapshot: EventSourcedSnapshot): ItemOffsetMapping {
    return columnItemOffsetMapping
  }

  getCellValue(snapshot: EventSourcedSnapshot, row: number, column: number): CellValue {
    const entry = this.getCellValueAndFormatEntry(snapshot, row, column);
    return entry?.value;
  }

  getCellFormat(snapshot: EventSourcedSnapshot, row: number, column: number): string | undefined {
    const entry = this.getCellValueAndFormatEntry(snapshot, row, column);
    return entry?.format;
  }

  setCellValueAndFormat(row: number, column: number, value: CellValue, format: string | undefined): ResultAsync<void,SpreadsheetDataError> {
    const curr = this.content;

    const result = this.eventLog.addEntry({ type: 'SetCellValueAndFormat', row, column, value, format }, curr.endSequenceId);
    return result.andTee(() => {
      if (this.content == curr) {
        // Nothing else has updated local copy (no async load has snuck in), so safe to do it myself avoiding round trip with event log
        curr.logSegment.entries.push({ type: 'SetCellValueAndFormat', row, column, value, format});

        // Snapshot semantics preserved by treating EventSourcedSnapshot as an immutable data structure which is 
        // replaced with a modified copy on every update.
        this.content = {
          endSequenceId: curr.endSequenceId + 1n,
          logSegment: curr.logSegment,
          loadStatus: ok(true),
          rowCount: Math.max(curr.rowCount, row+1),
          colCount: Math.max(curr.colCount, column+1)
        }

        this.notifyListeners();
      }
    }).mapErr((err): SpreadsheetDataError => {
      switch (err.type) {
        case 'ConflictError':
          if (this.content == curr) {
            // Out of date wrt to event log, nothing else has updated content since then, so set
            // status for in progress load and trigger sync.
            this.content = { ...curr, loadStatus: ok(false) }
            this.syncLogs();
          }
          return storageError("Client out of sync", 409);
        case 'StorageError': 
          return err;
      }
    });
  }

  isValidCellValueAndFormat(_row: number, _column: number, _value: CellValue, _format: string | undefined): Result<void,ValidationError> {
    return ok(); 
  }

  private notifyListeners() {
    for (const listener of this.listeners)
      listener();
  }

  private getCellValueAndFormatEntry(snapshot: EventSourcedSnapshot, row: number, column: number): SetCellValueAndFormatLogEntry | undefined {
    const content = asContent(snapshot);
    const endIndex = Number(content.endSequenceId-content.logSegment.startSequenceId);
    for (let i = endIndex-1; i >= 0; i --) {
      const entry = content.logSegment.entries[i]!;
      if (entry.row == row && entry.column == column)
        return entry;
    }
    return undefined;
  }

  private syncLogs(): void {
    if (this.isInSyncLogs)
      return;

    this.syncLogsAsync().catch((reason) => { throw Error("Rejected promise from syncLogsAsync", { cause: reason }) });
  }

  private async syncLogsAsync(): Promise<void> {
    this.isInSyncLogs = true;

    // Set up load of first batch of entries
    const segment = this.content.logSegment;
    let isComplete = false;

    while (!isComplete) {
      const curr = this.content;
      const start = (segment.entries.length == 0) ? 'snapshot' : curr.endSequenceId;
      const result = await this.eventLog.query(start, 'end');

      if (curr != this.content) {
        // Must have had setCellValueAndFormat complete successfully and update content to match
        // Query result no longer relevant
        break;
      }

      if (!result.isOk()) {
        if (result.error.type == 'InfinisheetRangeError') {
          // Once we have proper snapshot system would expect this if client gets too far behind, for
          // now shouldn't happen.
          throw Error("Query resulted in range error, reload from scratch?", { cause: result.error });
        }

        // Could do some immediate retries of intermittent errors (limited times, jitter and backoff).
        // For now wait for interval timer to try another sync
        // For persistent failures should stop interval timer and have some mechanism for user to trigger
        // manual retry. 
        this.content = { ...curr, loadStatus: err(result.error)};
        this.notifyListeners();
        break;
      }

      // Extend the current loaded segment.
      // Once snapshots supported need to look out for new snapshot and start new segment
      const value = result.value;
      if (segment.entries.length == 0)
        segment.startSequenceId = value.startSequenceId;
      else if (curr.endSequenceId != value.startSequenceId) {
        // Shouldn't happen unless we have buggy event log implementation
        throw Error(`Query returned start ${value.startSequenceId}, expected ${curr.endSequenceId}`);
      }
      isComplete = value.isComplete;

      // Don't create new snapshot if nothing has changed
      if (value.entries.length > 0) {
        segment.entries.push(...value.entries);

        // Create a new snapshot based on the new data
        let rowCount = curr.rowCount;
        let colCount = curr.colCount;
        for (const entry of value.entries) {
          rowCount = Math.max(rowCount, entry.row+1);
          colCount = Math.max(colCount, entry.column+1);
        }

        this.content = {
          endSequenceId: value.endSequenceId,
          logSegment: segment,
          loadStatus: ok(isComplete),
          rowCount, colCount
        }

        this.notifyListeners();
      } else if (curr.loadStatus.isErr() || curr.loadStatus.value != isComplete) {
        // Careful, even if no entries returned, loadStatus may have changed
        this.content = { ...curr, loadStatus: ok(isComplete) }
        this.notifyListeners();
      }
    }

    this.isInSyncLogs = false;
  }

  private onReceiveMessage(_message: PendingWorkflowMessage): void {
  }

  protected eventLog: EventLog<SpreadsheetLogEntry>;
  protected blobStore: BlobStore<unknown>;
  protected workerOrHost?: WorkerBase<PendingWorkflowMessage> | undefined;

  private intervalId: ReturnType<typeof setInterval> | undefined;
  private isInSyncLogs: boolean;
  private listeners: (() => void)[];
  private content: EventSourcedSnapshotContent;
}
