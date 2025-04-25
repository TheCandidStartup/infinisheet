import { SimpleEventLog } from './SimpleEventLog';
import type { LogEntry } from '@candidstartup/infinisheet-types';

interface TestEntry extends LogEntry {
  type: 'test',
  index: number
}

function testEntry(index: number): TestEntry {
  return { type: 'test', index }
}

describe('SimpleEventLog', () => {
  it('should start out empty', () => {
    const data = new SimpleEventLog;

    let result = data.query('start', 'end');
    expect(result).toBeQueryValue([0n, true, 0]);

    result = data.query('snapshot', 'end');
    expect(result).toBeQueryValue([0n, true, 0]);

    result = data.query(0n, 0n);
    expect(result).toBeQueryValue([0n, true, 0]);

    result = data.query(0n, 5n);
    expect(result).toBeQueryValue([0n, true, 0]);

    result = data.query(5n, 30n);
    expect(result).toBeQueryError("EventLogRangeError");

    result = data.query(-5n, 0n);
    expect(result).toBeQueryError("EventLogRangeError");
  })

  it('should support addEntry', () => {
    const data = new SimpleEventLog;

    let addResult = data.addEntry(testEntry(0), 0n)
    expect(addResult.isOk()).toEqual(true);

    let result = data.query('start', 'end');
    expect(result).toBeQueryValue([0n, true, 1]);

    addResult = data.addEntry(testEntry(1), 0n);
    expect(addResult.isErr()).toEqual(true);

    addResult = data.addEntry(testEntry(1), 2n);
    expect(addResult.isErr()).toEqual(true);

    addResult = data.addEntry(testEntry(1), 1n)
    expect(addResult.isOk()).toEqual(true);

    result = data.query('start', 'end');
    expect(result).toBeQueryValue([0n, true, 2]);
  })
})