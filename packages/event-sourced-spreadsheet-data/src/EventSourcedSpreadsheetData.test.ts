import { EventSourcedSpreadsheetData } from './EventSourcedSpreadsheetData'
import { EventSourcedSpreadsheetWorkflow } from './EventSourcedSpreadsheetWorkflow'
import { SpreadsheetData, EventLog, PendingWorkflowMessage } from '@candidstartup/infinisheet-types'
import { DelayEventLog, SimpleEventLog, SimpleBlobStore, SimpleWorkerHost, SimpleWorker } from '@candidstartup/simple-spreadsheet-data'
import { SpreadsheetLogEntry } from './SpreadsheetLogEntry';
import { spreadsheetDataInterfaceTests } from '../../infinisheet-types/src/SpreadsheetData.interface-test'
import { expectUnwrap } from '../../../shared/test/utils'


function subscribeFired(data: SpreadsheetData<unknown>): Promise<void> {
  return new Promise((resolve) => {
    const unsubscribe = data.subscribe(() => {
      unsubscribe();
      resolve();
    })
  })
}

function creator(eventLog: SimpleEventLog<SpreadsheetLogEntry> = new SimpleEventLog<SpreadsheetLogEntry>, 
                 wrapperLog: EventLog<SpreadsheetLogEntry> = eventLog,
                snapshotInterval?: number) {
  const worker = new SimpleWorker<PendingWorkflowMessage>;
  const host = new SimpleWorkerHost(worker);
  const blobStore = new SimpleBlobStore;
  eventLog.workerHost = host;
  
  // Constructor subscribes to worker's onReceiveMessage which keeps it alive
  new EventSourcedSpreadsheetWorkflow(wrapperLog, blobStore, worker);

  return new EventSourcedSpreadsheetData(wrapperLog, blobStore, host, { snapshotInterval });
}

