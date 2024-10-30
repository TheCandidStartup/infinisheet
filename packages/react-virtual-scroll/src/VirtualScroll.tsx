import React from "react";
import { VirtualContainer, VirtualContainerRender } from './VirtualContainer';
import { VirtualScrollableProps, ScrollEvent, ScrollToOption } from './VirtualBase';
import { useVirtualScroll, ScrollState } from './useVirtualScroll';
import { useIsScrolling as useIsScrollingHook} from './useIsScrolling';
import { getOffsetToScrollRange } from './VirtualCommon';

/**
 * Props that an implementation of {@link VirtualContentRender} must accept.
 */
export interface VirtualContentProps {
  /** 
   * Is the owning component being actively scrolled? Used to change how the content is rendered depending on scroll state.
   * 
   * Only defined if {@link VirtualScrollableProps.useIsScrolling} is true. 
   * */
  isScrolling?: boolean
}

/**
 * Render prop for content container in {@link VirtualScroll}
 *
 * Pass to {@link VirtualScroll} to render content into the viewport
 * implementation. Function must render a div and forward {@link VirtualContentProps}
 * and any `ref` to it. 
 * 
 * @example Minimal compliant implementation
 * ```
 * const contentRender: VirtualContentRender = ({isScrolling, ...rest}, ref) => (
 *   <div ref={ref} {...rest} />
 * )
 * ```
 */
export type VirtualContentRender = (props: VirtualContentProps, ref?: React.ForwardedRef<HTMLDivElement>) => JSX.Element;

/**
 * Props accepted by {@link VirtualScroll}
 */
export interface VirtualScrollProps extends VirtualScrollableProps {
  /** Function implementing {@link VirtualContentRender} that renders the content that needs to respond to scrolling */
  children: VirtualContentRender

  /** 
   * Height of area to scroll over 
   * 
   * @defaultValue 0
   */
  scrollHeight?: number,

  /** 
   * Width of area to scroll over 
   * 
   * @defaultValue 0
   */
  scrollWidth?: number,

  /**
   * Callback after a scroll event has been processed and state updated but before rendering
   * @param verticalOffset - Resulting overall vertical offset. 
   * @param horizontalOffset - Resulting overall horizontal offset.
   * @param newVerticalScrollState - New vertical {@link ScrollState} that will be used for rendering.
   * @param newHorizontalScrollState - New horizontal {@link ScrollState} that will be used for rendering.
   */
  onScroll?: (verticalOffset: number, horizontalOffset: number, newVerticalScrollState: ScrollState, newHorizontalScrollState: ScrollState) => void;

  /** Render prop implementing {@link VirtualContainerRender}. Used to customize {@link VirtualScroll} outer container. */
  outerRender?: VirtualContainerRender;

  /** Render prop implementing {@link VirtualContainerRender}. Used to customize {@link VirtualScroll} inner container. */
  innerRender?: VirtualContainerRender;
}

/**
 * Custom ref handle returned by {@link VirtualScroll} that exposes imperative methods
 * 
 * Use `React.useRef<VirtualScrollProxy>(null)` to create a ref.
 */
export interface VirtualScrollProxy {
  /**
   * Scrolls to the specified vertical and horizontal offset in pixels
   * Either offset can be left undefined to scroll in one dimension only
   * @param verticalOffset - Offset to scroll to vertically
   * @param horizontalOffset - Offset to scroll to horizontally
   */
  scrollTo(verticalOffset?: number, horizontalOffset?: number): void;

    /**
   * Scrolls to the specified area
   * Either offset/size pair can be left undefined to scroll in one dimension only
   * @param verticalOffset - Offset to scroll to vertically
   * @param verticalSize - Size of target area vertically
   * @param horizontalOffset - Offset to scroll to horizontally
   * @param horizontalSize - Size of target area horizontally
   * @param option - Where to {@link ScrollToOption | position} the area within the viewport
   */
  scrollToArea(verticalOffset?: number, verticalSize?: number, horizontalOffset?: number, horizontalSize?: number, option?: ScrollToOption): void;

  /** Exposes DOM clientWidth property */
  get clientWidth(): number;

  /** Exposes DOM clientHeight property */
  get clientHeight(): number;
}

// Using a named function rather than => so that the name shows up in React Developer Tools
/**
 * Customizable Virtual Scrolling Component
 * 
 * Allows user to scroll over a virtual area `scrollHeight` x `scrollWidth` pixels. 
 * Use `onScroll` to track scroll state and `innerRender` to render scroll state specific content into the viewport
 * 
 * Accepts props defined by {@link VirtualScrollProps}. 
 * Refs are forwarded to {@link VirtualScrollProxy}. 
 * @group Components
 */
