import { EventSourcedSpreadsheetData, EventSourcedSpreadsheetDataOptions } from './EventSourcedSpreadsheetData'
import { EventSourcedSpreadsheetWorkflow } from './EventSourcedSpreadsheetWorkflow'
import { SpreadsheetData, EventLog, PendingWorkflowMessage, storageError } from '@candidstartup/infinisheet-types'
import { DelayEventLog, DelayBlobStore, SimpleEventLog, SimpleBlobStore, 
  SimpleWorkerHost, SimpleWorker } from '@candidstartup/simple-spreadsheet-data'
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

function enableSyncOnce(data: SpreadsheetData<unknown>) {
  const unsubscribe = data.subscribe(() => {
     unsubscribe();
  })
}

function creator(eventLog: SimpleEventLog<SpreadsheetLogEntry> = new SimpleEventLog<SpreadsheetLogEntry>, 
                 wrapperLog: EventLog<SpreadsheetLogEntry> = eventLog,
                options?: EventSourcedSpreadsheetDataOptions) {
  const worker = new SimpleWorker<PendingWorkflowMessage>;
  const host = new SimpleWorkerHost(worker);
  const blobStore = new SimpleBlobStore;
  eventLog.workerHost = host;
  
  // Constructor subscribes to worker's onReceiveMessage which keeps it alive
  new EventSourcedSpreadsheetWorkflow(wrapperLog, blobStore, worker);

  return new EventSourcedSpreadsheetData(wrapperLog, blobStore, host, options);
}

