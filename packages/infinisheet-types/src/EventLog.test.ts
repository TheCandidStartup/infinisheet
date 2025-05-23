import { conflictError } from "./EventLog";

describe('conflictError', () => {
  it('should construct', () => {
    const error = conflictError("test", 42n);
    expect(error.type).toEqual('ConflictError');
    expect(error.message).toEqual("test");
    expect(error.nextSequenceId).toEqual(42n);
  })
})
