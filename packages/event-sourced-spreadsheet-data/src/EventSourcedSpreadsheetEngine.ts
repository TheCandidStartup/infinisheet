import type { Result, StorageError, SequenceId, BlobId, EventLog, BlobStore, QueryValue, SnapshotValue,
  SpreadsheetViewport } from "@candidstartup/infinisheet-types";
import { ok, err, equalViewports } from "@candidstartup/infinisheet-types";

import type { SpreadsheetLogEntry } from "./SpreadsheetLogEntry";
import { SpreadsheetCellMap } from "./SpreadsheetCellMap"
import { openSnapshot, SpreadsheetSnapshot } from "./SpreadsheetSnapshot";

/** @internal */
export interface LogSegment {
  startSequenceId: SequenceId;
  entries: SpreadsheetLogEntry[];
  snapshotId?: BlobId | undefined;
  snapshot?: SpreadsheetSnapshot | undefined;
}

/** @internal */
export interface EventSourcedSnapshotContent {
  endSequenceId: SequenceId;
  logSegment: LogSegment;
  logLoadStatus: Result<boolean,StorageError>;
  cellMap: SpreadsheetCellMap;
  mapLoadStatus: Result<boolean,StorageError>;
  rowCount: number;
  colCount: number;
  viewport: SpreadsheetViewport | undefined;
}

/** @internal */
export function forkSegment(segment: LogSegment, cellMap: SpreadsheetCellMap, snapshot: SnapshotValue): [LogSegment, SpreadsheetCellMap] {
  const index = Number(snapshot.sequenceId - segment.startSequenceId);
  if (index < 0 || index >= segment.entries.length)
    throw Error("forkSegment: snapshotId not within segment");

  const newSegment: LogSegment = 
    { startSequenceId: snapshot.sequenceId, entries: segment.entries.slice(index), snapshotId: snapshot.blobId };
  const newMap = new SpreadsheetCellMap;
  newMap.loadAsSnapshot(cellMap, index);
  newMap.addEntries(newSegment.entries, 0);

  return [newSegment, newMap];
}

async function cellMapFromSnapshot(segment: LogSegment, blobStore: BlobStore<unknown>): Promise<Result<SpreadsheetCellMap,StorageError>> {
  let snapshot = segment.snapshot;
  if (!snapshot) {
    const dir = await blobStore.getRootDir();
    if (dir.isErr())
      return err(dir.error);
    const result = await openSnapshot(dir.value, segment.snapshotId!);
    if (result.isErr())
      return err(result.error);
    snapshot = result.value;
    const index = await snapshot.loadIndex();
    if (index.isErr())
      return err(index.error);
    segment.snapshot = snapshot;
  }

  const blob = await snapshot.loadTile(0, 0, snapshot.rowCount, snapshot.colCount);
  if (blob.isErr())
    return err(blob.error);

  const cellMap = new SpreadsheetCellMap;
  cellMap.loadSnapshot(blob.value);
  cellMap.addEntries(segment.entries, 0);
  return ok(cellMap);
}

