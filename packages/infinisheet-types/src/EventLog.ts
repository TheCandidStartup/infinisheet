import { ResultAsync } from "./ResultAsync";
import { StorageError, InfinisheetError, InfinisheetRangeError } from "./Error"

/** Identifier for a blob of data in a blob store */
export type BlobId = string;

/** Identifier for a workflow triggered writing to {@link LogMetadata.pending} */
export type WorkflowId = string;

/** 
 * Identifier for an entry in an {@link EventLog}.
 * 
 * Incrementing integer.
*/
export type SequenceId = bigint;

/**
 * Metadata stored in an {@link EventLog} entry
 */
export interface LogMetadata {
  /** Stores a reference to a snapshot of the complete log up to and including this entry */
  snapshot?: BlobId | undefined;

  /** Stores a reference to an external history of the event log up to and including the previous entry */
  history?: BlobId | undefined;

  /** Indicates that a background workflow is pending */
  pending?: WorkflowId | undefined;
}

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
export interface LogEntry extends LogMetadata {
  /** Used as a discriminated union tag by implementations */
  type: string;
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
export interface ConflictError extends InfinisheetError {
  /** Discriminated union tag */
  type: 'ConflictError',

  /** Next available sequence id */
  nextSequenceId: SequenceId;
};

/** Convenience method that creates a {@link ConflictError} */
export function conflictError(message: string, nextSequenceId: SequenceId): ConflictError {
  return { type: 'ConflictError', message, nextSequenceId };
}

/** Errors that can be returned by {@link EventLog} `addEntry` method */
export type AddEntryError = ConflictError | StorageError;

/** Errors that can be returned by {@link EventLog} `query` method */
export type QueryError = InfinisheetRangeError | StorageError;

/** Errors that can be returned by {@link EventLog} `truncate` method */
export type TruncateError = InfinisheetRangeError | StorageError;

/** Errors that can be returned by {@link EventLog} `setMetadata` method */
export type MetadataError = InfinisheetRangeError | StorageError;

/** Value of a snapshot stored at a specific sequence id in the log */
export interface SnapshotValue {
  /** Sequence id of log entry that stores this snapshot */
  sequenceId: SequenceId;

  /** Content of snapshot in the `BlobStore` */
  blobId: BlobId;
}

/** A range of {@link LogEntry} values returned by querying an {@link EventLog} */
export interface QueryValue<T extends LogEntry> {
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

  /** Most recent snapshot
   * 
   * Returned if query includes `snapshotId` argument and
   * most recent snapshot is different. 
   */
  lastSnapshot?: SnapshotValue | undefined;

  /** The {@link LogEntry} records returned by the query */
  entries: T[];
}

/** Result of calling {@link EventLog.addEntry} */
export interface AddEntryValue {
  /** Most recent snapshot
   * 
   * Returned if query includes `snapshotId` argument and
   * most recent snapshot is different. 
   */
  lastSnapshot?: SnapshotValue | undefined;
}

/** Abstract interface representing an event log
 * 
 * 
 */
export interface EventLog<T extends LogEntry> {
  /** 
   * Add an entry to the log with the given sequence id
   * 
   * @param sequenceId - The next available sequence id in the log. 
   * This is returned as `endSequenceId` when making a query for the `last` entry in the log. 
   * Returns a {@link ConflictError} if not the next available id.
   * 
   * @param snapshotId - The sequence id for the most recent snapshot that the client is aware of.
   * If there's a more recent snapshot, it's id will be returned in `AddEntryValue`. 
   * 
   * Any other problem with serializing the entry will return a {@link StorageError}.
   */
  addEntry(entry: T, sequenceId: SequenceId, snapshotId?: SequenceId): ResultAsync<AddEntryValue,AddEntryError>;

  /**
   * Set some or all of a log entry's metadata fields
   *
   * Changes are atomic. Either all of the specified fields are updated or none are.
   */
  setMetadata(sequenceId: SequenceId, metaData: LogMetadata): ResultAsync<void,MetadataError>;

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
  query(start: SequenceId | 'snapshot' | 'start', end: SequenceId | 'end', snapshotId?: SequenceId): ResultAsync<QueryValue<T>,QueryError>;

  /** All entries prior to `start` are removed from the log. */
  truncate(start: SequenceId): ResultAsync<void,TruncateError>
}