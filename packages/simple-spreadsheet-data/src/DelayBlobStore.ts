import type { BlobStore, BlobDir, BlobName, ResultAsync, 
  GetRootDirError, ReadBlobError, WriteBlobError, RemoveBlobError, BlobDirEntries, 
  GetDirError, DirQueryError, RemoveAllBlobDirError } from "@candidstartup/infinisheet-types";
import { okAsync } from "@candidstartup/infinisheet-types";
import { delayResult } from "./DelayEventLog";

/**
 * Reference implementation of {@link BlobDir}
 * 
 * Intended for use as a mock, to compare with an optimized implementation when testing and
 * for simple sample apps. Simplest possible implementation, no attempt at optimization.
 */
export class DelayBlobDir<BaseContinuationT> implements BlobDir<BaseContinuationT> {
  constructor (base: BlobDir<BaseContinuationT>, store: DelayBlobStore<BaseContinuationT>) {
    this.base = base;
    this.store = store;
  }

  readBlob(name: BlobName): ResultAsync<Uint8Array,ReadBlobError> {
    return delayResult(this.base.readBlob(name), this.store.delay);
  }

  writeBlob(name: BlobName, content: Uint8Array): ResultAsync<void,WriteBlobError> {
    return delayResult(this.base.writeBlob(name, content), this.store.delay);
  }

  removeBlob(name: BlobName): ResultAsync<void,RemoveBlobError> {
    return delayResult(this.base.removeBlob(name), this.store.delay);
  }

  getDir(name: BlobName): ResultAsync<DelayBlobDir<BaseContinuationT>,GetDirError> {
    return delayResult(this.base.getDir(name), this.store.delay).map((dir) => ( new DelayBlobDir(dir, this.store)));
  }

  query(continuation?: BaseContinuationT): ResultAsync<BlobDirEntries<BaseContinuationT>,DirQueryError> {
    return delayResult(this.base.query(continuation), this.store.delay);
  }

  removeAll(): ResultAsync<void,RemoveAllBlobDirError> {
    return delayResult(this.base.removeAll(), this.store.delay);
  }
  
  private base: BlobDir<BaseContinuationT>;
  private store: DelayBlobStore<BaseContinuationT>;
}

/**
 * Reference implementation of {@link BlobStore}
 * 
 * Intended for use as a mock, to compare with an optimized implementation when testing and
 * for simple sample apps. Simplest possible implementation, no attempt at optimization.
 */
export class DelayBlobStore<BaseContinuationT> implements BlobStore<BaseContinuationT> {
  constructor(base: BlobStore<BaseContinuationT>, delay: number=0) {
    this.base = base;
    this.delay = delay;
  }

  /** Delay in milliseconds to add to response from each API call */
  delay: number;

  getRootDir(): ResultAsync<DelayBlobDir<BaseContinuationT>,GetRootDirError> {
    if (!this.root) {
      return delayResult(this.base.getRootDir().andThen((dir) => {
        this.root = new DelayBlobDir(dir, this);
        return okAsync(this.root);
      }), this.delay);
    }
    return delayResult(okAsync(this.root), this.delay);
  }

  private base: BlobStore<BaseContinuationT>;
  private root: DelayBlobDir<BaseContinuationT> | undefined;
}
