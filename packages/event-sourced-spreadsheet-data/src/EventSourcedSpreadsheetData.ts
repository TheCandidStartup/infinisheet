import type { CellValue, SpreadsheetData, ItemOffsetMapping, Result, 
  SpreadsheetDataError, ValidationError, SequenceId, BlobId, EventLog } from "@candidstartup/infinisheet-types";
import { FixedSizeItemOffsetMapping, ok } from "@candidstartup/infinisheet-types";

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
  isComplete: boolean;
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
  constructor (eventLog: EventLog<SpreadsheetLogEntry>) {
    this.#intervalId = undefined;
    this.#isInSyncLogs = false;
    this.#eventLog = eventLog;
    this.#listeners = [];
    this.#content = {
      endSequenceId: 0n,
      logSegment: { startSequenceId: 0n, entries: [] },
      isComplete: false,
      rowCount: 0,
      colCount: 0
    }

    this.#syncLogs();
  }

  subscribe(onDataChange: () => void): () => void {
    if (!this.#intervalId)
      this.#intervalId = setInterval(() => { this.#syncLogs() }, EVENT_LOG_CHECK_DELAY);
    this.#listeners = [...this.#listeners, onDataChange];
    return () => {
      this.#listeners = this.#listeners.filter(l => l !== onDataChange);
      if (this.#listeners.length == 0 && this.#intervalId !== undefined) {
        clearInterval(this.#intervalId);
        this.#intervalId = undefined;
      }
    }
  }

  getSnapshot(): EventSourcedSnapshot {
    return asSnapshot(this.#content);
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
    const entry = this.#getCellValueAndFormatEntry(snapshot, row, column);
    return entry?.value;
  }

  getCellFormat(snapshot: EventSourcedSnapshot, row: number, column: number): string | undefined {
    const entry = this.#getCellValueAndFormatEntry(snapshot, row, column);
    return entry?.format;
  }

  setCellValueAndFormat(row: number, column: number, value: CellValue, format: string | undefined): Result<void,SpreadsheetDataError> {
    const curr = this.#content;

    const result = this.#eventLog.addEntry({ type: 'SetCellValueAndFormat', row, column, value, format}, curr.endSequenceId);
    result.andTee(() => {
      if (this.#content == curr) {
        // Nothing else has updated local copy (no async load has snuck in), so safe to do it myself avoiding round trip with event log
        curr.logSegment.entries.push({ type: 'SetCellValueAndFormat', row, column, value, format});

        // Snapshot semantics preserved by treating EventSourcedSnapshot as an immutable data structure which is 
        // replaced with a modified copy on every update.
        this.#content = {
          endSequenceId: curr.endSequenceId + 1n,
          logSegment: curr.logSegment,
          isComplete: true,
          rowCount: Math.max(curr.rowCount, row+1),
          colCount: Math.max(curr.colCount, column+1)
        }

        this.#notifyListeners();
      }
    }).orElse((err) => { throw Error(err.message); });

    // Oh no, this method needs to become async ...
    return ok();
  }

  isValidCellValueAndFormat(_row: number, _column: number, _value: CellValue, _format: string | undefined): Result<void,ValidationError> {
    return ok(); 
  }

  #notifyListeners() {
    for (const listener of this.#listeners)
      listener();
  }

  #getCellValueAndFormatEntry(snapshot: EventSourcedSnapshot, row: number, column: number): SetCellValueAndFormatLogEntry | undefined {
    const content = asContent(snapshot);
    const endIndex = Number(content.endSequenceId-content.logSegment.startSequenceId);
    for (let i = endIndex-1; i >= 0; i --) {
      const entry = content.logSegment.entries[i]!;
      if (entry.row == row && entry.column == column)
        return entry;
    }
    return undefined;
  }

  #syncLogs(): void {
    if (this.#isInSyncLogs)
      return;

    this.#syncLogsAsync().catch((reason) => { throw Error("Rejected promise from #syncLogsAsync", { cause: reason }) });
  }

  async #syncLogsAsync(): Promise<void> {
    this.#isInSyncLogs = true;

    // Set up load of first batch of entries
    const segment = this.#content.logSegment;
    let isComplete = false;

    while (!isComplete) {
      const curr = this.#content;
      const start = (segment.entries.length == 0) ? 'snapshot' : curr.endSequenceId;
      const result = await this.#eventLog.query(start, 'end');

      if (!result.isOk()) {
        // Depending on error may need to retry (limited times, jitter and backoff), reload from scratch or panic
        throw Error("Error querying log entries");
      }

      // Extend the current loaded segment.
      // Once snapshots supported need to look out for new snapshot and start new segment
      const value = result.value;
      if (segment.entries.length == 0)
        segment.startSequenceId = value.startSequenceId;
      else if (curr.endSequenceId != value.startSequenceId)
        throw Error(`Query returned start ${value.startSequenceId}, expected ${curr.endSequenceId}`);
      isComplete = value.isComplete;

      if (value.entries.length > 0) {
        segment.entries.push(...value.entries);

        // Create a new snapshot based on the new data
        let rowCount = curr.rowCount;
        let colCount = curr.colCount;
        for (const entry of value.entries) {
          rowCount = Math.max(rowCount, entry.row+1);
          colCount = Math.max(colCount, entry.column+1);
        }

        this.#content = {
          endSequenceId: value.endSequenceId,
          logSegment: segment,
          isComplete, rowCount, colCount
        }

        this.#notifyListeners();
      }
    }

    this.#isInSyncLogs = false;
  }

  #intervalId: ReturnType<typeof setInterval> | undefined;
  #isInSyncLogs: boolean;
  #eventLog: EventLog<SpreadsheetLogEntry>;
  #listeners: (() => void)[];
  #content: EventSourcedSnapshotContent;
}