async function updateContent(curr: EventSourcedSnapshotContent, value: QueryValue<SpreadsheetLogEntry>,
  blobStore: BlobStore<unknown>): Promise<Result<EventSourcedSnapshotContent,StorageError>> {
  let segment: LogSegment = curr.logSegment;
  let cellMap: SpreadsheetCellMap = curr.cellMap;
  let rowCount = curr.rowCount;
  let colCount = curr.colCount;

  let entries = value.entries;
  const startSequenceId = value.startSequenceId;
  const snapshotId = entries[0]!.snapshot;

  // Start a new segment and load from snapshot if we've jumped to id past what we currently have
  if (snapshotId && curr.endSequenceId != startSequenceId) {
    segment = { startSequenceId, entries, snapshotId };
    const result = await cellMapFromSnapshot(segment, blobStore);
    if (result.isErr())
      return err(result.error);
    cellMap = result.value;

    rowCount = segment.snapshot!.rowCount;
    colCount = segment.snapshot!.colCount;
    for (const entry of entries) {
      rowCount = Math.max(rowCount, entry.row+1);
      colCount = Math.max(colCount, entry.column+1);
    }
  } else {
    if (curr.endSequenceId != startSequenceId) {
      // Shouldn't happen unless we have buggy event log implementation
      throw Error(`Query returned start ${value.startSequenceId}, expected ${curr.endSequenceId}`);
    }

    if (value.lastSnapshot) {
      const { sequenceId } = value.lastSnapshot;
      if (sequenceId < curr.endSequenceId) {
        // Snapshot has completed in entry we already have. Fork segment at that point then process value as normal.
        [segment, cellMap] = forkSegment(segment, cellMap, value.lastSnapshot);
      } else if (sequenceId < value.endSequenceId) {
        // Snapshot in returned value. Add entries up to snapshot to current cell map then start new segment from that.
        const indexInValue = Number(sequenceId - startSequenceId);
        const baseIndex = segment.entries.length;
        for (let i = 0; i < indexInValue; i ++) {
          const entry = entries[i]!;
          rowCount = Math.max(rowCount, entry.row+1);
          colCount = Math.max(colCount, entry.column+1);
          cellMap.addEntry(entry.row, entry.column, baseIndex+i, entry.value, entry.format);
        }
        entries = entries.slice(indexInValue);
        const oldCellMap = cellMap;
        cellMap = new SpreadsheetCellMap;
        cellMap.loadAsSnapshot(oldCellMap, baseIndex+indexInValue);
        const emptyArray: SpreadsheetLogEntry[] = [];
        segment = { startSequenceId: startSequenceId + BigInt(indexInValue), entries: emptyArray, snapshotId: value.lastSnapshot.blobId };
        // Segment extension code below will add the remaining values
      }
      // Snapshot must be in later page of results. Deal with it when we get there.
    }

    // Extend the current loaded segment.
    cellMap.addEntries(entries, segment.entries.length);
    segment.entries.push(...entries);

    for (const entry of entries) {
      rowCount = Math.max(rowCount, entry.row+1);
      colCount = Math.max(colCount, entry.column+1);
    }
  }

  // Create new content based on the new data
  return ok({
    endSequenceId: value.endSequenceId,
    logSegment: segment,
    logLoadStatus: ok(value.isComplete),
    cellMap,
    mapLoadStatus: ok(true),
    rowCount, colCount,
    viewport: curr.viewport
  });
}

/**
 * Low level engine for working with spreadsheet data
 * @internal
 */
export abstract class EventSourcedSpreadsheetEngine {
  constructor (eventLog: EventLog<SpreadsheetLogEntry>, blobStore: BlobStore<unknown>, viewport?: SpreadsheetViewport) {
    this.isInSyncLogs = false;
    this.eventLog = eventLog;
    this.blobStore = blobStore;
    this.content = {
      endSequenceId: 0n,
      logSegment: { startSequenceId: 0n, entries: [] },
      logLoadStatus: ok(false),
      cellMap: new SpreadsheetCellMap,
      mapLoadStatus: ok(true),    // Empty map is consistent with current state of log
      rowCount: 0,
      colCount: 0,
      viewport
    }
  }

  setViewport(viewport: SpreadsheetViewport | undefined): void { 
    const curr = this.content;
    if (equalViewports(curr.viewport, viewport))
      return;

    // Take our own copy of viewport to ensure that it's immutable
    const viewportCopy = viewport ? { ...viewport } : undefined;
    this.content = { ...curr, viewport: viewportCopy, mapLoadStatus: ok(false) };
    this.notifyListeners();
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
      const initialLoad = (curr.endSequenceId === 0n);
      const start = initialLoad ? 'snapshot' : curr.endSequenceId;
      const end = endSequenceId ? endSequenceId : 'end';
      const segment = curr.logSegment;
      const result = await this.eventLog.query(start, end, initialLoad ? undefined : segment.startSequenceId);

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
        this.content = { ...curr, logLoadStatus: err(result.error)};
        this.notifyListeners();
        break;
      }

      const value = result.value;
      isComplete = value.isComplete;

      // Don't create new snapshot if nothing has changed
      if (value.entries.length > 0) {
        const result = await updateContent(curr, value, this.blobStore);
        this.content = result.isOk() ? result.value : { ...curr, logLoadStatus: err(result.error)};
        this.notifyListeners();
      } else if (curr.logLoadStatus.isErr() || curr.logLoadStatus.value != isComplete) {
        // Careful, even if no entries returned, loadStatus may have changed
        this.content = { ...curr, logLoadStatus: ok(isComplete) }
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
