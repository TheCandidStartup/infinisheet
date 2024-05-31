import React from "react";
import { ItemOffsetMapping, getRangeToRender, VirtualBaseItemProps, VirtualBaseProps, ScrollEvent } from './VirtualBase';
import { useVirtualScroll, ScrollState } from './useVirtualScroll';
import { useIsScrolling as useIsScrollingHook} from './useIsScrolling';

export type ScrollLayout = "horizontal" | "vertical";

export interface VirtualListItemProps extends VirtualBaseItemProps {
  index: number,
};

type VirtualListItem = React.ComponentType<VirtualListItemProps>;

export interface VirtualListProps extends VirtualBaseProps {
  children: VirtualListItem,
  itemCount: number,
  itemOffsetMapping: ItemOffsetMapping,
  itemKey?: (index: number, data: any) => any,
  layout?: ScrollLayout,
  onScroll?: (offset: number, newScrollState: ScrollState) => void;
};

export interface VirtualListProxy {
  scrollTo(offset: number): void;
  scrollToItem(index: number): void;
};

const defaultItemKey = (index: number, _data: any) => index;

// Using a named function rather than => so that the name shows up in React Developer Tools
export const VirtualList = React.forwardRef<VirtualListProxy, VirtualListProps>(function VirtualList(props, ref) {
  const { width, height, itemCount, itemOffsetMapping, children, 
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
  }, [ itemOffsetMapping ]);

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

  // Being far too clever. Implementing a complex iteration in JSX in a map expression by abusing the comma operator. 
  // You can't declare local variables in an expression so they need to be hoisted out of the JSX. The comma operator
  // returns the result of the final statement which makes the iteration a little clumsier.
  let nextOffset = startOffset - renderOffset;
  let index, offset;

  return (
    <div onScroll={onScroll} ref={outerRef} style={{ position: "relative", height, width, overflow: "auto", willChange: "transform" }}>
      <div style={{ height: isVertical ? renderSize : "100%", width: isVertical ? "100%" : renderSize }}>
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
      </div>
    </div>
  );
});

export default VirtualList;
