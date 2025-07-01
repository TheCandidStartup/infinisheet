import { ResultAsync } from "./ResultAsync";
import { StorageError, InfinisheetError } from "./Error"

/** 
 * Name of a blob or directory within a {@link BlobDir}
 * 
 * Names MUST NOT be longer than 100 characters
 */
export type BlobName = string;

/** 
 * Invalid {@link BlobName} error
 * 
 * Occurs when trying to pass a `BlobName` that is too long or contains invalid characters
 */
export interface InvalidBlobNameError extends InfinisheetError {
  /** Discriminated union tag */
  type: 'InvalidBlobNameError',
};

export function invalidBlobNameError(message?: string): InvalidBlobNameError { 
  return { type: 'InvalidBlobNameError', message: message ? message : "Invalid Blob Name" }; 
}

/** 
 * Error when trying to access a blob as a directory or vice versa
 * 
 * Occurs when trying to access a blob/directory with a
 * {@link BlobName} that refers to a directory/blob
 */
export interface BlobWrongKindError extends InfinisheetError {
  /** Discriminated union tag */
  type: 'BlobWrongKindError',
};

export function notBlobError(): BlobWrongKindError { return { type: 'BlobWrongKindError', message: "Not a blob"} }
export function notBlobDirError(): BlobWrongKindError { return { type: 'BlobWrongKindError', message: "Not a blob dir"} }

/** 
 * Invalid {@link BlobName} error
 * 
 * Occurs when trying to pass a `BlobName` that is too long or contains invalid characters
 */
export interface NoContinuationError extends InfinisheetError {
  /** Discriminated union tag */
  type: 'NoContinuationError',
};

export function noContinuationError(message?: string): NoContinuationError { 
  return { type: 'NoContinuationError', message: message ? message : "Can't continue query, start again" }; 
}

/** Errors that can be returned by {@link BlobDir.readBlob}  */
export type ReadBlobError = BlobWrongKindError | InvalidBlobNameError | StorageError;

/** Errors that can be returned by {@link BlobDir.writeBlob} */
export type WriteBlobError = BlobWrongKindError | InvalidBlobNameError | StorageError;

/** Errors that can be returned by {@link BlobDir.removeBlob} */
export type RemoveBlobError = BlobWrongKindError | InvalidBlobNameError | StorageError;

/** Errors that can be returned by {@link BlobDir.getDir} */
export type GetDirError = BlobWrongKindError | InvalidBlobNameError | StorageError;

/** Errors that can be returned by {@link BlobDir.query} */
export type DirQueryError = StorageError | NoContinuationError;

/** Errors that can be returned by {@link BlobDir.removeAll} */
export type RemoveAllBlobDirError = StorageError;

export interface BlobDirEntries<ContinuationT> {
  /** Names of blobs returned by {@link BlobDir.query} */
  blobs: BlobName[];

  /** Names of directories returned by {@link BlobDir.query} */
  dirs: BlobName[];

  /** Continuation token to pass to {@link BlobDir.query} if there are more entries to retrieve */
  continuation?: ContinuationT | undefined;
}

/**
 * Directory that contains blobs and other directories within a {@link BlobStore}
 */
export interface BlobDir<ContinuationT> {
  /** Read the content of a blob with the specified name. 
   * 
   * The returned content array is read only and immutable. 
   */
  readBlob(name: BlobName): ResultAsync<Uint8Array,ReadBlobError>;

  /** Write the specified content to a blob with the specified name. 
   * 
   * Any existing blob with that name is overwritten, otherwise a new blob is created.
   * The content array is treated as read only and must be immutable until the operation completes.
  */
  writeBlob(name: BlobName, content: Uint8Array): ResultAsync<void,WriteBlobError>;

  /** Remove blob with the specified name. */
  removeBlob(name: BlobName): ResultAsync<void,RemoveBlobError>;

  /** Get a {@link BlobDir} corresponding to the subdirectory with the specified name 
   * 
   * Subdirectories are "created" on demand
  */
  getDir(name: BlobName): ResultAsync<BlobDir<ContinuationT>,GetDirError>;

  /** Query for blobs and sub-directories within this directory 
   * 
   * The order of entries returned is undefined. 
   * 
   * Can optionally pass a continuation token returned by the previous call to retrieve additional entries.
  */
  query(continuation?: ContinuationT): ResultAsync<BlobDirEntries<ContinuationT>,DirQueryError>;

  /** Remove this directory and it's contents, recursively */
  removeAll(): ResultAsync<void,RemoveAllBlobDirError>;
}

/** Errors that can be returned by {@link BlobStore.getRootDir} */
export type GetRootDirError = StorageError;

/** Abstract interface representing a Blob store
 * 
 * Modeled as a hierarchy of directories and blobs
 */
export interface BlobStore<ContinuationT> {
  /** Returns the root {@link BlobDir} for the store*/
  getRootDir(): ResultAsync<BlobDir<ContinuationT>,GetRootDirError>;
}
