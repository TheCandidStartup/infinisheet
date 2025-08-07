import type { Result, StorageError, SequenceId, BlobId, EventLog, BlobStore, QueryValue, SnapshotValue } from "@candidstartup/infinisheet-types";
import { ok, err } from "@candidstartup/infinisheet-types";

import type { SpreadsheetLogEntry } from "./SpreadsheetLogEntry";
import { SpreadsheetCellMap } from "./SpreadsheetCellMap";

/** @internal */
export interface LogSegment {
  startSequenceId: SequenceId;
  entries: SpreadsheetLogEntry[];
  cellMap: SpreadsheetCellMap;
  snapshot?: BlobId | undefined;
}

/** @internal */
export interface EventSourcedSnapshotContent {
  endSequenceId: SequenceId;
  logSegment: LogSegment;
  loadStatus: Result<boolean,StorageError>;
  rowCount: number;
  colCount: number;
}

/** @internal */
export function forkSegment(segment: LogSegment, snapshot: SnapshotValue): LogSegment {
  const index = Number(snapshot.sequenceId - segment.startSequenceId);
  if (index < 0 || index >= segment.entries.length)
    throw Error("forkSegment: snapshotId not within segment");

  const newSegment: LogSegment = 
    { startSequenceId: snapshot.sequenceId, entries: segment.entries.slice(index), cellMap: new SpreadsheetCellMap, snapshot: snapshot.blobId };
  newSegment.cellMap.loadAsSnapshot(segment.cellMap, index);
  newSegment.cellMap.addEntries(newSegment.entries, 0);

  return newSegment;
}

async function updateContent(curr: EventSourcedSnapshotContent, value: QueryValue<SpreadsheetLogEntry>,
  blobStore: BlobStore<unknown>): Promise<Result<EventSourcedSnapshotContent,StorageError>> {
  let segment = curr.logSegment;
  let rowCount = curr.rowCount;
  let colCount = curr.colCount;

  // Start a new segment if value contains a snapshot
  const snapshot = value.entries[0]!.snapshot;
  if (snapshot) {
    segment = { startSequenceId: value.startSequenceId, entries: value.entries, cellMap: new SpreadsheetCellMap, snapshot };
    const dir = await blobStore.getRootDir();
    if (dir.isErr())
      return err(dir.error);
    const blob = await dir.value.readBlob(snapshot);
    if (blob.isErr()) {
      const type = blob.error.type;
      if (type === 'BlobWrongKindError' || type === 'InvalidBlobNameError')
        throw Error("Blob store all messed up", { cause: blob.error })
      return err(blob.error);
    }
    segment.cellMap.loadSnapshot(blob.value);
    segment.cellMap.addEntries(segment.entries, 0);
    ({ rowMax: rowCount, columnMax: colCount } = segment.cellMap.calcExtents(segment.entries.length));
  } else {
    // Extend the current loaded segment.
    if (curr.endSequenceId != value.startSequenceId) {
      // Shouldn't happen unless we have buggy event log implementation
      throw Error(`Query returned start ${value.startSequenceId}, expected ${curr.endSequenceId}`);
    }

    segment.cellMap.addEntries(value.entries, segment.entries.length);
    segment.entries.push(...value.entries);

    for (const entry of value.entries) {
      rowCount = Math.max(rowCount, entry.row+1);
      colCount = Math.max(colCount, entry.column+1);
    }
  }

  // Create a new snapshot based on the new data
  return ok({
    endSequenceId: value.endSequenceId,
    logSegment: segment,
    loadStatus: ok(value.isComplete),
    rowCount, colCount
  });
}

/**
 * Low level engine for working with spreadsheet data
 * @internal
 */
export abstract class EventSourcedSpreadsheetEngine {
  constructor (eventLog: EventLog<SpreadsheetLogEntry>, blobStore: BlobStore<unknown>) {
    this.isInSyncLogs = false;
    this.eventLog = eventLog;
    this.blobStore = blobStore;
    this.content = {
      endSequenceId: 0n,
      logSegment: { startSequenceId: 0n, entries: [], cellMap: new SpreadsheetCellMap },
      loadStatus: ok(false),
      rowCount: 0,
      colCount: 0
    }
  }

  // Sync in-memory representation so that it includes range to endSequenceId (defaults to end of log)
  protected syncLogs(endSequenceId?: SequenceId): void {
    this.syncLogsAsync(endSequenceId).catch((reason) => { throw Error("Rejected promise from syncLogsAsync", { cause: reason }) });
  }

  protected abstract notifyListeners(): void

  protected async syncLogsAsync(endSequenceId?: SequenceId): Promise<void> {
    if (this.isInSyncLogs)
      return Promise.resolve();

    // Already have everything required?
    if (endSequenceId && endSequenceId <= this.content.endSequenceId)
      return Promise.resolve();

    this.isInSyncLogs = true;

    // Set up load of first batch of entries
    let isComplete = false;

    while (!isComplete) {
      const curr = this.content;
      const start = (curr.endSequenceId === 0n) ? 'snapshot' : curr.endSequenceId;
      const end = endSequenceId ? endSequenceId : 'end';
      const result = await this.eventLog.query(start, end);

      if (curr != this.content) {
        // Must have had setCellValueAndFormat complete successfully and update content to match.
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

      const value = result.value;
      isComplete = value.isComplete;

      // Don't create new snapshot if nothing has changed
      if (value.entries.length > 0) {
        const result = await updateContent(curr, value, this.blobStore);
        this.content = result.isOk() ? result.value : { ...curr, loadStatus: err(result.error)};
        this.notifyListeners();
      } else if (curr.loadStatus.isErr() || curr.loadStatus.value != isComplete) {
        // Careful, even if no entries returned, loadStatus may have changed
        this.content = { ...curr, loadStatus: ok(isComplete) }
        this.notifyListeners();
      }
    }

    this.isInSyncLogs = false;
  }

  protected eventLog: EventLog<SpreadsheetLogEntry>;
  protected blobStore: BlobStore<unknown>;
  protected content: EventSourcedSnapshotContent;
  private isInSyncLogs: boolean;
}
