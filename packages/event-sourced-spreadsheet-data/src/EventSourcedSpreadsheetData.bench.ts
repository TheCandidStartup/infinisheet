import { bench } from 'vitest'

import { EventSourcedSpreadsheetData } from './EventSourcedSpreadsheetData'
import { EventSourcedSpreadsheetWorkflow } from './EventSourcedSpreadsheetWorkflow'
import { PendingWorkflowMessage, SpreadsheetData, SequenceId } from '@candidstartup/infinisheet-types'
import { SimpleEventLog, SimpleBlobStore, SimpleWorkerHost, SimpleWorker } from '@candidstartup/simple-spreadsheet-data'
import { SpreadsheetLogEntry } from './SpreadsheetLogEntry';
import { expectUnwrap } from '../../../shared/test/utils'

function subscribeFired(data: SpreadsheetData<unknown>): Promise<void> {
  return new Promise((resolve) => {
    const unsubscribe = data.subscribe(() => {
      unsubscribe();
      resolve();
    })
  })
}

describe('EventSourcedSpreadsheetData', () => {
  afterEach(() => {
    vi.useRealTimers();
  })

  let writeLog: SimpleEventLog<SpreadsheetLogEntry>|null = null;
  let writeStore: SimpleBlobStore|null = null;

  async function writeEntries(rows: number, cols: number, lastSnapshot: SequenceId, lastEntries: number) {
    vi.useFakeTimers();

    const blobStore = new SimpleBlobStore;
    const worker = new SimpleWorker<PendingWorkflowMessage>;
    const host = new SimpleWorkerHost(worker);
    const log = new  SimpleEventLog<SpreadsheetLogEntry>(host);
    new EventSourcedSpreadsheetWorkflow(log, blobStore, worker);

    const data = new EventSourcedSpreadsheetData(log, blobStore, host);
    await subscribeFired(data);

    for (let row = 0; row < rows; row ++) {
      for (let col = 0; col < cols; col ++) {
        const result = await data.setCellValueAndFormat(row, col, row+col, undefined);
        expect(result).toBeOk();

        // Make sure any async ops have completed
        await vi.runAllTimersAsync();
      }
    }

    // Query should find new snapshot
    const queryValue = expectUnwrap(await log.query('snapshot', 'end'));
    expect(queryValue.startSequenceId).toEqual(lastSnapshot);
    expect(queryValue.entries.length).toEqual(lastEntries);

    writeLog = log;
    writeStore = blobStore;

    vi.useRealTimers();
  }

  async function readEntries(lastSnapshot: SequenceId, lastEntries: number) {
    vi.useFakeTimers();

    if (!writeLog || !writeStore)
      throw Error("Nothing was written");

    // Start new client from current state, should load everything from snapshot with empty log segment
    const data2 = new EventSourcedSpreadsheetData(writeLog, writeStore);
    await subscribeFired(data2);
    await vi.runAllTimersAsync();
    expect(data2["content"].logSegment.snapshot).toEqual(lastSnapshot.toString());
    expect(data2["content"].logSegment.entries.length).toEqual(lastEntries);

    vi.useRealTimers();
  }

  bench('write 100 entries', async () => {
    await writeEntries(10, 10, 99n, 1);
  }, { time: 1000, iterations: 10, warmupIterations: 1, throws: true })

  bench('read 100 entries', async () => {
    await readEntries(99n, 1);
  }, { time: 1000, iterations: 10, warmupIterations: 1, throws: true })

  bench('write 1000 entries', async () => {
    await writeEntries(100, 10, 990n, 10);
  }, { time: 1000, iterations: 10, warmupIterations: 1, throws: true })

  bench('read 1000 entries', async () => {
    await readEntries(990n, 10);
  }, { time: 1000, iterations: 10, warmupIterations: 1, throws: true })

  bench('write 10000 entries', async () => {
    await writeEntries(100, 100, 9999n, 1);
  }, { time: 1000, iterations: 5, warmupIterations: 1, throws: true })

  bench('read 10000 entries', async () => {
    await readEntries(9999n, 1);
  }, { time: 1000, iterations: 5, warmupIterations: 1, throws: true })

    bench('write 100K entries', async () => {
    await writeEntries(1000, 100, 99990n, 10);
  }, { time: 1000, iterations: 1, warmupIterations: 1, throws: true })

  bench('read 100K entries', async () => {
    await readEntries(99990n, 10);
  }, { time: 1000, iterations: 1, warmupIterations: 1, throws: true })
})
