import { TileFormat } from "./SpreadsheetSnapshot";

/** Additional options for {@link EventSourcedSpreadsheetData} */
export interface EventSourcedSpreadsheetDataOptions {
  /** Minimum number of log entries before creation of next snapshot 
   * @defaultValue 100
  */
  snapshotInterval?: number | undefined;

  /** Should pending workflows be restarted on initial load of event log? 
   * @defaultValue false
  */
  restartPendingWorkflowsOnLoad?: boolean | undefined;

  /** Initial viewport empty ? 
   * @defaultValue false
  */
  viewportEmpty?: boolean | undefined;

  /** Format to use when writing snapshots
  */
  snapshotFormat?: TileFormat | undefined;
}
