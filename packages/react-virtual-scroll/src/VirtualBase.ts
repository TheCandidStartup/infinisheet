import React from "react";

/**
 * Common props for {@link VirtualListItem} and {@link VirtualGridItem}
 */
export interface VirtualBaseItemProps {
  /** Value of {@link VirtualBaseProps.itemData} from owning component */
  data: unknown,

  /** 
   * Is the owning component being actively scrolled? Used to change how the item is rendered depending on scroll state.
   * 
   * Only defined if {@link VirtualBaseProps.useIsScrolling} is true. 
   * */
  isScrolling?: boolean,

  /** Style that should be applied to each item rendered. Positions the item within the inner container. */
  style: React.CSSProperties,
}

/**
 * Common props for {@link VirtualList} and {@link VirtualGrid}
 */
export interface VirtualBaseProps {
  /** The `className` applied to the outer container element. Use when styling the entire component. */
  className?: string,

  /** The `className` applied to the inner container element. Use for special cases when styling only the inner container and items. */
  innerClassName?: string,

  /** Component height */
  height: number,

   /** Component width */
  width: number,

    /** Passed as {@link VirtualBaseItemProps.data} to each child item */
  itemData?: unknown,

  /** 
   * Determines whether the component should track whether it's being actively scrolled
   * and pass to child items as {@link VirtualBaseItemProps.isScrolling}.
   * 
   * @defaultValue false
   * */
  useIsScrolling?: boolean,

  /** 
   * Maximum size for CSS element beyond which layout breaks. You should never normally need to change this. 
   * The default value is compatible with all major browsers.
   * 
   * @defaultValue 6000000
   * */
  maxCssSize?: number,

  /**
   * The minimum number of virtual pages to use when inner container would otherwise be more than {@link VirtualBaseProps.maxCssSize} big.
   * You should never normally need to change this.
   * 
   * @defaultValue 100
   */
  minNumPages?: number
}

/**
 * Props that an implementation of {@link VirtualInnerRender} must accept.
 */
export interface VirtualInnerProps {
  /** The `className` to apply to the inner container div. Passed through from {@link VirtualBaseProps.innerClassName} */
  className: string | undefined;

  /** The visible child items rendered into the inner container div */
  children: React.ReactNode;

  /** Style to apply to the inner container div */
  style: React.CSSProperties;
}

/**
 * Render prop for inner container in a virtual scrolling component
 *
 * Can be passed to {@link VirtualList} or {@link VirtualGrid} to replace default
 * implementation. Function must render a div and forward {@link VirtualInnerProps}
 * and any `ref` to it. 
 * 
 * @example Minimal compliant implementation
 * ```
 * const innerRender: VirtualInnerRender = ({...rest}, ref) => (
 *   <div ref={ref} {...rest} />
 * )
 * ```
 */
export type VirtualInnerRender = (props: VirtualInnerProps, ref?: React.ForwardedRef<HTMLDivElement>) => JSX.Element;

/**
 * Props that an implementation of {@link VirtualOuterRender} must accept.
 */
export interface VirtualOuterProps {
    /** The `className` to apply to the outer container div. Passed through from {@link VirtualBaseProps.className} */
  className: string | undefined;

  /** The child inner container rendered into the outer container div */
  children: React.ReactNode;

    /** Style to apply to the outer container div */
  style: React.CSSProperties;

  /** Scroll callback that should be applied to the outer container div */
  onScroll: (event: ScrollEvent) => void;
}

/**
 * Render prop for outer container in a virtual scrolling component
 *
 * Can be passed to {@link VirtualList} or {@link VirtualGrid} to replace default
 * implementation. Function must render a div and forward {@link VirtualOuterProps}
 * and any `ref` to it. 
 * 
 * @example Minimal compliant implementation
 * ```
 * const outerRender: VirtualOuterRender = ({style, ...rest}, ref) => (
 *   <div ref={ref} {...rest} />
 * )
 * ```
 */
export type VirtualOuterRender = (props: VirtualOuterProps, ref?: React.ForwardedRef<HTMLDivElement>) => JSX.Element;

/**
 * Interface that {@link VirtualList} and {@link VirtualGrid} use to determine size and 
 * positioning offset for items in a single dimension. 
 */
export interface ItemOffsetMapping {
  /** Size of item with given index */
  itemSize(itemIndex: number): number;

  /** Offset from start of container to specified item
   * 
   * `itemOffset(n)` should be equal to `Sum{i:0->n-1}(itemSize(i))`
   * 
   * To efficiently support large containers, cost should be `O(logn)` or better.
   */
  itemOffset(itemIndex: number): number;

  /** Given an offset, return the index of the item that intersects that offset, together with the start offset of that item */
  offsetToItem(offset: number): [itemIndex: number, startOffset: number];
}

/**  Alias for type of event that React passes to a `div` element's `OnScroll` handler. */
export type ScrollEvent = React.SyntheticEvent<HTMLDivElement>;

