import React from "react";
import { ItemOffsetMapping, ScrollLayout, VirtualBaseItemProps } from './VirtualBase';
import { getRangeToRender, getGridTemplate } from './VirtualCommon';
import { VirtualContainer, VirtualContainerRender } from './VirtualContainer';

/**
 * Props accepted by {@link DisplayListItem}
 */
export interface DisplayListItemProps extends VirtualBaseItemProps {
    /** Index of item in the list being rendered */
    index: number,
}

/**
 * Type of item in a {@link DisplayList}
 *
 * Must be passed as a child to {@link DisplayList}. 
 * Accepts props defined by {@link DisplayListItemProps}.
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
export type DisplayListItem = React.ComponentType<DisplayListItemProps>;

/**
 * Props accepted by {@link DisplayList}
 */
export interface DisplayListProps {
  /** Component used as a template to render items in the list. Must implement {@link DisplayListItem} interface. */
  children: DisplayListItem,

  /** The `className` applied to the outer container element. Use when styling the entire component. */
  className?: string,

  /** The `className` applied to the inner container element. Use for special cases when styling only the inner container and items. */
  innerClassName?: string,

  /** Component height */
  height: number,

   /** Component width */
  width: number,

  /** Number of items in the list */
  itemCount: number,

  /** Offset to start of displayed content */
  offset: number,

  /** Passed as {@link VirtualBaseItemProps.data} to each child item */
  itemData?: unknown,

    /** Passed as {@link VirtualBaseItemProps.isScrolling} to each child item
     * 
     * Provided as a convenience when combining DisplayList with {@link VirtualScroll}
     * Not interpreted by DisplayList
     */
  isScrolling?: boolean,

  /** 
   * Implementation of {@link ItemOffsetMapping} interface that defines size and offset to each item in the list
   * 
   * Use {@link useFixedSizeItemOffsetMapping} or {@link useVariableSizeItemOffsetMapping} to create implementations
   * for common cases.
   */
  itemOffsetMapping: ItemOffsetMapping,

  /**
   * Function that defines the key to use for each item given item index and value of {@link DisplayListProps.itemData}.
   * @defaultValue `(index, _data) => index`
   */
  itemKey?: (index: number, data: unknown) => React.Key,

  /**
   * Choice of 'vertical' or 'horizontal' layouts
   * @defaultValue 'vertical'
   */
  layout?: ScrollLayout,

  /** 
   * Renders the outer viewport div which provides a window onto the inner grid div
   * 
   * Render prop implementing {@link VirtualContainerRender}. Used to customize {@link DisplayList} outer container. */
  outerRender?: VirtualContainerRender;

  /** 
   * Renders the inner grid div containing all the list items
   * 
   * Render prop implementing {@link VirtualContainerRender}. Used to customize {@link DisplayList} inner container. */
  innerRender?: VirtualContainerRender;
}

const defaultItemKey = (index: number, _data: unknown) => index;

const boxStyle: React.CSSProperties = { boxSizing: 'border-box' };

/**
 * Display List
 * 
 * Displays a window onto the contents of a virtualized list starting from `offset`.
 * 
 * Accepts props defined by {@link DisplayListProps}. 
 * You must pass a single instance of {@link DisplayListItem} as a child.
 * @group Components
 */
export function DisplayList(props: DisplayListProps) {
  const { width, height, itemCount, itemOffsetMapping, className, innerClassName, offset: renderOffset, children,
    itemData, itemKey = defaultItemKey, layout = 'vertical', outerRender, innerRender, isScrolling } = props;

  const isVertical = layout === 'vertical';

  const [startIndex, startOffset, sizes] = getRangeToRender(itemCount, itemOffsetMapping, 
    isVertical ? height : width, renderOffset);
  const renderSize = sizes.reduce((accum,current) => accum + current, 0);
  const template = getGridTemplate(sizes);
  const offset = startOffset - renderOffset;

  // We can decide the JSX child type at runtime as long as we use a variable that uses the same capitalized
  // naming convention as components do.
  const ChildVar = children;

  return (
   <VirtualContainer className={className} render={outerRender}
        style={{ position: "relative", height, width, overflow: "hidden", willChange: "transform" }}>
       <VirtualContainer className={innerClassName} render={innerRender}
        style={{ position: 'absolute',
          display: 'grid',
          gridTemplateColumns: isVertical ? undefined : template,
          gridTemplateRows: isVertical ? template : undefined,
          top: isVertical ? offset : 0, 
          left: isVertical ? 0 : offset, 
          height: isVertical ? renderSize : "100%", 
          width: isVertical ? "100%" : renderSize }}>
        {sizes.map((_size, arrayIndex) => (
          <ChildVar data={itemData} isScrolling={isScrolling} 
            key={itemKey(startIndex + arrayIndex, itemData)} index={startIndex + arrayIndex} style={boxStyle}/>
        ))}
      </VirtualContainer>
    </VirtualContainer>
  );
}

export default DisplayList;