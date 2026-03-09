import { DelayBlobStore } from './DelayBlobStore';
import {blobStoreInterfaceTests } from '../../infinisheet-types/src/BlobStore.interface-test'
import { SimpleBlobStore } from './SimpleBlobStore';


describe('DelayBlobStore', () => {
  blobStoreInterfaceTests(() => new DelayBlobStore(new SimpleBlobStore), 10);

  // SimplBlobStore specific tests go here
})
