import type { CellValue, CellFormat, SpreadsheetData, ItemOffsetMapping, Result, ResultAsync, StorageError, 
  SpreadsheetDataError, ValidationError, EventLog, BlobStore, WorkerHost, PendingWorkflowMessage, } from "@candidstartup/infinisheet-types";
import { FixedSizeItemOffsetMapping, ok, storageError } from "@candidstartup/infinisheet-types";

import type { SpreadsheetLogEntry } from "./SpreadsheetLogEntry";
import { EventSourcedSnapshotContent, EventSourcedSpreadsheetEngine } from "./EventSourcedSpreadsheetEngine"
import { CellMapEntry } from "./SpreadsheetCellMap";

// How often to check for new event log entries (ms)
const EVENT_LOG_CHECK_INTERVAL = 10000;

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
export class EventSourcedSpreadsheetData  extends EventSourcedSpreadsheetEngine implements SpreadsheetData<EventSourcedSnapshot> {
  constructor (eventLog: EventLog<SpreadsheetLogEntry>, blobStore: BlobStore<unknown>, workerHost?: WorkerHost<PendingWorkflowMessage>,
               snapshotInterval=100) {
    super(eventLog, blobStore);

    this.intervalId = undefined;
    this.workerHost = workerHost;
    this.snapshotInterval = snapshotInterval;
    this.listeners = [];

    void this.syncLogs();
  }

  subscribe(onDataChange: () => void): () => void {
    if (!this.intervalId)
      this.intervalId = setInterval(() => { void this.syncLogs() }, EVENT_LOG_CHECK_INTERVAL);
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

  getCellFormat(snapshot: EventSourcedSnapshot, row: number, column: number): CellFormat {
    const entry = this.getCellValueAndFormatEntry(snapshot, row, column);
    return entry?.format;
  }

  setCellValueAndFormat(row: number, column: number, value: CellValue, format: CellFormat): ResultAsync<void,SpreadsheetDataError> {
    const curr = this.content;

    const pending = this.workflowNeeded();
    const result = this.eventLog.addEntry({ type: 'SetCellValueAndFormat', row, column, value, format, pending }, curr.endSequenceId);
    return result.andTee(() => {
      if (this.content == curr) {
        // Nothing else has updated local copy (no async load has snuck in), so safe to do it myself avoiding round trip with event log
        curr.logSegment.entries.push({ type: 'SetCellValueAndFormat', row, column, value, format});
        curr.logSegment.cellMap.addEntry(row, column, Number(curr.endSequenceId-curr.logSegment.startSequenceId), value, format);

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
            void this.syncLogs();
          }
          return storageError("Client out of sync", 409);
        case 'StorageError': 
          return err;
      }
    });
  }

  isValidCellValueAndFormat(_row: number, _column: number, _value: CellValue, _format: CellFormat): Result<void,ValidationError> {
    return ok(); 
  }

  protected notifyListeners() {
    for (const listener of this.listeners)
      listener();
  }

  private workflowNeeded(): string | undefined {
    if (!this.workerHost)
      return undefined;
    
    const index = this.content.logSegment.entries.length % this.snapshotInterval;
    return (this.snapshotInterval === index + 1) ? 'snapshot' : undefined;
  }

  private getCellValueAndFormatEntry(snapshot: EventSourcedSnapshot, row: number, column: number): CellMapEntry | undefined {
    const content = asContent(snapshot);
    const endIndex = Number(content.endSequenceId-content.logSegment.startSequenceId);
    return content.logSegment.cellMap.findEntry(row, column, endIndex);
  }


  protected workerHost?: WorkerHost<PendingWorkflowMessage> | undefined;
  private snapshotInterval: number;
  private intervalId: ReturnType<typeof setInterval> | undefined;
  private listeners: (() => void)[];
}
