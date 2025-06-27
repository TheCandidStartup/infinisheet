import { SimpleBlobStore } from './SimpleBlobStore';
import {blobStoreInterfaceTests } from '../../infinisheet-types/src/BlobStore.interface-test'


describe('SimpleBlobStore', () => {
  blobStoreInterfaceTests(() => new SimpleBlobStore, 10);

  // SimplBlobStore specific tests go here
})
