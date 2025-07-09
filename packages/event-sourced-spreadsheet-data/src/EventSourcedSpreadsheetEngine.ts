import type { Result, StorageError, SequenceId, BlobId, EventLog, BlobStore } from "@candidstartup/infinisheet-types";
import { ok, err } from "@candidstartup/infinisheet-types";

import type { SpreadsheetLogEntry } from "./SpreadsheetLogEntry";

/** @internal */
export interface LogSegment {
  startSequenceId: SequenceId;
  entries: SpreadsheetLogEntry[];
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
      logSegment: { startSequenceId: 0n, entries: [] },
      loadStatus: ok(false),
      rowCount: 0,
      colCount: 0
    }
  }

  protected syncLogs(): void {
    if (this.isInSyncLogs)
      return;

    this.syncLogsAsync().catch((reason) => { throw Error("Rejected promise from syncLogsAsync", { cause: reason }) });
  }

  protected abstract notifyListeners(): void

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

  protected eventLog: EventLog<SpreadsheetLogEntry>;
  protected blobStore: BlobStore<unknown>;
  protected content: EventSourcedSnapshotContent;
  private isInSyncLogs: boolean;
}
