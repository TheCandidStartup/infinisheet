import React from "react";
import type { ItemOffsetMapping } from "@candidstartup/infinisheet-types";
import { VirtualBaseProps, ScrollToOption, ScrollLayout } from './VirtualBase';
import { DisplayList, DisplayListItem } from './DisplayList';
import { VirtualContainerRender } from './VirtualContainer';
import { VirtualScroll } from './VirtualScroll';
import { VirtualScrollProxy } from './VirtualScrollProxy';
import { virtualListScrollToItem, VirtualListProxy } from './VirtualListProxy';
import { AutoSizer } from './AutoSizer';
import { ScrollState } from './useVirtualScroll';

/**
 * Props accepted by {@link VirtualList}
 */
export interface VirtualListProps extends VirtualBaseProps {
  /** Component used as a template to render items in the list. Must implement {@link DisplayListItem} interface. */
  children: DisplayListItem,

  /** Number of items in the list */
  itemCount: number,

  /** 
   * Implementation of {@link ItemOffsetMapping} interface that defines size and offset to each item in the list
   * 
   * Use {@link useFixedSizeItemOffsetMapping} or {@link useVariableSizeItemOffsetMapping} to create implementations
   * for common cases.
   */
  itemOffsetMapping: ItemOffsetMapping,

  /**
   * Function that defines the key to use for each item given item index and value of {@link VirtualBaseProps.itemData}.
   * @defaultValue `(index, _data) => index`
   */
  itemKey?: (index: number, data: unknown) => React.Key,

  /**
   * Choice of 'vertical' or 'horizontal' layouts
   * @defaultValue 'vertical'
   */
  layout?: ScrollLayout,

  /**
   * Callback after a scroll event has been processed and state updated but before rendering
   * @param offset - Resulting overall offset. Can be passed to {@link ItemOffsetMapping} to determine top item.
   * @param newScrollState - New {@link ScrollState} that will be used for rendering.
   */
  onScroll?: (offset: number, newScrollState: ScrollState) => void;

  /** Render prop implementing {@link VirtualContainerRender}. Used to customize {@link VirtualList} outer container. */
  outerRender?: VirtualContainerRender;

  /** Render prop implementing {@link VirtualContainerRender}. Used to customize {@link DisplayList} within {@link VirtualList} inner container. */
  innerRender?: VirtualContainerRender;
}



// Using a named function rather than => so that the name shows up in React Developer Tools
/**
 * Virtual Scrolling List
 * 
 * Accepts props defined by {@link VirtualListProps}. 
 * Refs are forwarded to {@link VirtualListProxy}. 
 * You must pass a single instance of {@link DisplayListItem} as a child.
 * @group Components
 */
export const VirtualList = React.forwardRef<VirtualListProxy, VirtualListProps>(function VirtualList(props, ref) {
  const { itemCount, itemOffsetMapping, children, layout = 'vertical', onScroll: onScrollCallback,
    innerClassName, innerRender, itemData, itemKey, ...scrollProps } = props;

  // Total size is same as offset to item one off the end
  const renderSize = itemOffsetMapping.itemOffset(itemCount);

  const scrollRef = React.useRef<VirtualScrollProxy>(null);
  const isVertical = layout === 'vertical';

  React.useImperativeHandle(ref, () => {
    return {
      scrollTo(offset: number): void {
        const scroll = scrollRef.current;
        /* istanbul ignore if */
        if (!scroll)
          return;

        if (isVertical)
          scroll.scrollTo(offset, undefined);
        else
          scroll.scrollTo(undefined, offset);
      },

      scrollToItem(index: number, option?: ScrollToOption): void {
        virtualListScrollToItem(scrollRef, itemOffsetMapping, isVertical, index, option);
      },

      get offset(): number {
        const scroll = scrollRef.current;
        /* istanbul ignore if */
        if (!scroll)
          return 0;

        return isVertical ? scroll.verticalOffset : scroll.horizontalOffset;
      }
    }
  }, [ itemOffsetMapping, isVertical ]);

  // We can decide the JSX child type at runtime as long as we use a variable that uses the same capitalized
  // naming convention as components do.
  const ChildVar = children;

  return (
    <VirtualScroll
      ref={scrollRef}
      {...scrollProps}
      scrollHeight={isVertical ? renderSize : undefined}
      scrollWidth={isVertical ? undefined : renderSize}
      onScroll={(verticalOffset, horizontalOffset, verticalScrollState, horizontalScrollState) => {
        const newOffset = isVertical ? verticalOffset : horizontalOffset;
        if (onScrollCallback)
          onScrollCallback(newOffset, isVertical ? verticalScrollState : horizontalScrollState);
      }}>
      {({ isScrolling, verticalOffset, horizontalOffset }) => (
        <AutoSizer style={{ height: '100%', width: '100%' }}>
        {({height,width}) => (
          <DisplayList
            innerClassName={innerClassName}
            innerRender={innerRender}
            layout={layout}
            offset={isVertical ? verticalOffset : horizontalOffset}
            height={height}
            itemCount={itemCount}
            itemData={itemData}
            itemKey={itemKey}
            isScrolling={isScrolling}
            itemOffsetMapping={itemOffsetMapping}
            width={width}>
            {ChildVar}
        </DisplayList>
      )}
      </AutoSizer>
      )}
    </VirtualScroll>
  );
});

export default VirtualList;
