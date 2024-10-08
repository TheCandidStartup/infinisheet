import React from "react";
import { ItemOffsetMapping, VirtualBaseItemProps, VirtualBaseProps, 
  VirtualInnerProps, VirtualInnerRender, VirtualOuterProps, VirtualOuterRender, ScrollEvent } from './VirtualBase';
import { getRangeToRender } from './VirtualCommon';
import { useVirtualScroll, ScrollState } from './useVirtualScroll';
import { useIsScrolling as useIsScrollingHook} from './useIsScrolling';

/** Specifies the direction over which the list should implement virtual scrolling */
export type ScrollLayout = "horizontal" | "vertical";

/**
 * Props accepted by {@link VirtualListItem}
 */
export interface VirtualListItemProps extends VirtualBaseItemProps {
  /** Index of item in the list being rendered */
  index: number,
}

/**
 * Type of item in a {@link VirtualList}
 *
 * Must be passed as a child to {@link VirtualList}. 
 * Accepts props defined by {@link VirtualListItemProps}.
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
export type VirtualListItem = React.ComponentType<VirtualListItemProps>;

/**
 * Props accepted by {@link VirtualList}
 */
export interface VirtualListProps extends VirtualBaseProps {
  /** Component used as a template to render items in the list. Must implement {@link VirtualListItem} interface. */
  children: VirtualListItem,

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

  /** Render prop implementing {@link VirtualOuterRender}. Used to customize {@link VirtualList}. */
  outerRender?: VirtualOuterRender;

  /** Render prop implementing {@link VirtualInnerRender}. Used to customize {@link VirtualList}. */
  innerRender?: VirtualInnerRender;
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
   */
  scrollToItem(index: number): void;
}

const defaultItemKey = (index: number, _data: unknown) => index;

interface VirtualInnerComponentProps extends VirtualInnerProps {
  render: VirtualInnerRender;
}

const Inner = React.forwardRef<HTMLDivElement, VirtualInnerComponentProps >(function VirtualListInner({render, ...rest}, ref) {
  return render(rest, ref)
})

function defaultInnerRender({...rest}: VirtualInnerProps, ref?: React.ForwardedRef<HTMLDivElement>): JSX.Element {
  return <div ref={ref} {...rest} />
}

interface VirtualOuterComponentProps extends VirtualOuterProps {
  render: VirtualOuterRender;
}

const Outer = React.forwardRef<HTMLDivElement, VirtualOuterComponentProps >(function VirtualListOuter({render, ...rest}, ref) {
  return render(rest, ref)
})

function defaultOuterRender({...rest}: VirtualOuterProps, ref?: React.ForwardedRef<HTMLDivElement>): JSX.Element {
  return <div ref={ref} {...rest} />
}

// Using a named function rather than => so that the name shows up in React Developer Tools
/**
 * Virtual Scrolling List
 * 
 * Accepts props defined by {@link VirtualListProps}. 
 * Refs are forwarded to {@link VirtualListProxy}. 
 * You must pass a single instance of {@link VirtualListItem} as a child.
 * @group Components
 */
export const VirtualList = React.forwardRef<VirtualListProxy, VirtualListProps>(function VirtualList(props, ref) {
  const { width, height, itemCount, itemOffsetMapping, children, className, innerClassName,
    itemData = undefined, itemKey = defaultItemKey, layout = 'vertical', onScroll: onScrollCallback, useIsScrolling = false } = props;

  // Total size is same as offset to item one off the end
  const totalSize = itemOffsetMapping.itemOffset(itemCount);

  const outerRef = React.useRef<HTMLDivElement>(null);
  const { scrollOffset, renderOffset, renderSize, onScroll: onScrollExtent, doScrollTo } = 
    useVirtualScroll(totalSize, props.maxCssSize, props.minNumPages);
  const isScrolling = useIsScrollingHook(outerRef); 
  const isVertical = layout === 'vertical';

  React.useImperativeHandle(ref, () => {
    return {
      scrollTo(offset: number): void {
        const outer = outerRef.current;
        /* istanbul ignore else */
        if (outer) {
          if (isVertical)
            outer.scrollTo(0, doScrollTo(offset, outer.clientHeight));
          else
            outer.scrollTo(doScrollTo(offset, outer.clientWidth), 0);
        }
      },

      scrollToItem(index: number): void {
        this.scrollTo(itemOffsetMapping.itemOffset(index));
      }
    }
  }, [ itemOffsetMapping, isVertical, doScrollTo ]);

  function onScroll(event: ScrollEvent) {
    if (isVertical) {
      const { clientHeight, scrollHeight, scrollTop, scrollLeft } = event.currentTarget;
      const [newScrollTop, newScrollState] = onScrollExtent(clientHeight, scrollHeight, scrollTop);
      if (newScrollTop != scrollTop && outerRef.current)
        outerRef.current.scrollTo(scrollLeft, newScrollTop);
      onScrollCallback?.(newScrollState.scrollOffset+newScrollState.renderOffset, newScrollState);
    } else {
      const { clientWidth, scrollWidth, scrollTop, scrollLeft } = event.currentTarget;
      const [newScrollLeft, newScrollState] = onScrollExtent(clientWidth, scrollWidth, scrollLeft);
      if (newScrollLeft != scrollLeft && outerRef.current)
        outerRef.current.scrollTo(newScrollLeft, scrollTop);
      onScrollCallback?.(newScrollState.scrollOffset+newScrollState.renderOffset, newScrollState);
    }
  }

  const [startIndex, startOffset, sizes] = getRangeToRender(itemCount, itemOffsetMapping, 
    isVertical ? height : width, scrollOffset+renderOffset);

  // We can decide the JSX child type at runtime as long as we use a variable that uses the same capitalized
  // naming convention as components do.
  const ChildVar = children;
  const outerRender = props.outerRender || defaultOuterRender;
  const innerRender = props.innerRender || defaultInnerRender;

  // Being far too clever. Implementing a complex iteration in JSX in a map expression by abusing the comma operator. 
  // You can't declare local variables in an expression so they need to be hoisted out of the JSX. The comma operator
  // returns the result of the final statement which makes the iteration a little clumsier.
  let nextOffset = startOffset - renderOffset;
  let index, offset;

  return (
    <Outer className={className} render={outerRender} onScroll={onScroll} ref={outerRef} 
        style={{ position: "relative", height, width, overflow: "auto", willChange: "transform" }}>
      <Inner className={innerClassName} render={innerRender}
          style={{ height: isVertical ? renderSize : "100%", width: isVertical ? "100%" : renderSize }}>
        {sizes.map((size, arrayIndex) => (
          offset = nextOffset,
          nextOffset += size,
          index = startIndex + arrayIndex,
          <ChildVar data={itemData} key={itemKey(index, itemData)} index={index}
            isScrolling={useIsScrolling ? isScrolling : undefined}
            style={{ 
              position: "absolute", 
              top: isVertical ? offset : undefined, 
              left: isVertical ? undefined : offset,
              height: isVertical ? size : "100%", 
              width: isVertical ? "100%" : size, 
            }}/>
        ))}
      </Inner>
    </Outer>
  );
});

export default VirtualList;
