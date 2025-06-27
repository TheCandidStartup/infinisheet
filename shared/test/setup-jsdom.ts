import '@testing-library/jest-dom'

import type { Result, QueryValue, InfinisheetError, StorageError, SequenceId, BlobDirEntries } from '@candidstartup/infinisheet-types';
import { testQueryResult, type TestLogEntry } from './TestLogEntry';

function arrayEquals<T>(a: T[], b: T[]) {
  return a.length === b.length && a.every((val, index) => val === b[index]);
}

// Declare each method added in vitest.d.ts
expect.extend({
  toBeQueryValue(received: Result<QueryValue<TestLogEntry>,unknown>, expected: [SequenceId, boolean, number]) {
    function fail(message: () => string) {
      const [startSequenceId, isComplete, length] = expected;
      return { pass: false, message, actual: received, expected: testQueryResult(startSequenceId, isComplete, length)}
    }
    const [startSequenceId, isComplete, length] = expected;
    if (!received.isOk())
      return fail(() => "Should be Ok");
    const value = received.value;
    if (value.startSequenceId !== startSequenceId)
      return fail( () => `startSequenceId should be ${startSequenceId}, actually ${value.startSequenceId}`);
    if (value.isComplete !== isComplete)
      return fail( () => `isComplete should be ${isComplete}, actually ${value.isComplete}`);
    if (value.entries.length != length)
      return fail(() => `entries length should be ${length}, actually ${value.entries.length}`);
    if (value.endSequenceId !== startSequenceId+BigInt(length))
      return fail(() => `endSequenceId should be ${startSequenceId+BigInt(length)}, actually ${value.endSequenceId}`);

    for (let i = 0; i < length; i ++) {
      const entry = value.entries[i]!;
      const expectedIndex = Number(startSequenceId)+i
      if (entry.index != expectedIndex)
        return fail(() => `entries[${i}] should have index ${expectedIndex}, actually ${entry.index}`);
    }

    return { pass: true, message: () => "" }
  },

  toBeBlobDirEntries(received: Result<BlobDirEntries<unknown>,unknown>, expectedBlobs: string[], expectedDirs: string[], expectedContinuation?: boolean) {
    if (!received.isOk())
      return { pass: false, message: () => "Should be Ok" };
    const value = received.value;

    const sortedBlobs = [...value.blobs].sort();
    if (!arrayEquals(sortedBlobs, expectedBlobs))
      return { pass: false, message: () => `Blobs don't match`, actual: sortedBlobs, expected: expectedBlobs };

    const sortedDirs = [...value.dirs].sort();
    if (!arrayEquals(sortedDirs, expectedDirs))
      return { pass: false, message: () => `Dirs don't match`, actual: sortedDirs, expected: expectedDirs };

    const actualC = !!value.continuation;
    const expectedC = !!expectedContinuation;

    return { pass: actualC === expectedC, message: () => "Continuation doesn't match", actual: actualC, expected: expectedC }
  },

  toBeOk(received: Result<unknown,InfinisheetError>) {
    return { pass: received.isOk(), message: () => `Result should be Ok, actually ${JSON.stringify(received._unsafeUnwrapErr())}` }
  },

  toBeInfinisheetError(received: Result<unknown,InfinisheetError>, expectedType: string) {
    if (!received.isErr())
      return { pass: false, message: () => "Expected Err, actually Ok" }
    const actualType = received.error.type
    return { pass: actualType === expectedType, message: () => `error type should be ${expectedType}, actually ${actualType}` }
  },

  toBeStorageError(received: Result<unknown,InfinisheetError>, expectedStatusCode?: number) {
    if (!received.isErr())
      return { pass: false, message: () => "Expected Err, actually Ok" }
    const error = received.error;
    if (error.type !== "StorageError")
      return { pass: false, message: () => `error type should be StorageError, actually ${error.type}` }
    const storageError = error as StorageError;
    return { pass: storageError.statusCode === expectedStatusCode, 
      message: () => this.isNot ? `StorageError ${expectedStatusCode}, expected not` 
                                : `status code should be ${expectedStatusCode}, actually ${storageError.statusCode}` }
  },
})