describe('EventSourcedSpreadsheetData', () => {
  afterEach(() => {
    vi.useRealTimers();
  })

  spreadsheetDataInterfaceTests(creator);

  it('should complete load from empty log', async () => {
    const data = creator();
    const snapshot = data.getSnapshot();
    const status = data.getLoadStatus(snapshot);
    expect(status.isOk() && !status.value).toBe(true);
    expect(data.getRowCount(snapshot)).toEqual(0);
    expect(data.getColumnCount(snapshot)).toEqual(0);
    expect(data.getCellValue(snapshot, 0, 0)).toEqual(undefined);
    expect(data.getCellFormat(snapshot, 0, 0)).toEqual(undefined);

    const rowMapping = data.getRowItemOffsetMapping(snapshot);
    expect(rowMapping.itemOffset(0)).toEqual(0);

    const columnMapping = data.getColumnItemOffsetMapping(snapshot);
    expect(columnMapping.itemOffset(0)).toEqual(0);

    await subscribeFired(data);
    const snapshot2 = data.getSnapshot();
    const status2 = data.getLoadStatus(snapshot2);
    expect(status2.isOk() && status2.value).toBe(true);
  })

  it('subscribe should fire after initial load', async () => {
    const data = creator();

    const mock = vi.fn();
    const unsubscribe = data.subscribe(mock);

    await subscribeFired(data);
    expect(mock).toBeCalledTimes(1);

    await data.setCellValueAndFormat(0, 0, "In A1", undefined);
    expect(mock).toBeCalledTimes(2);

    await data.setCellValueAndFormat(0, 0, 42, undefined);
    expect(mock).toBeCalledTimes(3);

    unsubscribe();
    await data.setCellValueAndFormat(0, 0, false, undefined);
    expect(mock).toBeCalledTimes(3);
  })

  it('should load from event log', async () => {
    const log = new  SimpleEventLog<SpreadsheetLogEntry>;
    for (let i = 0; i < 20; i ++) {
      const result = await log.addEntry({ type: 'SetCellValueAndFormat', row: i, column: 0, value: i}, BigInt(i));
      expect(result).toBeOk();
    }
    const data = creator(log);

    const snapshot1 = data.getSnapshot();
    const status1 = data.getLoadStatus(snapshot1);
    expect(status1.isOk() && !status1.value).toBe(true);
    expect(data.getRowCount(snapshot1)).toEqual(0);

    await subscribeFired(data);
    const snapshot2 = data.getSnapshot();
    const status2 = data.getLoadStatus(snapshot2);
    expect(status2.isOk() && !status2.value).toBe(true);
    expect(data.getRowCount(snapshot1)).toEqual(0);
    expect(data.getRowCount(snapshot2)).toEqual(10);
    expect(data.getCellValue(snapshot1, 9, 0)).toEqual(undefined);
    expect(data.getCellValue(snapshot2, 9, 0)).toEqual(9);

    await subscribeFired(data);
    const snapshot3 = data.getSnapshot();
    const status3 = data.getLoadStatus(snapshot3);
    expect(status3.isOk() && status3.value).toBe(true);
    expect(data.getRowCount(snapshot1)).toEqual(0);
    expect(data.getCellValue(snapshot1, 9, 0)).toEqual(undefined);
    expect(data.getRowCount(snapshot2)).toEqual(10);
    expect(data.getCellValue(snapshot2, 19, 0)).toEqual(undefined);
    expect(data.getRowCount(snapshot3)).toEqual(20);
    expect(data.getCellValue(snapshot3, 19, 0)).toEqual(19);
  })

  it('should save and load snapshots', async () => {
    vi.useFakeTimers();

    const blobStore = new SimpleBlobStore;
    const worker = new SimpleWorker<PendingWorkflowMessage>;
    const host = new SimpleWorkerHost(worker);
    const log = new  SimpleEventLog<SpreadsheetLogEntry>(host);
    new EventSourcedSpreadsheetWorkflow(log, blobStore, worker);

    const data = new EventSourcedSpreadsheetData(log, blobStore, host,  { snapshotInterval: 15 });
    await subscribeFired(data);

    for (let i = 0; i < 5; i ++) {
      const result = await data.setCellValueAndFormat(i, 0, i, undefined);
      expect(result).toBeOk();
    }

    const dataSnapshot5 = data.getSnapshot();
    expect(data.getRowCount(dataSnapshot5)).toEqual(5);
    expect(data.getColumnCount(dataSnapshot5)).toEqual(1);

    for (let i = 5; i < 15; i ++) {
      const result = await data.setCellValueAndFormat(i, 0, i, undefined);
      expect(result).toBeOk();
    }

    const dataSnapshot15 = data.getSnapshot();
    expect(data.getRowCount(dataSnapshot15)).toEqual(15);
    expect(data.getColumnCount(dataSnapshot15)).toEqual(1);
    expect(data.getCellValue(dataSnapshot15, 5, 0)).toEqual(5);

    // Final set should have triggered snapshot. Wait for all async ops to complete.
    await vi.runAllTimersAsync();

    // Snapshot taken before log snapshot should still be valid
    expect(data.getRowCount(dataSnapshot5)).toEqual(5);
    expect(data.getColumnCount(dataSnapshot5)).toEqual(1);

    // Query should find new snapshot
    let queryValue = expectUnwrap(await log.query('snapshot', 'end'));
    expect(queryValue.startSequenceId).toEqual(14n);
    expect(queryValue.entries.length).toEqual(1);

    // Single entry in result should have completed snapshot
    const snapshotEntry = queryValue.entries[0]!;
    expect(snapshotEntry.pending).toBeUndefined();
    expect(snapshotEntry.snapshot).toEqual("14");

    // Start new client from current state, should load everything from snapshot with empty log segment
    const data2 = new EventSourcedSpreadsheetData(log, blobStore);
    await subscribeFired(data2);
    await vi.runAllTimersAsync();
    expect(data2["content"].logSegment.entries.length).toEqual(0);

    const data2Snapshot15 = data2.getSnapshot();
    expect(data2.getRowCount(data2Snapshot15)).toEqual(15);
    expect(data2.getColumnCount(data2Snapshot15)).toEqual(1);
    expect(data2.getCellValue(data2Snapshot15, 5, 0)).toEqual(5);

    // Add a load more entries to original, triggering another snapshot
    for (let i = 15; i < 32; i ++) {
      const result = await data.setCellValueAndFormat(i, 0, i, undefined);
      expect(result).toBeOk();
    }

    // Snapshot triggered + a few more log writes. Wait for it to all sort itself out.
    await vi.runAllTimersAsync();

    // Additional log entry should notice new snapshot and fork segment
    expect(await data.setCellValueAndFormat(32, 0, 32, undefined)).toBeOk();
    expect(data["content"].logSegment.entries.length).toEqual(3);

    // Query should find next snapshot
    queryValue = expectUnwrap(await log.query('snapshot', 'end'));
    expect(queryValue.startSequenceId).toEqual(29n);
    expect(queryValue.entries.length).toEqual(4);
  })

  it('should handle delays', async () => {
    vi.useFakeTimers();

    const baseLog = new  SimpleEventLog<SpreadsheetLogEntry>;
    const log = new DelayEventLog(baseLog, 50000);
    const data = creator(baseLog, log);
    let subscribePromise = subscribeFired(data);

    // Subscribe should trigger new call to sync after 10 seconds while
    // initial sync in constructor is still waiting for query

    // Wait for the dust to settle, subscription should have fired
    await vi.runOnlyPendingTimersAsync();
    await subscribePromise;

    // Initial load should have completed, despite overlapping syncs
    const status = data.getLoadStatus(data.getSnapshot());
    expect(status.isOk() && status.value).toBe(true);

    // Set value, result available after time has elapsed, subscribe will trigger
    // a sync that happens before result is available. Should cope.
    const promise = data.setCellValueAndFormat(0, 0, 42, undefined);
    subscribePromise = subscribeFired(data);

    // When sync is triggered, make sure its processed before set complete.
    log.delay = 0;

    // Wait for the dust to settle, subscription should have fired, result should be available
    await vi.runOnlyPendingTimersAsync();
    await subscribePromise;

    const result = await promise;
    expect(result).toBeOk();
    const snapshot = data.getSnapshot();
    expect(data.getRowCount(snapshot)).toEqual(1);
    expect(data.getCellValue(snapshot, 0, 0)).toEqual(42);
  })

  it('should handle conflict', async () => {
    vi.useFakeTimers();

    const blobStore = new SimpleBlobStore;
    const worker = new SimpleWorker<PendingWorkflowMessage>;
    const host = new SimpleWorkerHost(worker);
    const log = new  SimpleEventLog<SpreadsheetLogEntry>(host);
    new EventSourcedSpreadsheetWorkflow(log, blobStore, worker);

    const delayA = new DelayEventLog(log, 5000);
    const dataA = new EventSourcedSpreadsheetData(delayA, blobStore);

    const delayB = new DelayEventLog(log, 50);
    const dataB = new EventSourcedSpreadsheetData(delayB, blobStore);

    // Spreadsheets synced up and ready to go
    await vi.runOnlyPendingTimersAsync();
    let status = dataA.getLoadStatus(dataA.getSnapshot());
    expect(status.isOk() && status.value).toBe(true);
    status = dataB.getLoadStatus(dataB.getSnapshot());
    expect(status.isOk() && status.value).toBe(true);

    // Change value in B which will complete in 50ms
    const promiseB = dataB.setCellValueAndFormat(0, 0, 42, undefined);
    expect(dataB.getCellValue(dataB.getSnapshot(), 0, 0)).toBeUndefined();
    await vi.advanceTimersByTimeAsync(50);
    expect(await promiseB).toBeOk();
    expect(dataB.getCellValue(dataB.getSnapshot(), 0, 0)).toEqual(42);
  
    // Try to change value in A which hasn't synced with B's change yet
    expect(dataA.getCellValue(dataA.getSnapshot(), 0, 0)).toBeUndefined();
    const promiseA = dataA.setCellValueAndFormat(0, 0, 17, undefined);
    expect(dataA.getCellValue(dataA.getSnapshot(), 0, 0)).toBeUndefined();
    await vi.runOnlyPendingTimersAsync();
    expect(await promiseA).toBeStorageError(409);

    // Discovery of conflict should schedule a sync
    await vi.runOnlyPendingTimersAsync();
    expect(dataA.getCellValue(dataA.getSnapshot(), 0, 0)).toEqual(42);
  })
})
