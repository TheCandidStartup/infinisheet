import type { BlobStore } from './BlobStore';
import { expectUnwrap } from '../../../shared/test/utils';

export function blobStoreInterfaceTests(creator: () => BlobStore<unknown>, pageSize: number) {
describe('BlobStore Interface', () => {
  it('should start out empty', async () => {
    const data = creator();
    const root = expectUnwrap(await data.getRootDir()); 

    expect(await root.query()).toBeBlobDirEntries([], []);
    expect(await root.readBlob("not there")).toBeStorageError(404);
    expect(await root.removeBlob("not there")).toBeOk();
    expect(await root.removeAll()).toBeOk();
  })

  it('should support blobs and dirs', async () => {
    const data = creator();
    const root = expectUnwrap(await data.getRootDir()); 

    // Write two blobs
    const content = new Uint8Array([1]);
    expect(await root.writeBlob("1", content)).toBeOk();
    content[0] = 2;
    expect(await root.writeBlob("2", content)).toBeOk();

    // Should have saved *copy* of blob passed in
    expect(expectUnwrap(await root.readBlob("1"))).toEqual(new Uint8Array([1]));
    expect(expectUnwrap(await root.readBlob("2"))).toEqual(new Uint8Array([2]));

    // Both blobs should be visible in query
    expect(await root.query()).toBeBlobDirEntries(["1", "2"], []);

    // Empty dir should not be visible in query
    const dirA = expectUnwrap(await root.getDir("a"));
    expect(await root.query()).toBeBlobDirEntries(["1", "2"], []);

    // Write blob in subdir and check visible in query
    content[0] = 3;
    expect(await dirA.writeBlob("3", content)).toBeOk();
    expect(await root.query()).toBeBlobDirEntries(["1", "2"], ["a"]);
    expect(await dirA.query()).toBeBlobDirEntries(["3"], []);

    // Can't use blob APIs on dirs
    expect(await root.readBlob("a")).toBeInfinisheetError("BlobWrongKindError");
    expect(await root.writeBlob("a", content)).toBeInfinisheetError("BlobWrongKindError");
    expect(await root.removeBlob("a")).toBeInfinisheetError("BlobWrongKindError");

    // Can't use dir API on blobs
    expect(await root.getDir("1")).toBeInfinisheetError("BlobWrongKindError");

    // Invalid name error
    expect(await root.readBlob("")).toBeInfinisheetError("InvalidBlobNameError");
    expect(await root.writeBlob("", content)).toBeInfinisheetError("InvalidBlobNameError");
    expect(await root.removeBlob("")).toBeInfinisheetError("InvalidBlobNameError");
    expect(await root.getDir("")).toBeInfinisheetError("InvalidBlobNameError");

    // Repeated query of dir has same content
    const dirA2 = expectUnwrap(await root.getDir("a"));
    expect(await dirA2.query()).toBeBlobDirEntries(["3"], []);
    const root2 = expectUnwrap(await data.getRootDir()); 
    expect(await root2.query()).toBeBlobDirEntries(["1", "2"], ["a"]);

    // Remove blob from root
    expect(await root.removeBlob("1")).toBeOk();
    expect(await root2.query()).toBeBlobDirEntries(["2"], ["a"]);

    // Remove blob from dir "a" also removes dir from query results
    expect(await dirA.removeBlob("3")).toBeOk();
    expect(await root.query()).toBeBlobDirEntries(["2"], []);

    // Directory still usable
    expect(await dirA.writeBlob("3", content)).toBeOk();
    expect(await root.query()).toBeBlobDirEntries(["2"], ["a"]);

    // Remove all works recursively
    expect(await root.removeAll()).toBeOk();
    expect(await root.query()).toBeBlobDirEntries([], []);
  })

  it('should support blob pagination', async () => {
    const data = creator();
    const root = expectUnwrap(await data.getRootDir()); 

    const NUM_BLOBS = pageSize*2+1;
    for (let i = 0; i < NUM_BLOBS; i ++) {
      const content = new Uint8Array([i]);
      const result = await root.writeBlob(i.toString(), content);
      expect(result).toBeOk();
    }

    const allEntries: number[] = [];
    let entries = expectUnwrap(await root.query());
    expect(entries.continuation).toBeDefined();
    expect(entries.blobs.length).toBeGreaterThan(0);
    expect(entries.blobs.length).toBeLessThanOrEqual(pageSize);
    expect(entries.dirs.length).toEqual(0);
    entries.blobs.forEach((value) => allEntries.push(parseInt(value)));

    let continuation = entries.continuation;
    while(continuation) {
      entries = expectUnwrap(await root.query(continuation));
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
