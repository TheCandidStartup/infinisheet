import '@testing-library/jest-dom'

import type { Result, QueryValue, QueryError, SequenceId } from '@candidstartup/infinisheet-types';

expect.extend({
  toBeQueryValue(received: Result<QueryValue,QueryError>, [startSequenceId, isComplete, length]: [SequenceId, boolean, number]) {
    if (!received.isOk())
      return { pass: false, message: () => "Should be Ok" }
    const value = received.value;
    if (value.isComplete !== isComplete)
      return { pass: false, message: () => `isComplete should be ${isComplete}, actually ${value.isComplete}` }
    if (value.startSequenceId !== startSequenceId)
      return { pass: false, message: () => `startSequenceId should be ${startSequenceId}, actually ${value.startSequenceId}` }
    if (value.endSequenceId !== startSequenceId+BigInt(length))
      return { pass: false, message: () => `endSequenceId should be ${startSequenceId+BigInt(length)}, actually ${value.endSequenceId}` }
    return { pass: value.entries.length === length, message: () => `entries length should be ${length}, actually ${value.entries.length}` };
  },
  toBeQueryError(received: Result<QueryValue,QueryError>, expectedType: string) {
    if (!received.isErr())
      return { pass: false, message: () => "Should be Err" }
    const actualType = received.error.type
    return { pass: actualType === expectedType, message: () => `error type should be ${expectedType}, actually ${actualType}` }
  }
})
