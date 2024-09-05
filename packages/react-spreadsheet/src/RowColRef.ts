/**  Classic Spreadsheet reference to Column (e.g "A") */
export type ColRef = string;

/**  Classic Spreadsheet reference to Cell (e.g. "A1"), Row (e.g. "1") or Column (e.g "A") */
export type RowColRef = string | ColRef;

/** Equivalent to {@link RowColRef} as coordinate pair. "A1" has coords [0,0], "1" is [0,undefined] and "A" is [undefined,0] */
export type RowColCoords = [row: number|undefined, col: number|undefined];

/** Converts a {@link ColRef} to the 0-based index of the column */
export function colRefToIndex(col: ColRef): number {
  let n = 0;
  for (let i = 0; i < col.length; i ++) {
    n = col.charCodeAt(i) - 64 + n * 26;
  }
  return n-1;
}

/** Converts a 0-based column index to a {@link ColRef} */
export function indexToColRef(index: number): ColRef {
  let ret = "";
  index ++;
  while (index > 0) {
    index --;
    const remainder = index % 26;
    index = Math.floor(index / 26);
    ret = String.fromCharCode(65+remainder) + ret;
  }
  return ret;
}

/** Splits a RowColRef into a 0-based row index and a {@link ColRef} */
export function splitRowColRef(ref: RowColRef): [row: number|undefined, col: ColRef|undefined] {
  const re = /^([A-Z]*)(\d*)$/;
  const found = ref.match(re);
  if (!found)
    return [undefined,undefined];

  const col = found[1];
  const row = parseInt(found[2]);
  return [(row>0) ? row-1 : undefined, col ? col : undefined];
}

/**  Converts a {@link RowColRef} to {@link RowColCoords} */
export function rowColRefToCoords(ref: RowColRef): RowColCoords {
  const [row,col] = splitRowColRef(ref);
  return [row, col ? colRefToIndex(col) : undefined];
}

/**  Converts {@link RowColCoords} to a {@link RowColRef} */
export function rowColCoordsToRef(row: number|undefined, col: number|undefined): RowColRef {
  if (row !== undefined) {
    if (col !== undefined) {
      return indexToColRef(col) + (row+1);
    } else {
      return (row+1).toString();
    }
  } else {
    if (col !== undefined) {
      return indexToColRef(col);
    } else {
      return "";
    }
  }
}