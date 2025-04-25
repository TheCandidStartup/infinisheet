import 'vitest';
import type { SequenceId } from '@candidstartup/infinisheet-types';

// Implementation and registration of custom matchers in setup-jsdom.ts
interface CustomMatchers<R = unknown> {
  toBeQueryValue: (expected: [SequenceId, boolean, number]) => R
  toBeQueryError: (expectedType: string) => R
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
