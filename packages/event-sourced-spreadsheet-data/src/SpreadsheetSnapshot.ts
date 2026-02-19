import type { BlobDir, BlobId, Result, StorageError } from "@candidstartup/infinisheet-types";
import { err, ok } from "@candidstartup/infinisheet-types";

function formatName(rowMin: number, colMin: number, rowCount: number, colCount: number) {
  return `${rowMin}-${colMin}-${rowCount}-${colCount}`
}

/** Metadata that describes tiling format used in this snapshot
 * @internal
 */
export interface TileFormat {
  /** Used as a discriminated union tag by implementations */
  type: string;
};

/** Regular grid tile format. All tiles have same width and height.
 * @internal
 */
export interface GridTileFormat extends TileFormat {
  type: "grid";
  tileWidth: number;
  tileHeight: number;
};

/** In-memory representation of snapshot metadata
 * @internal
 */
export class SpreadsheetSnapshot {
  constructor(id: BlobId, snapshotDir: BlobDir<unknown>, tileDir: BlobDir<unknown>, tileFormat?: TileFormat) {
    this.id = id;
    this.snapshotDir = snapshotDir;
    this.tileDir = tileDir;

    this.rowCount = 0;
    this.colCount = 0;
    this.tileFormat = tileFormat;
  }

  async saveIndex(): Promise<Result<void,StorageError>> {
    const meta = { rowCount: this.rowCount, colCount: this.colCount, tileFormat: this.tileFormat }
    const json = JSON.stringify(meta);
    const encoder = new TextEncoder;
    const blob = encoder.encode(json);
    
    const blobResult = await this.snapshotDir.writeBlob("index", blob);
    if (blobResult.isErr()) {
      if (blobResult.error.type === "StorageError")
        return err(blobResult.error);
      throw Error("Messed up my blobs", { cause: blobResult.error });
    }

    return ok();
  }

  async loadIndex(): Promise<Result<void,StorageError>> {
    const blobResult = await this.snapshotDir.readBlob("index");
    if (blobResult.isErr()) {
      if (blobResult.error.type === "StorageError")
        return err(blobResult.error);
      throw Error("Messed up my blobs", { cause: blobResult.error });
    }

    const decoder = new TextDecoder;
    const inputString = decoder.decode(blobResult.value);

    // Tracer bullet, no validation
    const input = JSON.parse(inputString) as  SpreadsheetSnapshot;
    this.rowCount = input.rowCount;
    this.colCount = input.colCount;
    this.tileFormat = input.tileFormat;

    return ok();
  }

  async saveTile(rowMin: number, colMin: number, rowCount: number, colCount: number, blob: Uint8Array): Promise<Result<void,StorageError>> {
    const blobResult = await this.tileDir.writeBlob(formatName(rowMin,colMin,rowCount,colCount), blob);
    if (blobResult.isErr()) {
      if (blobResult.error.type === "StorageError")
        return err(blobResult.error);
      throw Error("Messed up my blobs", { cause: blobResult.error });
    }

    this.rowCount = Math.max(this.rowCount, rowMin+rowCount);
    this.colCount = Math.max(this.colCount, colMin+colCount);
    return ok();
  }

  async loadTile(rowMin: number, colMin: number, rowCount: number, colCount: number): Promise<Result<Uint8Array,StorageError>> {
    const blobResult = await this.tileDir.readBlob(formatName(rowMin,colMin,rowCount,colCount));
    if (blobResult.isErr()) {
      if (blobResult.error.type === "StorageError")
        return err(blobResult.error);
      throw Error("Messed up my blobs", { cause: blobResult.error });
    }

    return ok(blobResult.value);
  }

  id: BlobId;
  snapshotDir: BlobDir<unknown>;
  tileDir: BlobDir<unknown>;
  rowCount: number;
  colCount: number;
  tileFormat: TileFormat | undefined;
}

export async function openSnapshot(rootDir: BlobDir<unknown>, snapshotId: BlobId): Promise<Result<SpreadsheetSnapshot,StorageError>> {
  const snapshotResult = await rootDir.getDir(snapshotId);
  if (snapshotResult.isErr()) {
    if (snapshotResult.error.type == "StorageError")
      return err(snapshotResult.error);
    throw Error("Messed up my blobs", { cause: snapshotResult.error });
  }
  const snapshotDir = snapshotResult.value;

  const tileDirResult = await snapshotDir.getDir("tiles");
  if (tileDirResult.isErr()) {
    if (tileDirResult.error.type == "StorageError")
      return err(tileDirResult.error);
    throw Error("Messed up my blobs", { cause: tileDirResult.error });
  }
  const tileDir = tileDirResult.value;

  return ok(new SpreadsheetSnapshot(snapshotId,snapshotDir, tileDir));
}