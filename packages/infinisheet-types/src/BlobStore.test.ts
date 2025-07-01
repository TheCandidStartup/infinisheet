import { notBlobError, notBlobDirError, invalidBlobNameError, noContinuationError } from "./BlobStore";

describe('notBlobError', () => {
  it('should construct', () => {
    const error = notBlobError();
    expect(error.type).toEqual('BlobWrongKindError')
  })
})

describe('notBlobDirError', () => {
  it('should construct', () => {
    const error = notBlobDirError();
    expect(error.type).toEqual('BlobWrongKindError')
  })
})

describe('invalidBlobNameError', () => {
  it('should construct', () => {
    const error = invalidBlobNameError("test");
    expect(error.type).toEqual('InvalidBlobNameError')
    expect(error.message).toEqual("test")

    const error2 = invalidBlobNameError();
    expect(error2.type).toEqual('InvalidBlobNameError')
  })
})

describe('noContinuationError', () => {
  it('should construct', () => {
    const error = noContinuationError("test");
    expect(error.type).toEqual('NoContinuationError')
    expect(error.message).toEqual("test")

    const error2 = noContinuationError();
    expect(error2.type).toEqual('NoContinuationError')
  })
})