export const VirtualScroll = React.forwardRef<VirtualScrollProxy, VirtualScrollProps>(function VirtualScroll(props, ref) {
  const { width, height, scrollWidth = 0, scrollHeight = 0, className, innerClassName, children,
    onScroll: onScrollCallback, useIsScrolling = false, innerRender, outerRender } = props;

  const outerRef = React.useRef<HTMLDivElement>(null);
  const { scrollOffset: scrollRowOffset, renderOffset: renderRowOffset, renderSize: renderRowSize,
    onScroll: onScrollRow, doScrollTo: doScrollToRow } = useVirtualScroll(scrollHeight, props.maxCssSize, props.minNumPages);
  const currentVerticalOffset = scrollRowOffset + renderRowOffset;
  const { scrollOffset: scrollColOffset, renderOffset: renderColOffset, renderSize: renderColumnSize,
    onScroll: onScrollColumn, doScrollTo: doScrollToColumn} = useVirtualScroll(scrollWidth, props.maxCssSize, props.minNumPages);
  const currentHorizontalOffset = scrollColOffset + renderColOffset;
  const isActuallyScrolling = useIsScrollingHook(outerRef);

  React.useImperativeHandle(ref, () => {
    return {
      scrollTo(rowOffset?: number, columnOffset?: number): void {
        if (rowOffset === undefined && columnOffset === undefined)
          return;

        const outer = outerRef.current;
        /* istanbul ignore else */
        if (outer) {
          const options: ScrollToOptions = {};
          if (rowOffset != undefined)
            options.top = doScrollToRow(rowOffset, outer.clientHeight);
          if (columnOffset != undefined)
            options.left = doScrollToColumn(columnOffset, outer.clientWidth);
          outer.scrollTo(options);
        }
      },

      scrollToArea(verticalOffset?: number, verticalSize?: number, horizontalOffset?: number, horizontalSize?: number, option?: ScrollToOption) {
        const outer = outerRef.current;
        /* istanbul ignore if*/
        if (!outer)
          return;

        const rowOffset = getOffsetToScrollRange(verticalOffset, verticalSize, outer.clientHeight, currentVerticalOffset, option);
        const colOffset = getOffsetToScrollRange(horizontalOffset, horizontalSize, outer.clientWidth, currentHorizontalOffset, option);
        this.scrollTo(rowOffset, colOffset);
      },

      get clientWidth(): number {
        return outerRef.current ? outerRef.current.clientWidth : /* istanbul ignore next */ 0;
      },

      get clientHeight(): number {
        return outerRef.current ? outerRef.current.clientHeight : /* istanbul ignore next */ 0;
      }
    }
  }, [ doScrollToRow, doScrollToColumn, currentVerticalOffset, currentHorizontalOffset ]);

  function onScroll(event: ScrollEvent) {
    const { clientWidth, clientHeight, scrollWidth, scrollHeight, scrollLeft, scrollTop } = event.currentTarget;
    const [newScrollTop, newRowScrollState] = onScrollRow(clientHeight, scrollHeight, scrollTop);
    const [newScrollLeft, newColumnScrollState] = onScrollColumn(clientWidth, scrollWidth, scrollLeft);
    if (outerRef.current && (newScrollTop != scrollTop || newScrollLeft != scrollLeft ))
      outerRef.current.scrollTo(newScrollLeft, newScrollTop);
    onScrollCallback?.(newRowScrollState.scrollOffset+newRowScrollState.renderOffset, 
      newColumnScrollState.scrollOffset+newColumnScrollState.renderOffset, newRowScrollState, newColumnScrollState);
  }

  const isScrolling = useIsScrolling ? isActuallyScrolling : undefined;

  return (
    <VirtualContainer className={className} render={outerRender} onScroll={onScroll} ref={outerRef} 
        style={{ position: "relative", height, width, overflow: "auto", willChange: "transform" }}>
      <VirtualContainer className={innerClassName} render={innerRender} 
        style={{ zIndex: 1, position: 'sticky', top: 0, left: 0, width: '100%', height: '100%' }}>
        {children({isScrolling})}
      </VirtualContainer>
      <div style={{ position: 'absolute', top: 0, left: 0, 
        height: scrollHeight ? renderRowSize : '100%', 
        width: scrollWidth ? renderColumnSize : '100%'}}/>
    </VirtualContainer>
  );
});

export default VirtualScroll;
