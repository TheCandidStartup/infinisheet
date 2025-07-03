import type { EventLog, LogEntry, LogMetadata, SequenceId, Result, QueryValue, 
  AddEntryError, QueryError, TruncateError, MetadataError } from "@candidstartup/infinisheet-types";
import { ResultAsync } from "@candidstartup/infinisheet-types";

/** Creates a promise that provides value after a delay (in ms) */
export function delayPromise<T>(value: T, delay: number): Promise<T> {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(value), delay);
  })
}

// Utility method that completes a `ResultAsync` after a delay (in ms)
export function delayResult<T,E>(result: ResultAsync<T,E>, delay: number): ResultAsync<T,E> {
  const promiseLike = result.then<Result<T,E>,never>((r) => delayPromise(r, delay));
  return new ResultAsync(Promise.resolve(promiseLike));
}

/**
 * Wrapper around an {@link EventLog} that injects latency
 * 
 * Intended for use when simulating the effects of latency in a real implementation
 */
export class DelayEventLog<T extends LogEntry> implements EventLog<T> {
  constructor(base: EventLog<T>, delay: number=0) {
    this.base = base;
    this.delay = delay;
  }

  /** Delay in milliseconds to add to response from each API call */
  delay: number;

  addEntry(entry: T, sequenceId: SequenceId): ResultAsync<void,AddEntryError> {
    return delayResult(this.base.addEntry(entry, sequenceId), this.delay);
  }

  setMetadata(sequenceId: SequenceId, metadata: LogMetadata): ResultAsync<void,MetadataError> {
    return delayResult(this.base.setMetadata(sequenceId, metadata), this.delay);
  }

  query(start: SequenceId | 'snapshot' | 'start', end: SequenceId | 'end'): ResultAsync<QueryValue<T>,QueryError> {
    return delayResult(this.base.query(start, end), this.delay);
  }

  truncate(start: SequenceId): ResultAsync<void,TruncateError> {
    return delayResult(this.base.truncate(start), this.delay);
  }

  private base: EventLog<T>;
}