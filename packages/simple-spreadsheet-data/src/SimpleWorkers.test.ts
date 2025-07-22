import { SimpleWorker, SimpleWorkerHost } from './SimpleWorkers';
import { PendingWorkflowMessage } from '@candidstartup/infinisheet-types';


describe('SimpleWorkers', () => {
  it('isHost', () => {
    const worker = new SimpleWorker<PendingWorkflowMessage>;
    const host = new SimpleWorkerHost<PendingWorkflowMessage>(worker);
    expect(host.isHost()).toBeTruthy();
  })

  it('should throw if no handler', () => {
    const worker = new SimpleWorker<PendingWorkflowMessage>;
    const host = new SimpleWorkerHost<PendingWorkflowMessage>(worker);
    expect(() => host.postMessage({ type: 'PendingWorkflowMessage', workflow: "test", sequenceId: 0n })).toThrow(Error);
  })
})
