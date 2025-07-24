import 'vitest';
import type { SequenceId, SnapshotValue } from '@candidstartup/infinisheet-types';

// Implementation and registration of custom matchers in setup-jsdom.ts
interface CustomMatchers<R = unknown> {
  toBeOk: () => void
  toBeInfinisheetError: (expectedType: string) => void
  toBeStorageError: (expectedStatusCode?: number) => void
  toBeQueryValue: (expected: [SequenceId, boolean, number, SnapshotValue?]) => void
  toBeBlobDirEntries: (expectedBlobs: string[], expectedDirs: string[], expectedContinuation?: boolean) => void
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
