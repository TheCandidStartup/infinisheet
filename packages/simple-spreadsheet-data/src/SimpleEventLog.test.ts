import { SimpleEventLog } from './SimpleEventLog';
import { testLogEntry, TestLogEntry } from '../../../shared/test/TestLogEntry';
import type { LogMetadata } from '@candidstartup/infinisheet-types';


describe('SimpleEventLog', () => {
  it('should start out empty', () => {
    const data = new SimpleEventLog<TestLogEntry>;

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
    const data = new SimpleEventLog<TestLogEntry>;

    let addResult = data.addEntry(testLogEntry(0), 0n)
    expect(addResult.isOk()).toEqual(true);

    let result = data.query('start', 'end');
    expect(result).toBeQueryValue([0n, true, 1]);

    addResult = data.addEntry(testLogEntry(1), 0n);
    expect(addResult.isErr()).toEqual(true);

    addResult = data.addEntry(testLogEntry(1), 2n);
    expect(addResult.isErr()).toEqual(true);

    addResult = data.addEntry(testLogEntry(1), 1n)
    expect(addResult.isOk()).toEqual(true);

    result = data.query('start', 'end');
    expect(result).toBeQueryValue([0n, true, 2]);
  })

  // Not that declaring snapshot property in this way results i
  // constructor implicitly creating this.snapshot with value undefined.
  class ExtraPropsMetaData implements LogMetadata {
    constructor() { this.index = 42; }
    index: number;
    snapshot?: string | undefined;
  }

  it('should support setMetadata', () => {
    const data = new SimpleEventLog<TestLogEntry>;
    data.addEntry(testLogEntry(0), 0n)
    
    data.setMetadata(0n, { snapshot: "snap" });
    let result = data.query('start', 'end');
    expect(result).toBeQueryValue([0n, true, 1]);
    expect(result._unsafeUnwrap().entries[0]).toHaveProperty("snapshot", "snap");

    // Check that setting one property has no effect on others
    data.setMetadata(0n, { history: "hist" });
    result = data.query('start', 'end');
    expect(result).toBeQueryValue([0n, true, 1]);
    expect(result._unsafeUnwrap().entries[0]).toHaveProperty("snapshot", "snap");
    expect(result._unsafeUnwrap().entries[0]).toHaveProperty("history", "hist");

    // Extra non-metadata properties should be ignored
    data.setMetadata(0n, new ExtraPropsMetaData);
    result = data.query('start', 'end');
    expect(result).toBeQueryValue([0n, true, 1]);
    expect(result._unsafeUnwrap().entries[0]).toHaveProperty("snapshot", undefined);
    expect(result._unsafeUnwrap().entries[0]).toHaveProperty("history", "hist");
  })
})