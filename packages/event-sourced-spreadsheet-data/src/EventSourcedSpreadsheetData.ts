import { CellValue, CellFormat, SpreadsheetData, ItemOffsetMapping, Result, ResultAsync, StorageError, AddEntryError, AddEntryValue,
  SpreadsheetDataError, ValidationError, EventLog, BlobStore, WorkerHost, PendingWorkflowMessage,
  SpreadsheetViewport, viewportToCellRange, emptyViewport} from "@candidstartup/infinisheet-types";
import { FixedSizeItemOffsetMapping, ok, err, storageError } from "@candidstartup/infinisheet-types";

import type { SetCellValueAndFormatLogEntry, SpreadsheetLogEntry } from "./SpreadsheetLogEntry";
import { EventSourcedSnapshotContent, EventSourcedSpreadsheetEngine, forkSegment } from "./EventSourcedSpreadsheetEngine"
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

/** Additional options for {@link EventSourcedSpreadsheetData} */
export interface EventSourcedSpreadsheetDataOptions {
  /** Minimum number of log entries before creation of next snapshot 
   * @defaultValue 100
  */
  snapshotInterval?: number | undefined;

  /** Should pending workflows be restarted on initial load of event log? 
   * @defaultValue false
  */
  restartPendingWorkflowsOnLoad?: boolean | undefined;

  /** Initial viewport empty ? 
   * @defaultValue false
  */
  viewportEmpty?: boolean | undefined;
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
               options?: EventSourcedSpreadsheetDataOptions) {
    super(eventLog, blobStore, options?.viewportEmpty ? null : undefined, options?.viewportEmpty ? emptyViewport() : undefined);

    this.intervalId = undefined;
    this.workerHost = workerHost;
    this.snapshotInterval = options?.snapshotInterval || 100;
    this.listeners = [];

    this.syncLogsPromise = this.syncLogsAsync();
  }

  subscribe(onDataChange: () => void): () => void {
    if (!this.intervalId) {
      this.intervalId = setInterval(() => { 
        if (!this.isInSyncLogs)
          this.syncLogsPromise = this.syncLogsAsync(); 
      }, EVENT_LOG_CHECK_INTERVAL);
    }
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
    const content = asContent(snapshot);
    if (content.logLoadStatus.isErr())
      return content.logLoadStatus;
    if (content.mapLoadStatus.isErr())
      return content.mapLoadStatus;

    return content.logLoadStatus.value ? content.mapLoadStatus : content.logLoadStatus;
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
    // Assign content here to keep TypeScript happy even though overwritten in first step of promise chain
    let curr = this.content;
    const entry: SetCellValueAndFormatLogEntry = { type: 'SetCellValueAndFormat', row, column, value, format };

    return ResultAsync.fromSafePromise(this.syncLogsPromise).andThen(() => {
      // If syncLogs was in progress when we came in, content may have been updated
      curr = this.content;
      return this.addEntry(curr, entry);
    }).map((addEntryValue) => {
      if (this.content === curr) {
        // Nothing else has updated local copy (no async load has snuck in), so safe to do it myself avoiding round trip with event log
        let logSegment = curr.logSegment;
        if (addEntryValue.lastSnapshot) {
          logSegment = forkSegment(logSegment, addEntryValue.lastSnapshot);
        }
        logSegment.entries.push(entry);
        logSegment.cellMap.addEntry(row, column, Number(curr.endSequenceId-logSegment.startSequenceId), value, format);

        // Snapshot semantics preserved by treating EventSourcedSnapshot as an immutable data structure which is 
        // replaced with a modified copy on every update.
        this.content = {
          endSequenceId: curr.endSequenceId + 1n,
          logSegment,
          logLoadStatus: ok(true),
          // TODO - or should I leave this as current, all I know is that tile for this cell has been loaded, not all in range ...
          mapLoadStatus: ok(true),
          rowCount: Math.max(curr.rowCount, row+1),
          colCount: Math.max(curr.colCount, column+1),
          viewportCellRange: curr.viewportCellRange,
          viewport: curr.viewport
        }

        this.notifyListeners();
      }
    }).mapErr((err): SpreadsheetDataError => {
      switch (err.type) {
        case 'ConflictError':
          if (this.content == curr) {
            // Out of date wrt to event log, nothing else has updated content since then, so set
            // status for in progress load and trigger sync.
            this.content = { ...curr, logLoadStatus: ok(false) }
            if (!this.isInSyncLogs)
              this.syncLogsPromise = this.syncLogsAsync();
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

  setViewport(viewport: SpreadsheetViewport|undefined): void { 
    const cellRange = viewport ? viewportToCellRange(this, asSnapshot(this.content), viewport) : undefined;
    this.setViewportCellRange(cellRange, viewport);

    void this.syncLogsPromise.then(() => {
      const curr = this.content;
      const segment = curr.logSegment;
      if (segment.snapshot) {
        if (curr.viewportCellRange != null) {
          void segment.tileMap.loadTiles(segment.snapshot, curr.viewportCellRange).then((result) => {
            if (this.content == curr) {
              const status: typeof this.content.mapLoadStatus = result.isOk() ? ok(true) : err(result.error);
              this.content = { ...curr, mapLoadStatus: status }
              this.notifyListeners();
            }
          })
        }
      } else {
        this.content = { ...curr, mapLoadStatus: ok(true) }
        this.notifyListeners();
      }
    });
  }

  getViewport(snapshot: EventSourcedSnapshot): SpreadsheetViewport | undefined { 
    return asContent(snapshot).viewport; 
  }

  protected notifyListeners() {
    for (const listener of this.listeners)
      listener();
  }

  private addEntry(curr: EventSourcedSnapshotContent, entry: SpreadsheetLogEntry): ResultAsync<AddEntryValue,AddEntryError> {
    const segment = curr.logSegment;
    if (this.workerHost) {
      const index = segment.entries.length % this.snapshotInterval;
      if (this.snapshotInterval === index + 1)
        entry.pending = 'snapshot';

      // TODO: Check whether previous snapshot has completed. If not need to wait before
      // doing another. May need to retry previous snapshot.
    }

    return this.eventLog.addEntry(entry, curr.endSequenceId, segment.snapshotId ? segment.startSequenceId : 0n);
  }

  private getCellValueAndFormatEntry(snapshot: EventSourcedSnapshot, row: number, column: number): CellMapEntry | undefined {
    const content = asContent(snapshot);
    const endIndex = Number(content.endSequenceId-content.logSegment.startSequenceId);

    const segment = content.logSegment;
    const entry = segment.cellMap.findEntry(row, column, endIndex);
    return entry ? entry : segment.tileMap.findEntry(row, column);
  }


  protected workerHost?: WorkerHost<PendingWorkflowMessage> | undefined;
  private snapshotInterval: number;
  private intervalId: ReturnType<typeof setInterval> | undefined;
  private listeners: (() => void)[];
  private syncLogsPromise: Promise<void>;
}
