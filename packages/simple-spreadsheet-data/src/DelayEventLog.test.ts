import { DelayEventLog } from './DelayEventLog';
import { SimpleEventLog } from './SimpleEventLog';
import type { TestLogEntry } from '../../../shared/test/TestLogEntry';
import { eventLogInterfaceTests } from '../../infinisheet-types/src/EventLog.interface-test'


describe('DelayEventLog', () => {
  eventLogInterfaceTests(() => new DelayEventLog(new SimpleEventLog<TestLogEntry>));

  // DelayEventLog specific tests go here
})
