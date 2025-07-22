import { LogEntry, SequenceId, Result, QueryError, QueryValue, ok } from '@candidstartup/infinisheet-types';

export interface TestLogEntry extends LogEntry {
  type: 'test',
  index: number
}

export function testLogEntry(index: number): TestLogEntry {
  return { type: 'test', index }
}

export function testQueryResult(startSequenceId: SequenceId, isComplete: boolean, length: number, 
                                snapshotId?: SequenceId): Result<QueryValue<TestLogEntry>, QueryError> {
  const endSequenceId = startSequenceId + BigInt(length);
  const value:QueryValue<TestLogEntry> = { startSequenceId, endSequenceId, isComplete, snapshotId, entries: [] };

  for  (let i = 0; i < length; i ++) {
    value.entries.push(testLogEntry(Number(startSequenceId)+i));
  }

  return ok(value);
}
