import type { EventLog, LogEntry, SequenceId, Result, QueryValue, 
  AddEntryError, QueryError, StorageError } from "@candidstartup/infinisheet-types";
import { ok, err, conflictError, eventLogRangeError } from "@candidstartup/infinisheet-types";

const QUERY_PAGE_SIZE = 10;

export class SimpleEventLog implements EventLog {
  constructor() {
    this.#startSequenceId = 0n;
    this.#endSequenceId = 0n;
    this.#entries = [];
  }

  addEntry(entry: LogEntry, sequenceId: SequenceId): Result<void,AddEntryError> {
    if (sequenceId !== this.#endSequenceId)
      return err(conflictError("sequenceId is not next sequence id", this.#endSequenceId));

    this.#entries.push(entry);
    this.#endSequenceId ++;
    return ok();
  }

  query(start: SequenceId | 'snapshot' | 'start', end: SequenceId | 'end'): Result<QueryValue,QueryError> {
    if (start === 'start')
      start = this.#startSequenceId;
    else if (start === 'snapshot')
      start = this.#startSequenceId + BigInt(this.findSnapshotIndex());
    else if (start < this.#startSequenceId || start > this.#endSequenceId)
      return err(eventLogRangeError("start index out of range"));

    if (end === 'end')
      end = this.#endSequenceId;

    const num = end - start;
    const isComplete = num <= BigInt(QUERY_PAGE_SIZE);
    let numToReturn = isComplete ? Number(num) : QUERY_PAGE_SIZE;
    const firstIndex = Number(start - this.#startSequenceId);
    if (firstIndex + numToReturn > this.#entries.length)
      numToReturn = this.#entries.length - firstIndex;

    const value: QueryValue = {
      startSequenceId: start,
      endSequenceId: start + BigInt(numToReturn),
      isComplete,
      entries: this.#entries.slice(firstIndex, firstIndex + numToReturn)
    }

    return ok(value);
  }

  truncate(start: SequenceId): Result<void,StorageError> {
    if (start <= this.#startSequenceId)
      return ok();
    
    if (start >= this.#startSequenceId) {
      this.#startSequenceId = start;
      this.#endSequenceId = start;
      this.#entries = [];
      return ok();
    }

    const numToRemove = start - this.#startSequenceId;
    this.#startSequenceId = start;
    this.#endSequenceId -= numToRemove;
    this.#entries.splice(0, Number(numToRemove));
    return ok();
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
  #entries: LogEntry[];
}