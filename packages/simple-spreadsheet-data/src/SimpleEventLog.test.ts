import { SimpleEventLog } from './SimpleEventLog';
import { testLogEntry, TestLogEntry } from '../../../shared/test/TestLogEntry';
import type { LogMetadata } from '@candidstartup/infinisheet-types';


describe('SimpleEventLog', () => {
  it('should start out empty', async () => {
    const data = new SimpleEventLog<TestLogEntry>;

    let result = await data.query('start', 'end');
    expect(result).toBeQueryValue([0n, true, 0]);

    result = await data.query('snapshot', 'end');
    expect(result).toBeQueryValue([0n, true, 0]);

    result = await data.query(0n, 0n);
    expect(result).toBeQueryValue([0n, true, 0]);

    result = await data.query(0n, 5n);
    expect(result).toBeQueryValue([0n, true, 0]);

    result = await data.query(5n, 30n);
    expect(result).toBeInfinisheetError("InfinisheetRangeError");

    result = await data.query(-5n, 0n);
    expect(result).toBeInfinisheetError("InfinisheetRangeError");
  })

  it('should support addEntry', async () => {
    const data = new SimpleEventLog<TestLogEntry>;

    let addResult = await data.addEntry(testLogEntry(0), 0n)
    expect(addResult.isOk()).toEqual(true);

    let result = await data.query('start', 'end');
    expect(result).toBeQueryValue([0n, true, 1]);

    addResult = await data.addEntry(testLogEntry(1), 0n);
    expect(addResult.isErr()).toEqual(true);

    addResult = await data.addEntry(testLogEntry(1), 2n);
    expect(addResult.isErr()).toEqual(true);

    addResult = await data.addEntry(testLogEntry(1), 1n)
    expect(addResult.isOk()).toEqual(true);

    result = await data.query('start', 'end');
    expect(result).toBeQueryValue([0n, true, 2]);
  })

  // Note that declaring snapshot property in this way results in
  // constructor implicitly creating this.snapshot with value undefined.
  class ExtraPropsMetaData implements LogMetadata {
    constructor() { this.index = 42; }
    index: number;
    snapshot?: string | undefined;
  }

  it('should support setMetadata', async () => {
    const data = new SimpleEventLog<TestLogEntry>;
    await data.addEntry(testLogEntry(0), 0n);
    
    expect(await data.setMetadata(-1n, {})).toBeInfinisheetError("InfinisheetRangeError");
    expect(await data.setMetadata(1n, {})).toBeInfinisheetError("InfinisheetRangeError");

    await data.setMetadata(0n, {});
    let result = await data.query('start', 'end');
    expect(result).toBeQueryValue([0n, true, 1]);
    expect(result._unsafeUnwrap().entries[0]).not.toHaveProperty("snapshot");
    expect(result._unsafeUnwrap().entries[0]).not.toHaveProperty("history");
    expect(result._unsafeUnwrap().entries[0]).not.toHaveProperty("pending");

    await data.setMetadata(0n, { snapshot: "snap" });
    result = await data.query('start', 'end');
    expect(result).toBeQueryValue([0n, true, 1]);
    expect(result._unsafeUnwrap().entries[0]).toHaveProperty("snapshot", "snap");

    // Check that setting one property has no effect on others
    await data.setMetadata(0n, { history: "hist" });
    result = await data.query('start', 'end');
    expect(result).toBeQueryValue([0n, true, 1]);
    expect(result._unsafeUnwrap().entries[0]).toHaveProperty("snapshot", "snap");
    expect(result._unsafeUnwrap().entries[0]).toHaveProperty("history", "hist");

    // Set multiple properties
    await data.setMetadata(0n, { history: "hist2", pending: "pend" });
    result = await data.query('start', 'end');
    expect(result).toBeQueryValue([0n, true, 1]);
    expect(result._unsafeUnwrap().entries[0]).toHaveProperty("snapshot", "snap");
    expect(result._unsafeUnwrap().entries[0]).toHaveProperty("history", "hist2");
    expect(result._unsafeUnwrap().entries[0]).toHaveProperty("pending", "pend");

    // Extra non-metadata properties should be ignored
    await data.setMetadata(0n, new ExtraPropsMetaData);
    result = await data.query('start', 'end');
    expect(result).toBeQueryValue([0n, true, 1]);
    expect(result._unsafeUnwrap().entries[0]).toHaveProperty("snapshot", undefined);
    expect(result._unsafeUnwrap().entries[0]).toHaveProperty("history", "hist2");
  })

  it('should support truncate', async () => {
    const data = new SimpleEventLog<TestLogEntry>;
    for (let i = 0; i < 10; i ++)
      await data.addEntry(testLogEntry(i), BigInt(i))
    expect(await data.query('start', 'end')).toBeQueryValue([0n, true, 10]);

    let result = await data.truncate(BigInt(-1));
    expect(result).toBeInfinisheetError("InfinisheetRangeError")

    result = await data.truncate(BigInt(11));
    expect(result).toBeInfinisheetError("InfinisheetRangeError")

    result = await data.truncate(BigInt(0));
    expect(result.isOk()).toEqual(true);
    expect(await data.query('start', 'end')).toBeQueryValue([0n, true, 10]);

    result = await data.truncate(BigInt(4));
    expect(result.isOk()).toEqual(true);
    expect(await data.query('start', 'end')).toBeQueryValue([4n, true, 6]);

    result = await data.truncate(BigInt(3));
    expect(result).toBeInfinisheetError("InfinisheetRangeError")

    result = await data.truncate(BigInt(6));
    expect(result.isOk()).toEqual(true);
    expect(await data.query('start', 'end')).toBeQueryValue([6n, true, 4]);

    result = await data.truncate(BigInt(10));
    expect(result.isOk()).toEqual(true);
    expect(await data.query('start', 'end')).toBeQueryValue([10n, true, 0]);

    result = await data.truncate(BigInt(10));
    expect(result.isOk()).toEqual(true);
    expect(await data.query('start', 'end')).toBeQueryValue([10n, true, 0]);
  })

  it('should support paged query', async () => {
    const data = new SimpleEventLog<TestLogEntry>;
    for (let i = 0; i < 15; i ++)
      await data.addEntry(testLogEntry(i), BigInt(i))

    expect(await data.query('start', 'end')).toBeQueryValue([0n, false, 10]);
    expect(await data.query(10n, 'end')).toBeQueryValue([10n, true, 5]);

    expect(await data.query('start', 10n)).toBeQueryValue([0n, true, 10]);
    expect(await data.query(10n, 20n)).toBeQueryValue([10n, true, 5]);
  })

  it('should support snapshot query', async () => {
    const data = new SimpleEventLog<TestLogEntry>;
    for (let i = 0; i < 10; i ++)
      await data.addEntry(testLogEntry(i), BigInt(i))

    await data.setMetadata(4n, { snapshot: "snap" });

    expect(await data.query('snapshot', 'end')).toBeQueryValue([4n, true, 6]);
  })
})