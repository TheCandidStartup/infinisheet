import '@testing-library/jest-dom'

import type { Result, QueryValue, QueryError, SequenceId } from '@candidstartup/infinisheet-types';
import { testQueryResult, type TestLogEntry } from './TestLogEntry';

expect.extend({
  toBeQueryValue(received: Result<QueryValue,QueryError>, [startSequenceId, isComplete, length]: [SequenceId, boolean, number]) {
    if (!received.isOk())
      return { pass: false, message: () => "Should be Ok" }
    const value = received.value;
    if (value.startSequenceId !== startSequenceId)
      return { pass: false, message: () => `startSequenceId should be ${startSequenceId}, actually ${value.startSequenceId}` }
    if (value.isComplete !== isComplete)
      return { pass: false, message: () => `isComplete should be ${isComplete}, actually ${value.isComplete}` }
    if (value.entries.length != length)
      return { pass: false, message: () => `entries length should be ${length}, actually ${value.entries.length}` }
    if (value.endSequenceId !== startSequenceId+BigInt(length))
      return { pass: false, message: () => `endSequenceId should be ${startSequenceId+BigInt(length)}, actually ${value.endSequenceId}` }

    for (let i = 0; i < length; i ++) {
      const entry = value.entries[i]! as TestLogEntry;
      const expectedIndex = Number(startSequenceId)+i
      if (entry.index != expectedIndex)
        return { pass: false, message: () => `entries[${i}] should have index ${expectedIndex}, actually ${entry.index}`, actual: received,
      expected: testQueryResult(startSequenceId, isComplete, length) }
    }

    return { pass: true, message: () => "" }
  },
  toBeQueryError(received: Result<QueryValue,QueryError>, expectedType: string) {
    if (!received.isErr())
      return { pass: false, message: () => "Should be Err" }
    const actualType = received.error.type
    return { pass: actualType === expectedType, message: () => `error type should be ${expectedType}, actually ${actualType}` }
  }
})
