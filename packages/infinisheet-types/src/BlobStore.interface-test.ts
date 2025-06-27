import type { BlobStore } from './BlobStore';
import { StorageError } from './Error';

export function blobStoreInterfaceTests(creator: () => BlobStore<unknown>, pageSize: number) {
describe('BlobStore Interface', () => {
  it('should start out empty', async () => {
    const data = creator();
    const result = await data.getRootDir();
    expect(result.isOk()).toEqual(true);
    const root = result._unsafeUnwrap();

    const result2 = await root.query();
    expect(result2.isOk()).toEqual(true);
    const entries = result2._unsafeUnwrap();
    expect(entries.continuation).toBeUndefined();
    expect(entries.blobs.length).toEqual(0);
    expect(entries.dirs.length).toEqual(0);

    const result3 = await root.readBlob("not there");
    expect(result3.isErr());
    const err = result3._unsafeUnwrapErr() as StorageError;
    expect(err.type).toEqual("StorageError");
    expect(err.statusCode).toEqual(404);
    
    const result4 = await root.removeBlob("not there");
    expect(result4.isOk());

    const result5 = await root.removeAll();
    expect(result5.isOk());
  })

  it('should support blobs and dirs', async () => {
    const data = creator();
    const result = await data.getRootDir();
    expect(result.isOk()).toEqual(true);
    const root = result._unsafeUnwrap();

    const content = new Uint8Array([1]);
    const result1 = await root.writeBlob("1", content);
    expect(result1.isOk()).toEqual(true);
    content[0] = 2;
    const result2 = await root.writeBlob("2", content);
    expect(result2.isOk()).toEqual(true);

    // Should have saved *copy* of blob passed in
    const result3 = await root.readBlob("1");
    expect(result3.isOk());
    const content1 = result3._unsafeUnwrap();
    expect(content1.byteLength).toEqual(1);
    expect(content1[0]).toEqual(1);

    const result4 = await root.readBlob("2");
    expect(result4.isOk());
    const content2 = result4._unsafeUnwrap();
    expect(content2.byteLength).toEqual(1);
    expect(content2[0]).toEqual(2);

    let queryResult = await root.query();
    expect(queryResult.isOk()).toEqual(true);
    let entries = queryResult._unsafeUnwrap();
    expect(entries.continuation).toBeUndefined();
    expect(entries.blobs.sort()).toEqual(["1", "2"]);
    expect(entries.dirs.length).toEqual(0);

    const result5 = await root.getDir("a");
    expect(result5.isOk()).toEqual(true);
    const dirA = result5._unsafeUnwrap();

    // Empty dir should not be visible in query
    queryResult = await root.query();
    expect(queryResult.isOk()).toEqual(true);
    entries = queryResult._unsafeUnwrap();
    expect(entries.continuation).toBeUndefined();
    expect(entries.blobs.sort()).toEqual(["1", "2"]);
    expect(entries.dirs.length).toEqual(0);

    content[0] = 3;
    const result6 = await dirA.writeBlob("3", content);
    expect(result6.isOk()).toEqual(true);

    queryResult = await root.query();
    expect(queryResult.isOk()).toEqual(true);
    entries = queryResult._unsafeUnwrap();
    expect(entries.continuation).toBeUndefined();
    expect(entries.blobs.sort()).toEqual(["1", "2"]);
    expect(entries.dirs.sort()).toEqual(["a"]);

    queryResult = await dirA.query();
    expect(queryResult.isOk()).toEqual(true);
    entries = queryResult._unsafeUnwrap();
    expect(entries.continuation).toBeUndefined();
    expect(entries.blobs.sort()).toEqual(["3"]);
    expect(entries.dirs.length).toEqual(0);

    // Can't use blob APIs on dirs
    const result7 = await root.readBlob("a");
    expect(result7.isErr());
    expect(result7._unsafeUnwrapErr().type).toEqual("BlobWrongKindError");

    content[0] = 61;
    const result8 = await root.writeBlob("a", content);
    expect(result8.isErr());
    expect(result8._unsafeUnwrapErr().type).toEqual("BlobWrongKindError");

    const result9 = await root.removeBlob("a");
    expect(result9.isErr());
    expect(result9._unsafeUnwrapErr().type).toEqual("BlobWrongKindError");

    // Can't use dir API on blobs
    const result10 = await root.getDir("1");
    expect(result10.isErr());
    expect(result10._unsafeUnwrapErr().type).toEqual("BlobWrongKindError");

    // Repeated query of dir has same content
    const result11 = await root.getDir("a");
    expect(result11.isOk()).toEqual(true);
    const dirA2 = result11._unsafeUnwrap();

    queryResult = await dirA2.query();
    expect(queryResult.isOk()).toEqual(true);
    entries = queryResult._unsafeUnwrap();
    expect(entries.continuation).toBeUndefined();
    expect(entries.blobs.sort()).toEqual(["3"]);
    expect(entries.dirs.length).toEqual(0);
  })

  it('should support blob pagination', async () => {
    const data = creator();
    const result = await data.getRootDir();
    expect(result.isOk()).toEqual(true);
    const root = result._unsafeUnwrap();

    const NUM_BLOBS = pageSize*2+1;
    for (let i = 0; i < NUM_BLOBS; i ++) {
      const content = new Uint8Array([i]);
      const result = await root.writeBlob(i.toString(), content);
      expect(result.isOk()).toEqual(true);
    }

    const allEntries: number[] = [];
    let queryResult = await root.query();
    expect(queryResult.isOk()).toEqual(true);
    let entries = queryResult._unsafeUnwrap();
    expect(entries.continuation).toBeDefined();
    expect(entries.blobs.length).toBeGreaterThan(0);
    expect(entries.blobs.length).toBeLessThanOrEqual(pageSize);
    expect(entries.dirs.length).toEqual(0);
    entries.blobs.forEach((value) => allEntries.push(parseInt(value)));

    let continuation = entries.continuation;
    while(continuation) {
      queryResult = await root.query(continuation);
      expect(queryResult.isOk()).toEqual(true);
      entries = queryResult._unsafeUnwrap();
      expect(entries.blobs.length).toBeGreaterThan(0);
      expect(entries.blobs.length).toBeLessThanOrEqual(pageSize);
      expect(entries.dirs.length).toEqual(0);
      entries.blobs.forEach((value) => allEntries.push(parseInt(value)));
      continuation = entries.continuation;
    }

    allEntries.sort((a,b) => a - b);
    expect(allEntries.length).toEqual(NUM_BLOBS);
    for (let i = 0; i < NUM_BLOBS; i ++) {
      expect(allEntries[i]).toEqual(i);
    }
  })
})
}
