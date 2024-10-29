import React from "react";
import { ItemOffsetMapping, VirtualBaseProps, ScrollToOption, ScrollLayout } from './VirtualBase';
import { DisplayList, DisplayListItem } from './DisplayList';
import { VirtualContainerRender } from './VirtualContainer';
import { VirtualScroll, VirtualScrollProxy } from './VirtualScroll';
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

/**
 * Custom ref handle returned by {@link VirtualList} that exposes imperative methods
 * 
 * Use `React.useRef<VirtualListProxy>(null)` to create a ref.
 */
export interface VirtualListProxy {
  /**
   * Scrolls the list to the specified offset in pixels
   * @param offset - Offset to scroll to
   */
  scrollTo(offset: number): void;

  /**
   * Scrolls the list so that the specified item is visible
   * @param index - Index of item to scroll to
   * @param option - Where to {@link ScrollToOption | position} the item within the viewport
   */
  scrollToItem(index: number, option?: ScrollToOption): void;
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
  const { width, height, itemCount, itemOffsetMapping, children, className, innerClassName,
    outerRender, innerRender, maxCssSize, minNumPages, 
    itemData = undefined, layout = 'vertical', onScroll: onScrollCallback, useIsScrolling = false } = props;

  // Total size is same as offset to item one off the end
  const renderSize = itemOffsetMapping.itemOffset(itemCount);

  const [offset, setOffset] = React.useState<number>(0);
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
        const scroll = scrollRef.current;
        /* istanbul ignore if */
        if (!scroll)
          return;

        const itemOffset = itemOffsetMapping.itemOffset(index);
        const itemSize = itemOffsetMapping.itemSize(index);

        if (isVertical)
          scroll.scrollToArea(itemOffset, itemSize, undefined, undefined, option);
        else
          scroll.scrollToArea(undefined, undefined, itemOffset, itemSize, option);
      }
    }
  }, [ itemOffsetMapping, isVertical ]);

  // We can decide the JSX child type at runtime as long as we use a variable that uses the same capitalized
  // naming convention as components do.
  const ChildVar = children;

  return (
    <VirtualScroll
      ref={scrollRef}
      className={className}
      outerRender={outerRender}
      useIsScrolling={useIsScrolling}
      maxCssSize={maxCssSize}
      minNumPages={minNumPages}
      scrollHeight={isVertical ? renderSize : undefined}
      scrollWidth={isVertical ? undefined : renderSize}
      onScroll={(verticalOffset, horizontalOffset, verticalScrollState, horizontalScrollState) => {
        const newOffset = isVertical ? verticalOffset : horizontalOffset;
        setOffset(newOffset);
        if (onScrollCallback)
          onScrollCallback(newOffset, isVertical ? verticalScrollState : horizontalScrollState);
      }}
      height={height}
      width={width}>
      {({ isScrolling }) => (
        <AutoSizer style={{ height: '100%', width: '100%' }}>
        {({height,width}) => (
          <DisplayList
            innerClassName={innerClassName}
            innerRender={innerRender}
            layout={layout}
            offset={offset}
            height={height}
            itemCount={itemCount}
            itemData={itemData}
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