describe('EventSourcedSpreadsheetData', () => {
  afterEach(() => {
    vi.useRealTimers();
  })

  spreadsheetDataInterfaceTests(creator, true, 1);

  function itCompletesInitialLoad(description: string, options?: EventSourcedSpreadsheetDataOptions) {
    it("completes initial load ".concat(description), async () => {
      const eventLog = new SimpleEventLog<SpreadsheetLogEntry>;
      const data = creator(eventLog, eventLog, options);
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
  };

  itCompletesInitialLoad('from empty log');
  itCompletesInitialLoad('from empty log and viewport', { viewportEmpty: true });

  it('subscribe should fire after initial load', async () => {
    const data = creator();

    const mock = vi.fn();
    const unsubscribe = data.subscribe(mock);

    await subscribeFired(data);
    expect(mock).toHaveBeenCalledTimes(1);

    await data.setCellValueAndFormat(0, 0, "In A1", undefined);
    expect(mock).toHaveBeenCalledTimes(2);

    await data.setCellValueAndFormat(0, 0, 42, undefined);
    expect(mock).toHaveBeenCalledTimes(3);

    unsubscribe();
    await data.setCellValueAndFormat(0, 0, false, undefined);
    expect(mock).toHaveBeenCalledTimes(3);
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

  it('should load from event log despite setViewport interference', async () => {
    vi.useFakeTimers();

    const log = new  SimpleEventLog<SpreadsheetLogEntry>;
    for (let i = 0; i < 20; i ++) {
      const result = await log.addEntry({ type: 'SetCellValueAndFormat', row: i, column: 0, value: i}, BigInt(i));
      expect(result).toBeOk();
    }
    const data = creator(log);
    data.setViewport({ rowMinOffset: 0, columnMinOffset: 0, width: 1000, height: 1000 });

    await subscribeFired(data);
    await vi.runAllTimersAsync();

    const snapshot = data.getSnapshot();
    const status = data.getLoadStatus(snapshot);
    expect(status.isOk() && status.value).toBe(true);
    expect(data.getRowCount(snapshot)).toEqual(20);
    expect(data.getCellValue(snapshot, 9, 0)).toEqual(9);
    expect(data.getCellValue(snapshot, 19, 0)).toEqual(19);
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
    expect(data2["content"].logSegment.entries.length).toEqual(1);

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
    expect(data["content"].logSegment.entries.length).toEqual(5);

    const dataSnapshot33 = data.getSnapshot();
    expect(data.getRowCount(dataSnapshot33)).toEqual(33);
    expect(data.getColumnCount(dataSnapshot33)).toEqual(1);
    for (let i = 0; i < 33; i ++) 
      expect(data.getCellValue(dataSnapshot33, i, 0)).toEqual(i);

    // Query should find next snapshot
    queryValue = expectUnwrap(await log.query('snapshot', 'end'));
    expect(queryValue.startSequenceId).toEqual(28n);
    expect(queryValue.entries.length).toEqual(5);
  })

  it('should update value despite setViewport interference', async () => {
    vi.useFakeTimers();

    const blobStore = new SimpleBlobStore;
    const worker = new SimpleWorker<PendingWorkflowMessage>;
    const host = new SimpleWorkerHost(worker);
    const log = new  SimpleEventLog<SpreadsheetLogEntry>(host);
    {
      // Force snapshot to be created on log
      new EventSourcedSpreadsheetWorkflow(log, blobStore, worker);

      const data1 = new EventSourcedSpreadsheetData(log, blobStore, host,  { snapshotInterval: 15 });
      await subscribeFired(data1);

      for (let i = 0; i < 20; i ++) {
        const result = await data1.setCellValueAndFormat(i, 0, i, undefined);
        expect(result).toBeOk();
      }
      await vi.runAllTimersAsync();
    }

    const data = new EventSourcedSpreadsheetData(log, blobStore, host, { viewportEmpty: true });
    const resultAsync = data.setCellValueAndFormat(0, 0, 42, undefined);
    data.setViewport({ rowMinOffset: 0, columnMinOffset: 0, width: 1000, height: 1000 });

    await subscribeFired(data);
    await vi.runAllTimersAsync();
    const result = await resultAsync;

    expect(result).toBeOk();

    const snapshot = data.getSnapshot();
    const status = data.getLoadStatus(snapshot);
    expect(status.isOk() && status.value).toBe(true);
    expect(data.getRowCount(snapshot)).toEqual(20);
    expect(data.getCellValue(snapshot, 0, 0)).toEqual(42);
    expect(data.getCellValue(snapshot, 9, 0)).toEqual(9);
    expect(data.getCellValue(snapshot, 19, 0)).toEqual(19);
  })

  it('should coalesce multiple setViewports', async () => {
    vi.useFakeTimers();

    const blobStore = new DelayBlobStore(new SimpleBlobStore);
    const worker = new SimpleWorker<PendingWorkflowMessage>;
    const host = new SimpleWorkerHost(worker);
    const log = new  SimpleEventLog<SpreadsheetLogEntry>(host);
    {
      // Force snapshot to be created on log
      new EventSourcedSpreadsheetWorkflow(log, blobStore, worker);

      const data1 = new EventSourcedSpreadsheetData(log, blobStore, host,  { snapshotInterval: 15 });
      await subscribeFired(data1);

      for (let i = 0; i < 20; i ++) {
        const result = await data1.setCellValueAndFormat(i, 0, i, undefined);
        expect(result).toBeOk();
      }
      await vi.runAllTimersAsync();
    }

    // Coalesce after first setViewpoint loads tiles
    {
      const data = new EventSourcedSpreadsheetData(log, blobStore, host, { viewportEmpty: true });
      await vi.advanceTimersByTimeAsync(0);

      const mock = vi.fn();
      const unsubscribe = data.subscribe(mock);

      // Should run up to point of loading tile from blob store, one notify from start of setViewpoint
      blobStore.delay = 100;
      data.setViewport({ rowMinOffset: 0, columnMinOffset: 0, width: 100, height: 100 });
      await vi.advanceTimersByTimeAsync(0);
      expect(mock).toHaveBeenCalledTimes(1);

      // Run second setViewpoint to completion, two additional notifies from start and end of setViewpoint
      blobStore.delay = 0;
      data.setViewport({ rowMinOffset: 100, columnMinOffset: 0, width: 100, height: 100 });
      await vi.advanceTimersByTimeAsync(0);
      expect(mock).toHaveBeenCalledTimes(3);

      // First setViewpoint should now complete and find content no longer compatible, skipping update
      // and notify.
      await vi.advanceTimersByTimeAsync(100);
      expect(mock).toHaveBeenCalledTimes(3);
      unsubscribe();

      // TODO - when multi-tile snapshots implemented confirm that tile for first viewport wasn't loaded
      const snapshot = data.getSnapshot();
      const status = data.getLoadStatus(snapshot);
      expect(status.isOk() && status.value).toBe(true);
      expect(data.getRowCount(snapshot)).toEqual(20);
      expect(data.getCellValue(snapshot, 9, 0)).toEqual(9);
      expect(data.getCellValue(snapshot, 19, 0)).toEqual(19);
      expect(data.getViewport(snapshot)).toEqual({ rowMinOffset: 100, columnMinOffset: 0, width: 100, height: 100 });
    }

    // Coalesce at start of chain
    {
      const data = new EventSourcedSpreadsheetData(log, blobStore, host, { viewportEmpty: true });

      const mock = vi.fn();
      const unsubscribe = data.subscribe(mock);

      // Notifies at start of both setViewpoints, all async operations pending
      data.setViewport({ rowMinOffset: 0, columnMinOffset: 0, width: 100, height: 100 });
      data.setViewport({ rowMinOffset: 100, columnMinOffset: 0, width: 100, height: 100 });
      expect(mock).toHaveBeenCalledTimes(2);

      // All pending async operations run
      // Notify from data constructor syncLogsAsync complete
      // Notify from first setViewpoint ignored as second changed range
      // Notify from second setViewpoint
      await vi.advanceTimersByTimeAsync(0);
      unsubscribe();
      expect(mock).toHaveBeenCalledTimes(4);

      // TODO - when multi-tile snapshots implemented confirm that tile for first viewport wasn't loaded
      const snapshot = data.getSnapshot();
      const status = data.getLoadStatus(snapshot);
      expect(status.isOk() && status.value).toBe(true);
      expect(data.getRowCount(snapshot)).toEqual(20);
      expect(data.getCellValue(snapshot, 9, 0)).toEqual(9);
      expect(data.getCellValue(snapshot, 19, 0)).toEqual(19);
      expect(data.getViewport(snapshot)).toEqual({ rowMinOffset: 100, columnMinOffset: 0, width: 100, height: 100 });
    }

    // Coalesce with undefined viewport (load all)
    {
      const data = new EventSourcedSpreadsheetData(log, blobStore, host, { viewportEmpty: true });

      const mock = vi.fn();
      const unsubscribe = data.subscribe(mock);

      // Notifies at start of both setViewpoints, all async operations pending
      data.setViewport({ rowMinOffset: 0, columnMinOffset: 0, width: 100, height: 100 });
      data.setViewport(undefined);
      expect(mock).toHaveBeenCalledTimes(2);

      // All pending async operations run
      // Notify from data constructor syncLogsAsync complete
      // Notify from first setViewpoint ignored as second changed range
      // Notify from second setViewpoint
      await vi.advanceTimersByTimeAsync(0);
      unsubscribe();
      expect(mock).toHaveBeenCalledTimes(4);

      // TODO - when multi-tile snapshots implemented confirm that tile for first viewport wasn't loaded
      const snapshot = data.getSnapshot();
      const status = data.getLoadStatus(snapshot);
      expect(status.isOk() && status.value).toBe(true);
      expect(data.getRowCount(snapshot)).toEqual(20);
      expect(data.getCellValue(snapshot, 9, 0)).toEqual(9);
      expect(data.getCellValue(snapshot, 19, 0)).toEqual(19);
      expect(data.getViewport(snapshot)).toEqual(undefined);
    }
  })

  it('should setViewport despite update value interference', async () => {
    vi.useFakeTimers();

    const blobStore = new SimpleBlobStore;
    const worker = new SimpleWorker<PendingWorkflowMessage>;
    const host = new SimpleWorkerHost(worker);
    const log = new  SimpleEventLog<SpreadsheetLogEntry>(host);
    {
      // Force snapshot to be created on log
      new EventSourcedSpreadsheetWorkflow(log, blobStore, worker);

      const data1 = new EventSourcedSpreadsheetData(log, blobStore, host,  { snapshotInterval: 15 });
      await subscribeFired(data1);

      for (let i = 0; i < 20; i ++) {
        const result = await data1.setCellValueAndFormat(i, 0, i, undefined);
        expect(result).toBeOk();
      }
      await vi.runAllTimersAsync();
    }

    const data = new EventSourcedSpreadsheetData(log, blobStore, host, { viewportEmpty: true });
    {
      const syncDone = await data.setCellValueAndFormat(0, 0, 77, undefined);
      expect(syncDone).toBeOk();
      const resultAsync = data.setCellValueAndFormat(0, 0, 42, undefined);
      data.setViewport({ rowMinOffset: 0, columnMinOffset: 0, width: 1000, height: 1000 });
      const result = await resultAsync;
      await vi.runAllTimersAsync();
      expect(result).toBeOk();
      const snapshot = data.getSnapshot();
      const status = data.getLoadStatus(snapshot);
      expect(status.isOk() && status.value).toBe(true);
      expect(data.getRowCount(snapshot)).toEqual(20);
      expect(data.getCellValue(snapshot, 0, 0)).toEqual(42);
      expect(data.getCellValue(snapshot, 9, 0)).toEqual(9);
      expect(data.getCellValue(snapshot, 19, 0)).toEqual(19);
    }
  })

  it('should save and load snapshots with two clients', async () => {
    vi.useFakeTimers();

    const blobStore = new SimpleBlobStore;
    const worker = new SimpleWorker<PendingWorkflowMessage>;
    const host = new SimpleWorkerHost(worker, 30000);
    const log = new  SimpleEventLog<SpreadsheetLogEntry>(host);
    new EventSourcedSpreadsheetWorkflow(log, blobStore, worker);

    const dataA = new EventSourcedSpreadsheetData(log, blobStore, host,  { snapshotInterval: 15 });
    await subscribeFired(dataA);

    const dataB = new EventSourcedSpreadsheetData(log, blobStore, host );
    await subscribeFired(dataB);

    for (let i = 0; i < 15; i ++)
      expect(await dataA.setCellValueAndFormat(i, 0, i, undefined)).toBeOk();

    // Final set should have triggered snapshot. Enable sync on client B and wait for all async ops to complete.
    // B should sync up after 10 seconds
    // Snapshot completes after 30
    enableSyncOnce(dataB);
    await vi.runAllTimersAsync();
    expect(dataB["content"].logSegment.entries.length).toEqual(15);
    expect(dataB["content"].logSegment.snapshotId).toBeUndefined();

    const dataBSnapshot15 = dataB.getSnapshot();
    expect(dataB.getRowCount(dataBSnapshot15)).toEqual(15);
    expect(dataB.getColumnCount(dataBSnapshot15)).toEqual(1);
    expect(dataB.getCellValue(dataBSnapshot15, 5, 0)).toEqual(5);

    // Add a load more entries to original, triggering another snapshot
    for (let i = 15; i < 33; i ++)
      expect(await dataA.setCellValueAndFormat(i, 0, i, undefined)).toBeOk();

    // Snapshot triggered + a few more log writes. Wait for snapshot to complete
    await vi.runAllTimersAsync();

    // Sync client B which should pick up most recent snapshot and create new segment
    enableSyncOnce(dataB);
    await vi.runAllTimersAsync();
    expect(dataB["content"].logSegment.entries.length).toEqual(5);
    expect(dataB["content"].logSegment.snapshotId).toEqual("28");

    const dataBSnapshot33 = dataB.getSnapshot();
    expect(dataB.getRowCount(dataBSnapshot15)).toEqual(15);
    expect(dataB.getRowCount(dataBSnapshot33)).toEqual(33);
    expect(dataB.getColumnCount(dataBSnapshot33)).toEqual(1);
    for (let i = 0; i < 33; i ++) 
      expect(dataB.getCellValue(dataBSnapshot33, i, 0)).toEqual(i);

    // Trigger another snapshot
    for (let i = 33; i < 50; i ++)
      expect(await dataA.setCellValueAndFormat(i, 0, i, undefined)).toBeOk();

    // Let other client sync up with log *before* snapshot completes
    enableSyncOnce(dataB);
    await vi.advanceTimersByTimeAsync(15000);
    expect(dataB["content"].logSegment.entries.length).toEqual(22);
    expect(dataB["content"].logSegment.snapshotId).toEqual("28");

    const dataBSnapshot50 = dataB.getSnapshot();
    expect(dataB.getRowCount(dataBSnapshot15)).toEqual(15);
    expect(dataB.getRowCount(dataBSnapshot33)).toEqual(33);
    expect(dataB.getRowCount(dataBSnapshot50)).toEqual(50);
    expect(dataB.getColumnCount(dataBSnapshot50)).toEqual(1);
    for (let i = 0; i < 50; i ++) 
      expect(dataB.getCellValue(dataBSnapshot50, i, 0)).toEqual(i);

    // Wait for snapshot to complete
    await vi.runAllTimersAsync();

    // Run another sync of client B. Subscribe doesn't fire because no new entries. 
    // New snapshot is ignored.
    enableSyncOnce(dataB);
    await vi.advanceTimersByTimeAsync(15000);
    expect(dataB["content"].logSegment.entries.length).toEqual(22);
    expect(dataB["content"].logSegment.snapshotId).toEqual("28");

    // After adding another entry, sync happens and log segment is forked at snapshot
    expect(await dataA.setCellValueAndFormat(50, 0, 50, undefined)).toBeOk();
    await vi.advanceTimersByTimeAsync(15000);
    expect(dataB["content"].logSegment.entries.length).toEqual(9);
    expect(dataB["content"].logSegment.snapshotId).toEqual("42");
  })

  it('setCellValueAndFormat should handle interference from syncLogs', async () => {
    vi.useFakeTimers();

    const blobStore = new SimpleBlobStore;
    const worker = new SimpleWorker<PendingWorkflowMessage>;
    const host = new SimpleWorkerHost(worker);
    const log = new DelayEventLog(new SimpleEventLog<SpreadsheetLogEntry>(host));
    new EventSourcedSpreadsheetWorkflow(log, blobStore, worker);

    const dataA = new EventSourcedSpreadsheetData(log, blobStore, host );
    const mockA = vi.fn();
    const unsubscribeA = dataA.subscribe(mockA);

    const dataB = new EventSourcedSpreadsheetData(log, blobStore, host );
    const mockB = vi.fn();
    const unsubscribeB = dataB.subscribe(mockB);

    await vi.advanceTimersByTimeAsync(0);
    expect(mockA).toHaveBeenCalledTimes(1);
    expect(mockB).toHaveBeenCalledTimes(1);

    // Interference after log.addEntry succeeds
    {
      // Waiting on result from log.addEntry
      log.delay = 25000;
      const result = dataA.setCellValueAndFormat(0, 0, 42, undefined);
      await vi.advanceTimersByTimeAsync(0);
      log.delay = 0;
      expect(mockA).toHaveBeenCalledTimes(1);
      expect(mockB).toHaveBeenCalledTimes(1);

      // Advance time far enough to trigger another syncLogs
      await vi.advanceTimersByTimeAsync(10000);
      expect(mockA).toHaveBeenCalledTimes(2);
      expect(mockB).toHaveBeenCalledTimes(2);

      // Add another entry to the log using client B
      expect(await dataB.setCellValueAndFormat(1, 1, 77, undefined)).toBeOk();
      expect(mockA).toHaveBeenCalledTimes(2);
      expect(mockB).toHaveBeenCalledTimes(3);

      const snapshotB = dataB.getSnapshot();
      expect(dataB.getRowCount(snapshotB)).toEqual(2);
      expect(dataB.getColumnCount(snapshotB)).toEqual(2);
      expect(dataB.getCellValue(snapshotB, 0, 0)).toEqual(42);
      expect(dataB.getCellValue(snapshotB, 1, 1)).toEqual(77);

      // Advance time far enough to trigger second syncLogs
      await vi.advanceTimersByTimeAsync(10000);
      expect(mockA).toHaveBeenCalledTimes(3);
      expect(mockB).toHaveBeenCalledTimes(3);

      // Advance to complete original setCellValueAndFormat. Should notice syncLogs has already updated content
      await vi.advanceTimersByTimeAsync(10000);
      expect(mockA).toHaveBeenCalledTimes(3);
      expect(mockB).toHaveBeenCalledTimes(3);
      expect(await result).toBeOk();

      const snapshotA = dataA.getSnapshot();
      expect(dataA.getRowCount(snapshotA)).toEqual(2);
      expect(dataA.getColumnCount(snapshotA)).toEqual(2);
      expect(dataA.getCellValue(snapshotA, 0, 0)).toEqual(42);
      expect(dataA.getCellValue(snapshotA, 1, 1)).toEqual(77);
    }

    // Interference after log.addEntry fails
    {
      // Add another entry to the log using client B
      expect(await dataB.setCellValueAndFormat(2, 0, 63, undefined)).toBeOk();
      expect(mockA).toHaveBeenCalledTimes(3);
      expect(mockB).toHaveBeenCalledTimes(4);

      // Add conflicting entry to log using client A and wait on result
      log.delay = 15000;
      const result = dataA.setCellValueAndFormat(0, 2, 99, undefined);
      await vi.advanceTimersByTimeAsync(0);
      log.delay = 0;
      expect(mockA).toHaveBeenCalledTimes(3);
      expect(mockB).toHaveBeenCalledTimes(4);

      // Advance time far enough to trigger another syncLogs
      await vi.advanceTimersByTimeAsync(10000);
      expect(mockA).toHaveBeenCalledTimes(4);
      expect(mockB).toHaveBeenCalledTimes(4);

      // Advance time far enough for result to be returned
      await vi.advanceTimersByTimeAsync(10000);
      expect(mockA).toHaveBeenCalledTimes(4);
      expect(mockB).toHaveBeenCalledTimes(4);
      const value = await result;
      expect(value.isErr()).toEqual(true);
      expect(value._unsafeUnwrapErr()).toEqual(storageError("Client out of sync", 409));

      const snapshotA = dataA.getSnapshot();
      expect(dataA.getRowCount(snapshotA)).toEqual(3);
      expect(dataA.getColumnCount(snapshotA)).toEqual(2);
      expect(dataA.getCellValue(snapshotA, 0, 0)).toEqual(42);
      expect(dataA.getCellValue(snapshotA, 1, 1)).toEqual(77);
      expect(dataA.getCellValue(snapshotA, 2, 0)).toEqual(63);
      expect(dataA.getCellValue(snapshotA, 0, 2)).toEqual(undefined);
    }

    // Conflict discovered during syncLogs
    {
      // Add entry to the log using client B
      expect(await dataB.setCellValueAndFormat(3, 0, 57, undefined)).toBeOk();
      expect(mockA).toHaveBeenCalledTimes(4);
      expect(mockB).toHaveBeenCalledTimes(5);

      // Add conflicting entry to log using client A and wait on result
      log.delay = 15000;
      const result = dataA.setCellValueAndFormat(0, 3, 33, undefined);
      await vi.advanceTimersByTimeAsync(0);
      log.delay = 0;
      expect(mockA).toHaveBeenCalledTimes(4);
      expect(mockB).toHaveBeenCalledTimes(5);

      // Advance time far enough to trigger syncLogs which will stop at query
      log.delay = 8000;
      await vi.advanceTimersByTimeAsync(10000);
      log.delay = 0;
      expect(mockA).toHaveBeenCalledTimes(4);
      expect(mockB).toHaveBeenCalledTimes(5);

      // Advance time far enough for result to be returned
      // Should bail out because syncLogs is active
      await vi.advanceTimersByTimeAsync(5000);
      expect(mockA).toHaveBeenCalledTimes(4);
      expect(mockB).toHaveBeenCalledTimes(5);
      const value = await result;
      expect(value.isErr()).toEqual(true);
      expect(value._unsafeUnwrapErr()).toEqual(storageError("Client out of sync", 409));

      // Enough for syncLogs to complete
      await vi.advanceTimersByTimeAsync(3000);
      expect(mockA).toHaveBeenCalledTimes(5);
      expect(mockB).toHaveBeenCalledTimes(5);

      const snapshotA = dataA.getSnapshot();
      expect(dataA.getRowCount(snapshotA)).toEqual(4);
      expect(dataA.getColumnCount(snapshotA)).toEqual(2);
      expect(dataA.getCellValue(snapshotA, 0, 0)).toEqual(42);
      expect(dataA.getCellValue(snapshotA, 1, 1)).toEqual(77);
      expect(dataA.getCellValue(snapshotA, 2, 0)).toEqual(63);
      expect(dataA.getCellValue(snapshotA, 0, 2)).toEqual(undefined);
      expect(dataA.getCellValue(snapshotA, 3, 0)).toEqual(57);
      expect(dataA.getCellValue(snapshotA, 0, 3)).toEqual(undefined);
    }

    unsubscribeA();
    unsubscribeB();
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
