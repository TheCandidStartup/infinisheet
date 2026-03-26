import 'vitest';
import type { SequenceId, SnapshotValue } from '@candidstartup/infinisheet-types';

// Implementation and registration of custom matchers in setup-jsdom.ts
declare module 'vitest' {
  interface Matchers<T = any> {
    toBeOk: () => R
    toBeInfinisheetError: (expectedType: string) => R
    toBeStorageError: (expectedStatusCode?: number) => R
    toBeQueryValue: (expected: [SequenceId, boolean, number, SnapshotValue?]) => R
    toBeBlobDirEntries: (expectedBlobs: string[], expectedDirs: string[], expectedContinuation?: boolean) => R
  }
}
