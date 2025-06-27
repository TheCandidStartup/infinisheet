import type { BlobStore, BlobDir, BlobName, ResultAsync, 
  GetRootDirError, ReadBlobError, WriteBlobError, RemoveBlobError, BlobDirEntries, 
  GetDirError, DirQueryError, RemoveAllBlobDirError } from "@candidstartup/infinisheet-types";
import { errAsync, okAsync, storageError, notBlobError, notBlobDirError, invalidBlobNameError } from "@candidstartup/infinisheet-types";

const QUERY_PAGE_SIZE = 10;

type SimpleBlobStoreIter = MapIterator<[BlobName, BlobDir<SimpleBlobStoreContinuation>|Uint8Array]>;

/** 
 * Branding Enum. Used by {@link SimpleBlobStore} to ensure that
 * you'll get a type error if you pass some random object where a `SimpleBlobStoreContinuation`
 * is expected.
 * @internal
 */
export enum _SimpleBlobStoreBrand { _DO_NOT_USE="" };

/**
 * Opaque type representing a {@link SimpleSpreadsheetData} snapshot. All the
 * internal implementation details are hidden from the exported API.
 */
export interface SimpleBlobStoreContinuation {
  /** @internal */
  _brand: _SimpleBlobStoreBrand;
}

function asIter(continuation: SimpleBlobStoreContinuation) {
  return continuation as unknown as SimpleBlobStoreIter;
}

function asContinuation(iter: SimpleBlobStoreIter) {
  return iter as unknown as SimpleBlobStoreContinuation;
}

/**
 * Reference implementation of {@link BlobDir}
 * 
 * Intended for use as a mock, to compare with an optimized implementation when testing and
 * for simple sample apps. Simplest possible implementation, no attempt at optimization.
 */
export class SimpleBlobDir implements BlobDir<SimpleBlobStoreContinuation> {
  constructor () {
    this.map = new Map;
  }

  // Logically directories only exist if they have entries. To simplify implementation we
  // create on demand and treat empty dir the same as non-existent dir.

  readBlob(name: BlobName): ResultAsync<Uint8Array,ReadBlobError> {
    if (!name)
      return errAsync(invalidBlobNameError());
    const value = this.map.get(name);
    if (!value || (value instanceof SimpleBlobDir && value.map.size == 0))
      return errAsync(storageError("Blob does not exist", 404));

    if (value instanceof Uint8Array) {
      return okAsync(value);
    } else {
      return errAsync(notBlobError())
    }
  }

  writeBlob(name: BlobName, content: Uint8Array): ResultAsync<void,WriteBlobError> {
    if (!name)
      return errAsync(invalidBlobNameError());
    const value = this.map.get(name);
    if (value instanceof SimpleBlobDir && value.map.size > 0)
      return errAsync(notBlobError());

    this.map.set(name,new Uint8Array(content));
    return okAsync();
  }

  removeBlob(name: BlobName): ResultAsync<void,RemoveBlobError> {
    if (!name)
      return errAsync(invalidBlobNameError());
    const value = this.map.get(name);
    if (value instanceof SimpleBlobDir && value.map.size > 0)
      return errAsync(notBlobError());

    this.map.delete(name);
    return okAsync();
  }

  getDir(name: BlobName): ResultAsync<BlobDir<SimpleBlobStoreContinuation>,GetDirError> {
    if (!name)
      return errAsync(invalidBlobNameError());

    const value = this.map.get(name);
    if (!value) {
      const dir = new SimpleBlobDir();
      this.map.set(name,dir);
      return okAsync(dir);
    }

    if (value instanceof SimpleBlobDir)
      return okAsync(value);

    return errAsync(notBlobDirError());
  }

  query(continuation?: SimpleBlobStoreContinuation): ResultAsync<BlobDirEntries<SimpleBlobStoreContinuation>,DirQueryError> {
    const iter = continuation ? asIter(continuation) : this.map.entries();
    const entries: BlobDirEntries<SimpleBlobStoreContinuation> = { blobs: [], dirs: [] }

    for (let i = 0; i < QUERY_PAGE_SIZE; i ++) {
      const result = iter.next();
      if (result.done)
        return okAsync(entries);

      const [name, value] = result.value;
      if (value instanceof SimpleBlobDir) {
        if (value.map.size > 0)
          entries.dirs.push(name);
      } else {
        entries.blobs.push(name);
      }
    }

    entries.continuation = asContinuation(iter);
    return okAsync(entries);
  }

  removeAll(): ResultAsync<void,RemoveAllBlobDirError> {
    this.map.clear();
    return okAsync();
  }
  
  private map: Map<BlobName,BlobDir<SimpleBlobStoreContinuation>|Uint8Array>
}

/**
 * Reference implementation of {@link BlobStore}
 * 
 * Intended for use as a mock, to compare with an optimized implementation when testing and
 * for simple sample apps. Simplest possible implementation, no attempt at optimization.
 */
export class SimpleBlobStore implements BlobStore<SimpleBlobStoreContinuation> {
  constructor () {
    this.root = undefined;
  }

  getRootDir(): ResultAsync<SimpleBlobDir,GetRootDirError> {
    if (!this.root)
      this.root = new SimpleBlobDir;
    return okAsync(this.root);
  }

  private root: SimpleBlobDir | undefined;
}
