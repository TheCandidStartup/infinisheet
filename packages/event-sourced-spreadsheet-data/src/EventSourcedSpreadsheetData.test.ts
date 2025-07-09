import { EventSourcedSpreadsheetData } from './EventSourcedSpreadsheetData'
import { EventSourcedSpreadsheetWorkflow } from './EventSourcedSpreadsheetWorkflow'
import { SpreadsheetData, EventLog, PendingWorkflowMessage } from '@candidstartup/infinisheet-types'
import { DelayEventLog, SimpleEventLog, SimpleBlobStore, SimpleWorkerHost, SimpleWorker } from '@candidstartup/simple-spreadsheet-data'
import { SpreadsheetLogEntry } from './SpreadsheetLogEntry';
import { spreadsheetDataInterfaceTests } from '../../infinisheet-types/src/SpreadsheetData.interface-test'


function subscribeFired(data: SpreadsheetData<unknown>): Promise<void> {
  return new Promise((resolve) => {
    const unsubscribe = data.subscribe(() => {
      unsubscribe();
      resolve();
    })
  })
}

function creator(eventLog: SimpleEventLog<SpreadsheetLogEntry> = new SimpleEventLog<SpreadsheetLogEntry>, 
                 wrapperLog: EventLog<SpreadsheetLogEntry> = eventLog) {
  const worker = new SimpleWorker<PendingWorkflowMessage>;
  const host = new SimpleWorkerHost(worker);
  const blobStore = new SimpleBlobStore;
  eventLog.workerHost = host;
  
  // Constructor subscribes to worker's onReceiveMessage which keeps it alive
  new EventSourcedSpreadsheetWorkflow(wrapperLog, blobStore, worker);

  return new EventSourcedSpreadsheetData(wrapperLog, blobStore, host);
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
})
