import type { EventLog } from './EventLog';
import { testLogEntry, TestLogEntry } from '../../../shared/test/TestLogEntry';
import type { LogMetadata } from '@candidstartup/infinisheet-types';

export function eventLogInterfaceTests(creator: () => EventLog<TestLogEntry>) {
describe('EventLog Interface', () => {
  it('should start out empty', async () => {
    const data = creator();

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
    const data = creator();

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

    addResult = await data.addEntry(testLogEntry(2), 2n, 0n);
    expect(addResult.isOk()).toEqual(true);
    expect(addResult._unsafeUnwrap().lastSnapshot).toBeUndefined();

    await data.setMetadata(1n, { snapshot: "snap" });

    addResult = await data.addEntry(testLogEntry(3), 3n, 0n);
    expect(addResult.isOk()).toEqual(true);
    expect(addResult._unsafeUnwrap().lastSnapshot?.sequenceId).toEqual(1n);
    expect(addResult._unsafeUnwrap().lastSnapshot?.blobId).toEqual("snap");
  })

  // Note that declaring snapshot property in this way results in
  // constructor implicitly creating this.snapshot with value undefined.
  class ExtraPropsMetaData implements LogMetadata {
    constructor() { this.index = 42; }
    index: number;
    snapshot?: string | undefined;
  }

  it('should support setMetadata', async () => {
    const data = creator();
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

    // Set properties to undefined
    await data.setMetadata(0n, { pending: undefined });
    result = await data.query('start', 'end');
    expect(result).toBeQueryValue([0n, true, 1]);
    expect(result._unsafeUnwrap().entries[0]).toHaveProperty("snapshot", "snap");
    expect(result._unsafeUnwrap().entries[0]).toHaveProperty("history", "hist2");
    expect(result._unsafeUnwrap().entries[0]).toHaveProperty("pending", undefined);

    // Extra non-metadata properties should be ignored
    await data.setMetadata(0n, new ExtraPropsMetaData);
    result = await data.query('start', 'end');
    expect(result).toBeQueryValue([0n, true, 1]);
    expect(result._unsafeUnwrap().entries[0]).toHaveProperty("snapshot", undefined);
    expect(result._unsafeUnwrap().entries[0]).toHaveProperty("history", "hist2");
  })

  it('should support truncate', async () => {
    const data = creator();
    for (let i = 0; i < 10; i ++)
      await data.addEntry(testLogEntry(i), BigInt(i))
    expect(await data.query('start', 'end')).toBeQueryValue([0n, true, 10]);

    expect(await data.truncate(BigInt(-1))).toBeInfinisheetError("InfinisheetRangeError")

    expect(await data.truncate(BigInt(11))).toBeInfinisheetError("InfinisheetRangeError")

    expect(await data.truncate(BigInt(0))).toBeOk();
    expect(await data.query('start', 'end')).toBeQueryValue([0n, true, 10]);

    expect(await data.truncate(BigInt(4))).toBeOk();
    expect(await data.query('start', 'end')).toBeQueryValue([4n, true, 6]);

    expect(await data.truncate(BigInt(3))).toBeInfinisheetError("InfinisheetRangeError")

    expect(await data.truncate(BigInt(6))).toBeOk();
    expect(await data.query('start', 'end')).toBeQueryValue([6n, true, 4]);

    expect(await data.truncate(BigInt(10))).toBeOk();
    expect(await data.query('start', 'end')).toBeQueryValue([10n, true, 0]);

    expect(await data.truncate(BigInt(10))).toBeOk();
    expect(await data.query('start', 'end')).toBeQueryValue([10n, true, 0]);
  })

  it('should support paged query', async () => {
    const data = creator();
    for (let i = 0; i < 15; i ++)
      await data.addEntry(testLogEntry(i), BigInt(i))

    expect(await data.query('start', 'end')).toBeQueryValue([0n, false, 10]);
    expect(await data.query(10n, 'end')).toBeQueryValue([10n, true, 5]);

    expect(await data.query('start', 10n)).toBeQueryValue([0n, true, 10]);
    expect(await data.query(10n, 20n)).toBeQueryValue([10n, true, 5]);
  })

  it('should support snapshot query', async () => {
    const data = creator();
    for (let i = 0; i < 10; i ++)
      await data.addEntry(testLogEntry(i), BigInt(i))

    await data.setMetadata(4n, { snapshot: "snap" });

    expect(await data.query('start', 'end', 0n)).toBeQueryValue([0n, true, 10, { sequenceId: 4n, blobId: "snap" }]);
    expect(await data.query('snapshot', 'end')).toBeQueryValue([4n, true, 6]);
    expect(await data.query('start', 'end', 4n)).toBeQueryValue([0n, true, 10]);
  })
})
}
