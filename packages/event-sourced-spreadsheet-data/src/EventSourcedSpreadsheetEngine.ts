import type { Result, StorageError, SequenceId, BlobId, EventLog, BlobStore, QueryValue, SnapshotValue,
  SpreadsheetViewport, CellRangeCoords} from "@candidstartup/infinisheet-types";
import { ok, err, equalViewports, equalCellRangeCoords } from "@candidstartup/infinisheet-types";

import type { SpreadsheetLogEntry } from "./SpreadsheetLogEntry";
import { SpreadsheetTileMap } from "./SpreadsheetTileMap";
import { SpreadsheetGridTileMap } from "./SpreadsheetGridTileMap"
import { openSnapshot, SpreadsheetSnapshot } from "./SpreadsheetSnapshot";
import { SpreadsheetCellMap } from "./SpreadsheetCellMap";

/** @internal */
export interface LogSegment {
  startSequenceId: SequenceId;
  entries: SpreadsheetLogEntry[];
  cellMap: SpreadsheetCellMap;

  snapshotId?: BlobId | undefined;
  snapshot?: SpreadsheetSnapshot | undefined;
  tileMap: SpreadsheetTileMap;
}

/** @internal */
export interface EventSourcedSnapshotContent {
  endSequenceId: SequenceId;
  logSegment: LogSegment;
  logLoadStatus: Result<boolean,StorageError>;

  mapLoadStatus: Result<boolean,StorageError>;
  rowCount: number;
  colCount: number;
  viewportCellRange: CellRangeCoords | undefined | null;
  viewport: SpreadsheetViewport | undefined;
}

/** @internal */
function createTileMap(): SpreadsheetTileMap {
  return new SpreadsheetGridTileMap;
}

/** @internal */
export function forkSegment(segment: LogSegment, snapshot: SnapshotValue): LogSegment {
  const index = Number(snapshot.sequenceId - segment.startSequenceId);
  if (index < 0 || index >= segment.entries.length)
    throw Error("forkSegment: snapshotId not within segment");

  const tileMap = createTileMap();
  const cellMap = new SpreadsheetCellMap;
  const newSegment: LogSegment = 
    { startSequenceId: snapshot.sequenceId, entries: segment.entries.slice(index), snapshotId: snapshot.blobId,
       tileMap, cellMap };

  tileMap.loadAsSnapshot(segment.tileMap, segment.cellMap, index);
  cellMap.addEntries(newSegment.entries, 0);

  return newSegment;
}

async function segmentFromSnapshot(startSequenceId: SequenceId, entries: SpreadsheetLogEntry[], snapshotId: BlobId,
   blobStore: BlobStore<unknown>, cellRange: CellRangeCoords|undefined|null): Promise<Result<LogSegment,StorageError>> {

  const dir = await blobStore.getRootDir();
  if (dir.isErr())
    return err(dir.error);
  const result = await openSnapshot(dir.value, snapshotId);
  if (result.isErr())
    return err(result.error);
  const snapshot = result.value;
  const index = await snapshot.loadIndex();
  if (index.isErr())
    return err(index.error);

  const tileMap = createTileMap();
  const cellMap = new SpreadsheetCellMap;
  cellMap.addEntries(entries, 0);
  const segment: LogSegment = { startSequenceId, entries, snapshotId, snapshot, tileMap, cellMap };

  if (cellRange === null)
    return ok(segment);

  const tileResult = await tileMap.loadTiles(snapshot, cellRange);
  return tileResult.isOk() ? ok(segment) : err(tileResult.error);
}

async function updateContent(curr: EventSourcedSnapshotContent, value: QueryValue<SpreadsheetLogEntry>,
  blobStore: BlobStore<unknown>): Promise<Result<EventSourcedSnapshotContent,StorageError>> {
  let segment = curr.logSegment;
  let rowCount = curr.rowCount;
  let colCount = curr.colCount;

  let entries = value.entries;
  const startSequenceId = value.startSequenceId;
  const snapshotId = entries[0]!.snapshot;

  // Start a new segment and load from snapshot if we've jumped to id past what we currently have
  if (snapshotId && curr.endSequenceId != startSequenceId) {
    const result = await segmentFromSnapshot(startSequenceId, entries, snapshotId, blobStore, curr.viewportCellRange);
    if (result.isErr())
      return err(result.error);
    segment = result.value;

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
        segment = forkSegment(segment, value.lastSnapshot);
      } else if (sequenceId < value.endSequenceId) {
        // Snapshot in returned value. Add entries up to snapshot to current cell map then start new segment from that.
        const cellMap = segment.cellMap;
        const indexInValue = Number(sequenceId - startSequenceId);
        const baseIndex = segment.entries.length;
        for (let i = 0; i < indexInValue; i ++) {
          const entry = entries[i]!;
          rowCount = Math.max(rowCount, entry.row+1);
          colCount = Math.max(colCount, entry.column+1);
          cellMap.addEntry(entry.row, entry.column, baseIndex+i, entry.value, entry.format);
        }
        entries = entries.slice(indexInValue);
        const tileMap = createTileMap();
        tileMap.loadAsSnapshot(segment.tileMap, cellMap, baseIndex+indexInValue);
        const emptyArray: SpreadsheetLogEntry[] = [];
        segment = { startSequenceId: startSequenceId + BigInt(indexInValue), entries: emptyArray, snapshotId: value.lastSnapshot.blobId, 
          tileMap, cellMap: new SpreadsheetCellMap };
        // Segment extension code below will add the remaining values
      }
      // Snapshot must be in later page of results. Deal with it when we get there.
    }

    // Extend the current loaded segment.
    segment.cellMap.addEntries(entries, segment.entries.length);
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
    mapLoadStatus: ok(true),
    rowCount, colCount,
    viewportCellRange: curr.viewportCellRange,
    viewport: curr.viewport
  });
}

/**
 * Low level engine for working with spreadsheet data
 * @internal
 */
export abstract class EventSourcedSpreadsheetEngine {
  constructor (eventLog: EventLog<SpreadsheetLogEntry>, blobStore: BlobStore<unknown>, 
    viewportCellRange?: CellRangeCoords|null, viewport?: SpreadsheetViewport) 
  {
    this.isInSyncLogs = false;
    this.eventLog = eventLog;
    this.blobStore = blobStore;
    this.content = {
      endSequenceId: 0n,
      logSegment: { startSequenceId: 0n, entries: [], tileMap: createTileMap(), cellMap: new SpreadsheetCellMap },
      logLoadStatus: ok(false),
      mapLoadStatus: ok(true),    // Empty map is consistent with current state of log
      rowCount: 0,
      colCount: 0,
      viewportCellRange,
      viewport
    }
  }

  protected setViewportCellRange(viewportCellRange: CellRangeCoords|null|undefined,viewport?: SpreadsheetViewport): void { 
    const curr = this.content;
    if (equalViewports(curr.viewport, viewport) && equalCellRangeCoords(curr.viewportCellRange, viewportCellRange))
      return;

    // Take our own copy of viewport to ensure that it's immutable
    const viewportCopy = viewport ? { ...viewport } : undefined;
    const cellRangeCopy = viewportCellRange ? [ ...viewportCellRange ] as CellRangeCoords : viewportCellRange;
    // TODO - Updating content will cancel any in progress syncLogs, is that what we want???
    this.content = { ...curr, viewportCellRange: cellRangeCopy, viewport: viewportCopy, mapLoadStatus: ok(false) };
    this.notifyListeners();
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
  protected isInSyncLogs: boolean;
}
