import { SimpleEventLog } from './SimpleEventLog';
import type { TestLogEntry } from '../../../shared/test/TestLogEntry';
import { eventLogInterfaceTests } from '../../infinisheet-types/src/EventLog.interface-test'


describe('SimpleEventLog', () => {
  eventLogInterfaceTests(() => new SimpleEventLog<TestLogEntry>);

  // SimplEventLog specific tests go here
})
