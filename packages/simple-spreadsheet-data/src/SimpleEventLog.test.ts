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
    expect(result).toBeInfinisheetError("InfinisheetRangeError");

    result = data.query(-5n, 0n);
    expect(result).toBeInfinisheetError("InfinisheetRangeError");
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
    
    expect(data.setMetadata(-1n, {})).toBeInfinisheetError("InfinisheetRangeError");
    expect(data.setMetadata(1n, {})).toBeInfinisheetError("InfinisheetRangeError");

    data.setMetadata(0n, {});
    let result = data.query('start', 'end');
    expect(result).toBeQueryValue([0n, true, 1]);
    expect(result._unsafeUnwrap().entries[0]).not.toHaveProperty("snapshot");
    expect(result._unsafeUnwrap().entries[0]).not.toHaveProperty("history");
    expect(result._unsafeUnwrap().entries[0]).not.toHaveProperty("pending");

    data.setMetadata(0n, { snapshot: "snap" });
    result = data.query('start', 'end');
    expect(result).toBeQueryValue([0n, true, 1]);
    expect(result._unsafeUnwrap().entries[0]).toHaveProperty("snapshot", "snap");

    // Check that setting one property has no effect on others
    data.setMetadata(0n, { history: "hist" });
    result = data.query('start', 'end');
    expect(result).toBeQueryValue([0n, true, 1]);
    expect(result._unsafeUnwrap().entries[0]).toHaveProperty("snapshot", "snap");
    expect(result._unsafeUnwrap().entries[0]).toHaveProperty("history", "hist");

    // Set multiple properties
    data.setMetadata(0n, { history: "hist2", pending: "pend" });
    result = data.query('start', 'end');
    expect(result).toBeQueryValue([0n, true, 1]);
    expect(result._unsafeUnwrap().entries[0]).toHaveProperty("snapshot", "snap");
    expect(result._unsafeUnwrap().entries[0]).toHaveProperty("history", "hist2");
    expect(result._unsafeUnwrap().entries[0]).toHaveProperty("pending", "pend");

    // Extra non-metadata properties should be ignored
    data.setMetadata(0n, new ExtraPropsMetaData);
    result = data.query('start', 'end');
    expect(result).toBeQueryValue([0n, true, 1]);
    expect(result._unsafeUnwrap().entries[0]).toHaveProperty("snapshot", undefined);
    expect(result._unsafeUnwrap().entries[0]).toHaveProperty("history", "hist2");
  })

  it('should support truncate', () => {
    const data = new SimpleEventLog<TestLogEntry>;
    for (let i = 0; i < 10; i ++)
      data.addEntry(testLogEntry(i), BigInt(i))
    expect(data.query('start', 'end')).toBeQueryValue([0n, true, 10]);

    let result = data.truncate(BigInt(-1));
    expect(result).toBeInfinisheetError("InfinisheetRangeError")

    result = data.truncate(BigInt(11));
    expect(result).toBeInfinisheetError("InfinisheetRangeError")

    result = data.truncate(BigInt(0));
    expect(result.isOk()).toEqual(true);
    expect(data.query('start', 'end')).toBeQueryValue([0n, true, 10]);

    result = data.truncate(BigInt(4));
    expect(result.isOk()).toEqual(true);
    expect(data.query('start', 'end')).toBeQueryValue([4n, true, 6]);

    result = data.truncate(BigInt(3));
    expect(result).toBeInfinisheetError("InfinisheetRangeError")

    result = data.truncate(BigInt(6));
    expect(result.isOk()).toEqual(true);
    expect(data.query('start', 'end')).toBeQueryValue([6n, true, 4]);

    result = data.truncate(BigInt(10));
    expect(result.isOk()).toEqual(true);
    expect(data.query('start', 'end')).toBeQueryValue([10n, true, 0]);

    result = data.truncate(BigInt(10));
    expect(result.isOk()).toEqual(true);
    expect(data.query('start', 'end')).toBeQueryValue([10n, true, 0]);
  })

  it('should support paged query', () => {
    const data = new SimpleEventLog<TestLogEntry>;
    for (let i = 0; i < 15; i ++)
      data.addEntry(testLogEntry(i), BigInt(i))

    expect(data.query('start', 'end')).toBeQueryValue([0n, false, 10]);
    expect(data.query(10n, 'end')).toBeQueryValue([10n, true, 5]);

    expect(data.query('start', 10n)).toBeQueryValue([0n, true, 10]);
    expect(data.query(10n, 20n)).toBeQueryValue([10n, true, 5]);
  })

  it('should support snapshot query', () => {
    const data = new SimpleEventLog<TestLogEntry>;
    for (let i = 0; i < 10; i ++)
      data.addEntry(testLogEntry(i), BigInt(i))

    data.setMetadata(4n, { snapshot: "snap" });

    expect(data.query('snapshot', 'end')).toBeQueryValue([4n, true, 6]);
  })
})