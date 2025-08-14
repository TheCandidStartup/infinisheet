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

  bench('write 1k entries', async () => {
    await writeEntries(100, 10, 990n, 10);
  }, { time: 1000, iterations: 10, warmupIterations: 1, throws: true })

  bench('read 1k entries', async () => {
    await readEntries(990n, 10);
  }, { time: 1000, iterations: 10, warmupIterations: 1, throws: true })

  bench('write 2k entries', async () => {
    await writeEntries(100, 20, 1980n, 10);
  }, { time: 1000, iterations: 10, warmupIterations: 1, throws: true })

  bench('read 2k entries', async () => {
    await readEntries(1980n, 20);
  }, { time: 1000, iterations: 10, warmupIterations: 1, throws: true })

  bench('write 4k entries', async () => {
    await writeEntries(100, 40, 3960n, 10);
  }, { time: 1000, iterations: 5, warmupIterations: 1, throws: true })

  bench('read 4k entries', async () => {
    await readEntries(3960n, 40);
  }, { time: 1000, iterations: 5, warmupIterations: 1, throws: true })

  bench('write 8K entries', async () => {
    await writeEntries(100, 80, 7920n, 10);
  }, { time: 1000, iterations: 5, warmupIterations: 1, throws: true })

  bench('read 8K entries', async () => {
    await readEntries(7920n, 80);
  }, { time: 1000, iterations: 5, warmupIterations: 1, throws: true })

  bench('write 16K entries', async () => {
    await writeEntries(1000, 16, 15939n, 10);
  }, { time: 1000, iterations: 1, warmupIterations: 0, throws: true })

  bench('read 16K entries', async () => {
    await readEntries(15939n, 61);
  }, { time: 1000, iterations: 1, warmupIterations: 0, throws: true })

  bench('write 24K entries', async () => {
    await writeEntries(1000, 24, 23958n, 10);
  }, { time: 1000, iterations: 1, warmupIterations: 0, throws: true })

  bench('read 24K entries', async () => {
    await readEntries(23958n, 42);
  }, { time: 1000, iterations: 1, warmupIterations: 0, throws: true })

  bench('write 32K entries', async () => {
    await writeEntries(1000, 32, 31977n, 10);
  }, { time: 1000, iterations: 1, warmupIterations: 0, throws: true })

  bench('read 32K entries', async () => {
    await readEntries(31977n, 23);
  }, { time: 1000, iterations: 1, warmupIterations: 0, throws: true })

  bench('write 40K entries', async () => {
    await writeEntries(1000, 40, 39996n, 4);
  }, { time: 1000, iterations: 1, warmupIterations: 0, throws: true })

  bench('read 40K entries', async () => {
    await readEntries(39996n, 4);
  }, { time: 1000, iterations: 1, warmupIterations: 0, throws: true })
})
