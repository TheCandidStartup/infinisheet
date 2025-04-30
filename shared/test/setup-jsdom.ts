import '@testing-library/jest-dom'

import type { Result, QueryValue, QueryError, SequenceId } from '@candidstartup/infinisheet-types';
import { testQueryResult, type TestLogEntry } from './TestLogEntry';

function fail(message: () => string, actual: unknown, expected: [SequenceId, boolean, number]) {
  const [startSequenceId, isComplete, length] = expected;
  return { pass: false, message, actual, expected: testQueryResult(startSequenceId, isComplete, length)}
}

expect.extend({
  toBeQueryValue(received: Result<QueryValue<TestLogEntry>,QueryError>, expected: [SequenceId, boolean, number]) {
    const [startSequenceId, isComplete, length] = expected;
    if (!received.isOk())
      return fail(() => "Should be Ok", received, expected);
    const value = received.value;
    if (value.startSequenceId !== startSequenceId)
      return fail( () => `startSequenceId should be ${startSequenceId}, actually ${value.startSequenceId}`, received, expected);
    if (value.isComplete !== isComplete)
      return fail( () => `isComplete should be ${isComplete}, actually ${value.isComplete}`, received, expected);
    if (value.entries.length != length)
      return fail(() => `entries length should be ${length}, actually ${value.entries.length}`, received, expected);
    if (value.endSequenceId !== startSequenceId+BigInt(length))
      return fail(() => `endSequenceId should be ${startSequenceId+BigInt(length)}, actually ${value.endSequenceId}`, received, expected);

    for (let i = 0; i < length; i ++) {
      const entry = value.entries[i]!;
      const expectedIndex = Number(startSequenceId)+i
      if (entry.index != expectedIndex)
        return fail(() => `entries[${i}] should have index ${expectedIndex}, actually ${entry.index}`, received, expected);
    }

    return { pass: true, message: () => "" }
  },
  toBeQueryError(received: Result<QueryValue<TestLogEntry>,QueryError>, expectedType: string) {
    if (!received.isErr())
      return { pass: false, message: () => "Should be Err" }
    const actualType = received.error.type
    return { pass: actualType === expectedType, message: () => `error type should be ${expectedType}, actually ${actualType}` }
  }
})
