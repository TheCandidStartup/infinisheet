import type { EventLog, LogEntry, LogMetadata, SequenceId, ResultAsync, QueryValue, 
  AddEntryError, QueryError, TruncateError, MetadataError } from "@candidstartup/infinisheet-types";
import { okAsync, errAsync, conflictError, infinisheetRangeError } from "@candidstartup/infinisheet-types";

const QUERY_PAGE_SIZE = 10;

/**
 * Reference implementation of {@link EventLog}
 * 
 * In-memory event log
 * 
 * Intended for use as a mock, to compare with an optimized implementation when testing and
 * for simple sample apps. Simplest possible implementation, no attempt at optimization.
 */
export class SimpleEventLog<T extends LogEntry> implements EventLog<T> {
  constructor() {
    this.#startSequenceId = 0n;
    this.#endSequenceId = 0n;
    this.#entries = [];
  }

  addEntry(entry: T, sequenceId: SequenceId): ResultAsync<void,AddEntryError> {
    if (sequenceId !== this.#endSequenceId)
      return errAsync(conflictError("sequenceId is not next sequence id", this.#endSequenceId));

    this.#entries.push(entry);
    this.#endSequenceId ++;
    return okAsync();
  }

  setMetadata(sequenceId: SequenceId, metadata: LogMetadata): ResultAsync<void,MetadataError> {
    if (sequenceId < this.#startSequenceId || sequenceId >= this.#endSequenceId)
      return errAsync(infinisheetRangeError(`Log entry with sequenceId ${sequenceId} does not exist`));

    const index = Number(sequenceId - this.#startSequenceId);
    const entry = this.#entries[index]!;
    if ("snapshot" in metadata)
      entry.snapshot = metadata.snapshot;
    if ("history" in metadata)
      entry.history = metadata.history;
    if ("pending" in metadata)
      entry.pending = metadata.pending;

    return okAsync();
  }

  query(start: SequenceId | 'snapshot' | 'start', end: SequenceId | 'end'): ResultAsync<QueryValue<T>,QueryError> {
    if (start === 'start')
      start = this.#startSequenceId;
    else if (start === 'snapshot')
      start = this.#startSequenceId + BigInt(this.findSnapshotIndex());
    else if (start < this.#startSequenceId || start > this.#endSequenceId)
      return errAsync(infinisheetRangeError("start index out of range"));

    if (end === 'end')
      end = this.#endSequenceId;

    const num = end - start;
    const isComplete = num <= BigInt(QUERY_PAGE_SIZE);
    let numToReturn = isComplete ? Number(num) : QUERY_PAGE_SIZE;
    const firstIndex = Number(start - this.#startSequenceId);
    if (firstIndex + numToReturn > this.#entries.length)
      numToReturn = this.#entries.length - firstIndex;

    const value: QueryValue<T> = {
      startSequenceId: start,
      endSequenceId: start + BigInt(numToReturn),
      isComplete,
      entries: this.#entries.slice(firstIndex, firstIndex + numToReturn)
    }

    return okAsync(value);
  }

  truncate(start: SequenceId): ResultAsync<void,TruncateError> {
    if (start < this.#startSequenceId)
      return errAsync(infinisheetRangeError("start before start entry in the log"));

    if (start === this.#startSequenceId)
      return okAsync();
    
    if (start === this.#endSequenceId) {
      this.#startSequenceId = start;
      this.#endSequenceId = start;
      this.#entries = [];
      return okAsync();
    }

    if (start > this.#endSequenceId)
      return errAsync(infinisheetRangeError("start after end entry in the log"));

    const numToRemove = start - this.#startSequenceId;
    this.#startSequenceId = start;
    this.#entries.splice(0, Number(numToRemove));
    return okAsync();
  }

  private findSnapshotIndex(): number {
    for (let i = this.#entries.length - 1; i > 0; i--) {
      const entry = this.#entries[i]!;
      if (entry.snapshot)
        return i;
    }

    // If no other entry has a snapshot use the first (whether it has a snapshot or not)
    return 0;
  }

  #startSequenceId: SequenceId;
  #endSequenceId: SequenceId;
  #entries: T[];
}