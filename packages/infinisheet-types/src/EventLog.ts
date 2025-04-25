import { Result } from "./Result";
import { StorageError } from "./SpreadsheetData"

export type BlobId = string;
export type WorkflowId = string;
export type SequenceId = bigint;

/** 
 * Type that represents an entry in an {@link EventLog}
 * 
 * Base interface that clients will typically implement multiple times.
 * Each concrete implementation will define its own data properties that
 * need to be serialized into the event log.
 * 
 * Properties defined here are common metadata which require special handling
 * by any `EventLog` implementation.
 * 
 * All data properties are immutable once an entry has been added to the log. Metadata
 * properties (apart from `type`) may change over time.
 */
export interface LogEntry {
  /** Used as a discriminated union tag by implementations */
  type: string;

  /** Stores a reference to a snapshot of the complete log up to and including this entry */
  snapshot?: BlobId | undefined;

  /** Stores a reference to an external history of the event log up to and including the previous entry */
  history?: BlobId | undefined;

  /** Indicates that a background workflow is pending */
  pending?: WorkflowId | undefined;
};

/** 
 * Type that represents a consistency conflict when adding a {@link LogEntry} to an {@link EventLog}
 * 
 * Occurs when an attempt is made to add an entry with a sequence id that is not
 * the next available in the log.
 * 
 * Typically happens when another client makes a change since you last read the log.
 * Sync with the additional log entries and then try again.
 */
export interface ConflictError {
  /** Discriminated union tag */
  type: 'ConflictError',

  /** End user message describing the problem */
  message: string,

  /** Next available sequence id */
  nextSequenceId: SequenceId;
};

/** Convenience method that creates a {@link ConflictError} */
export function conflictError(message: string, nextSequenceId: SequenceId): ConflictError {
  return { type: 'ConflictError', message, nextSequenceId };
}

/** Errors that can be returned by {@link EventLog} `addEntry` method */
export type AddEntryError = ConflictError | StorageError;

/** 
 * Attempt to access an {@link EventLog} with an out of range `SequenceId`
 * 
 * Occurs when trying to query or truncate with a start `SequenceId` outside the range of entries in the log.
 * 
 */
export interface EventLogRangeError {
  /** Discriminated union tag */
  type: 'EventLogRangeError',

  /** End user message describing the problem */
  message: string,
};

/** Convenience method that creates a {@link RangeError} */
export function eventLogRangeError(message: string): EventLogRangeError {
  return { type: 'EventLogRangeError', message };
}

/** Errors that can be returned by {@link EventLog} `query` method */
export type QueryError = EventLogRangeError | StorageError;

/** Errors that can be returned by {@link EventLog} `truncate` method */
export type TruncateError = EventLogRangeError | StorageError;

/** A range of {@link LogEntry} values returned by querying an {@link EventLog} */
export interface QueryValue {
  /**  Sequence id corresponding to the first entry in `entries`
   * 
   * All other entries have consecutive ascending sequence ids
   */
  startSequenceId: SequenceId;

  /** 
   * Sequence id after the final entry in `entries`
   * 
   * If query was up to the `end` sequence id AND
   * `isComplete` is true, this is the next available
   * sequence id for `addEntry`. 
   */
  endSequenceId: SequenceId;

  /** True if all the requested entries have been returned
   * 
   * Queries may return fewer entries than requested. If 
   * `isComplete` is `false`, repeat the query starting
   * from `nextSequenceId`.
   */
  isComplete: boolean;

  /** The {@link LogEntry} records returned by the query */
  entries: LogEntry[];
}

/** Abstract interface representing an event log
 * 
 * 
 */
export interface EventLog {
  /** 
   * Add an entry to the log with the given sequence id
   * 
   * The `sequenceId` must be the next available sequence id in the log. This is returned as `nextSequenceId` when
   * making a query for the `last` entry in the log. Returns a {@link ConflictError} if not the next available id.
   * Any other problem with serializing the entry will return a {@link StorageError}.
   */
  addEntry(entry: LogEntry, sequenceId: SequenceId): Result<void,AddEntryError>;

  /** Return a range of entries from `first` to `last` inclusive 
   * 
   * The event log may return fewer entries than requested. If so, repeat the query starting from `nextSequenceId`.
   * 
   * @param start - `SequenceId` of first entry to return. 
   * Use `'start'` to query from the first entry in the log. 
   * Use `'snapshot'` to query from the most recent entry with a snapshot, or the first if no snapshot is defined.
   * 
   * @param end - `SequenceId` one after the last entry to return.
   * Use `'end'` to query everything to the end of the log.
   */
  query(start: SequenceId | 'snapshot' | 'start', end: SequenceId | 'end'): Result<QueryValue,QueryError>;

  /** All entries prior to `start` are removed from the log. */
  truncate(start: SequenceId): Result<void,TruncateError>
}