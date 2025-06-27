import { notBlobError, notBlobDirError, invalidBlobNameError } from "./BlobStore";

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
