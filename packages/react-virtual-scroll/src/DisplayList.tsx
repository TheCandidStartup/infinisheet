import React from "react";
import type { ItemOffsetMapping } from "@candidstartup/infinisheet-types";
import { ScrollLayout, DisplayBaseItemProps, DisplayBaseProps } from './VirtualBase';
import { getRangeToRender, getGridTemplate } from './VirtualCommon';
import { VirtualContainer } from './VirtualContainer';

/**
 * Props accepted by {@link DisplayListItem}
 */
export interface DisplayListItemProps extends DisplayBaseItemProps {
  /** Index of item in the list being rendered */
  index: number,
}

/**
 * Type of item in a {@link DisplayList}
 *
 * Must be passed as a child to {@link DisplayList}. 
 * Accepts props defined by {@link DisplayListItemProps}.
 * Component must pass {@link DisplayBaseItemProps.style} to whatever it renders. 
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
 * Function that defines the key to use for each item given item index and value of {@link DisplayBaseProps.itemData}.
 */
export type ListItemKey = (index: number, data: unknown) => React.Key;

/**
 * Props accepted by {@link DisplayList}
 */
export interface DisplayListProps extends DisplayBaseProps {
  /** Component used as a template to render items in the list. Must implement {@link DisplayListItem} interface. */
  children: DisplayListItem,

  /** Number of items in the list */
  itemCount: number,

  /** Offset to start of displayed content */
  offset: number,

  /** 
   * Implementation of {@link ItemOffsetMapping} interface that defines size and offset to each item in the list
   * 
   * Use {@link useFixedSizeItemOffsetMapping} or {@link useVariableSizeItemOffsetMapping} to create implementations
   * for common cases.
   */
  itemOffsetMapping: ItemOffsetMapping,

  /**
   * Function implementing {@link ListItemKey} that defines the key to use for each item.
   * @defaultValue `(index, _data) => index`
   */
  itemKey?: ListItemKey | undefined,

  /**
   * Choice of 'vertical' or 'horizontal' layouts
   * @defaultValue 'vertical'
   */
  layout?: ScrollLayout | undefined,
}

const defaultItemKey = (index: number, _data: unknown) => index;

const boxStyle: React.CSSProperties = { boxSizing: 'border-box' };

/**
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

  const [startIndex, startOffset, renderSize, sizes] = getRangeToRender(itemCount, itemOffsetMapping, 
    isVertical ? height : width, renderOffset);
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
