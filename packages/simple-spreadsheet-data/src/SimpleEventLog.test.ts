import { SimpleEventLog } from './SimpleEventLog';
import { eventLogInterfaceTests } from '../../infinisheet-types/src/EventLog.interface-test'
import { SimpleWorker, SimpleWorkerHost } from './SimpleWorkers';
import { PendingWorkflowMessage, okAsync } from '@candidstartup/infinisheet-types';
import { testLogEntry, TestLogEntry } from '../../../shared/test/TestLogEntry';


describe('SimpleEventLog', () => {
  eventLogInterfaceTests(() => new SimpleEventLog<TestLogEntry>);

  // SimplEventLog specific tests go here
  it('should support worker postMessage', async () => {
    vi.useFakeTimers();

    const mock = vi.fn(() => okAsync());
    const worker = new SimpleWorker<PendingWorkflowMessage>;
    worker.onReceiveMessage = mock;
    const host = new SimpleWorkerHost<PendingWorkflowMessage>(worker);
    const data = new SimpleEventLog<TestLogEntry>(host);

    let addResult = await data.addEntry(testLogEntry(0), 0n)
    expect(addResult.isOk()).toEqual(true);
    expect(mock).toBeCalledTimes(0);

    const entry = testLogEntry(1);
    entry.pending = 'snapshot';
    addResult = await data.addEntry(entry, 1n)
    expect(addResult.isOk()).toEqual(true);

    await vi.runAllTimersAsync();

    expect(mock).toHaveBeenCalled();

    vi.useRealTimers();
  })
})
