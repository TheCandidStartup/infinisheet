/** Common properties for Infinisheet errors */
export interface InfinisheetError {
    /** Discriminated union tag */
    type: string,

    /** End user message describing the problem */
    message: string,
}

/** 
 * Attempt to access data that is outside the available range
 * 
 */
export interface InfinisheetRangeError extends InfinisheetError {
  /** Discriminated union tag */
  type: 'InfinisheetRangeError',

};

/** Convenience method that creates an {@link InfinisheetRangeError} */
export function infinisheetRangeError(message: string): InfinisheetRangeError {
  return { type: 'InfinisheetRangeError', message };
}

/** Type that represents an error when validating data passed to an API */
export interface ValidationError extends InfinisheetError {
  /** Discriminated union tag */
  type: 'ValidationError'
};

/** Convenience method that creates a {@link ValidationError} */
export function validationError(message: string): ValidationError {
  return { type: 'ValidationError', message };
}

/** Type that represents an error when accessing data in persistent storage */
export interface StorageError extends InfinisheetError {
  /** Discriminated union tag */
  type: 'StorageError',

  /** HTTP style status code
   * 
   * Describes the type of problem encountered. Expected to be a 4XX or 5XX code.
   */
  statusCode?: number | undefined,
};

/** Convenience method that creates a {@link StorageError} */
export function storageError(message: string, statusCode?: number): StorageError {
  return { type: 'StorageError', message, statusCode };
}