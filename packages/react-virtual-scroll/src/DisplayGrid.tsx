import React, { Fragment } from "react";
import { ItemOffsetMapping, VirtualBaseItemProps } from './VirtualBase';
import { getRangeToRender, getGridTemplate } from './VirtualCommon';
import { VirtualContainer, VirtualContainerRender } from './VirtualContainer';

/**
 * Props accepted by {@link DisplayGridItem}
 */
export interface DisplayGridItemProps extends VirtualBaseItemProps {
  /** Row index of item in the grid being rendered */
  rowIndex: number,

  /** Column index of item in the grid being rendered */
  columnIndex: number,
}

/**
 * Type of item in a {@link DisplayGrid}
 *
 * Must be passed as a child to {@link DisplayGrid}. 
 * Accepts props defined by {@link DisplayGridItemProps}.
 * Component must pass {@link VirtualBaseItemProps.style} to whatever it renders. 
 * 
 * @example Basic implementation
 * ```
 * const Row = ({ index, style }: { index: number, style: React.CSSProperties }) => (
 *   <div className="row" style={style}>
 *     { index }
 *   </div>
 * );
 * ```
 */
export type DisplayGridItem = React.ComponentType<DisplayGridItemProps>;

/**
 * Props accepted by {@link DisplayGrid}
 */
export interface DisplayGridProps {
  /** Component used as a template to render items in the list. Must implement {@link DisplayGridItem} interface. */
  children: DisplayGridItem,

  /** The `className` applied to the outer container element. Use when styling the entire component. */
  className?: string,

  /** The `className` applied to the inner container element. Use for special cases when styling only the inner container and items. */
  innerClassName?: string,

  /** Component height */
  height: number,

   /** Component width */
  width: number,

  /** Number of rows in the grid */
  rowCount: number,

  /** 
   * Implementation of {@link ItemOffsetMapping} interface that defines size and offset to each row in the grid
   * 
   * Use {@link useFixedSizeItemOffsetMapping} or {@link useVariableSizeItemOffsetMapping} to create implementations
   * for common cases.
   */
  rowOffsetMapping: ItemOffsetMapping,

  /** Number of columns in the grid */
  columnCount: number,

  /** 
   * Implementation of {@link ItemOffsetMapping} interface that defines size and offset to each column in the grid
   * 
   * Use {@link useFixedSizeItemOffsetMapping} or {@link useVariableSizeItemOffsetMapping} to create implementations
   * for common cases.
   */
  columnOffsetMapping: ItemOffsetMapping,

  /** Vertical offset to start of displayed content */
  rowOffset: number,

  /** Horizontal offset to start of displayed content */
  columnOffset: number,

  /** Passed as {@link VirtualBaseItemProps.data} to each child item */
  itemData?: unknown,

  /** Passed as {@link VirtualBaseItemProps.isScrolling} to each child item
   * 
   * Provided as a convenience when combining DisplayGrid with {@link VirtualScroll}
   * Not interpreted by DisplayGrid itself
   */
  isScrolling?: boolean,

  /**
   * Function that defines the key to use for each item given row and column index and value of {@link DisplayGridProps.itemData}.
   * @defaultValue
   * ```ts
   * (rowIndex, columnIndex, _data) => `${rowIndex}:${columnIndex}`
   * ```
   */
  itemKey?: (rowIndex: number, columnIndex: number, data: unknown) => React.Key,

  /** 
   * Renders the outer viewport div which provides a window onto the inner grid div
   * 
   * Render prop implementing {@link VirtualContainerRender}. Used to customize {@link DisplayGrid} outer container. */
  outerRender?: VirtualContainerRender;

  /** 
   * Renders the inner grid div containing all the list items
   * 
   * Render prop implementing {@link VirtualContainerRender}. Used to customize {@link DisplayGrid} inner container. */
  innerRender?: VirtualContainerRender;
}

const defaultItemKey = (rowIndex: number, columnIndex: number, _data: unknown) => `${rowIndex}:${columnIndex}`;

const boxStyle: React.CSSProperties = { boxSizing: 'border-box' };

/**
 * Display Grid
 * 
 * Displays a window onto the contents of a virtualized grid starting from `rowOffset`, `columnOffset`.
 * 
 * Accepts props defined by {@link DisplayGridProps}. 
 * You must pass a single instance of {@link DisplayGridItem} as a child.
 * @group Components
 */
export function DisplayGrid(props: DisplayGridProps) {
  const { width, height, rowCount, rowOffsetMapping, columnCount, columnOffsetMapping, className, innerClassName, 
    rowOffset: rowRenderOffset, columnOffset: colRenderOffset, children,
    itemData, itemKey = defaultItemKey, outerRender, innerRender, isScrolling } = props;

  const [rowStartIndex, rowStartOffset, rowSizes] = getRangeToRender(rowCount, rowOffsetMapping, height, rowRenderOffset);
  const rowRenderSize = rowSizes.reduce((accum,current) => accum + current, 0);
  const rowTemplate = getGridTemplate(rowSizes);

  const [colStartIndex, colStartOffset, colSizes] = getRangeToRender(columnCount, columnOffsetMapping, width, colRenderOffset);
  const colRenderSize = colSizes.reduce((accum,current) => accum + current, 0);
  const colTemplate = getGridTemplate(colSizes);

  const rowOffset = rowStartOffset - rowRenderOffset;
  const colOffset = colStartOffset - colRenderOffset;

  // We can decide the JSX child type at runtime as long as we use a variable that uses the same capitalized
  // naming convention as components do.
  const ChildVar = children;

  return (
   <VirtualContainer className={className} render={outerRender}
        style={{ position: "relative", height, width, overflow: "hidden", willChange: "transform" }}>
       <VirtualContainer className={innerClassName} render={innerRender}
        style={{ position: 'absolute',
          display: 'grid',
          gridTemplateColumns: colTemplate,
          gridTemplateRows: rowTemplate,
          top: rowOffset, 
          left: colOffset, 
          height: rowRenderSize, 
          width: colRenderSize }}>
        {rowSizes.map((_rowSize, rowIndex) => (
          <Fragment key={itemKey(rowStartIndex + rowIndex, 0, itemData)}>
          {colSizes.map((_size, colIndex) => (
            <ChildVar data={itemData} isScrolling={isScrolling} 
              key={itemKey(rowStartIndex + rowIndex, colStartIndex + colIndex, itemData)} 
              rowIndex={rowStartIndex + rowIndex} columnIndex={colStartIndex + colIndex} style={boxStyle}/>
          ))}
          </Fragment>
        ))}
      </VirtualContainer>
    </VirtualContainer>
  );
}

export default DisplayGrid;