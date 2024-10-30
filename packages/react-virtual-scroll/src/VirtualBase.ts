import React from "react";
import { VirtualContainerRender } from './VirtualContainer';

/**
 * Common props for {@link DisplayListItem} and {@link DisplayGridItem}
 */
export interface DisplayBaseItemProps {
  /** Value of {@link DisplayBaseProps.itemData} from owning component */
  data: unknown,

  /** 
   * Is the owning component being actively scrolled? Used to change how the item is rendered depending on scroll state.
   * 
   * Value passed through from {@link DisplayBaseProps.isScrolling}.
   * */
  isScrolling?: boolean,

  /** Style that should be applied to each item rendered. Positions the item within the inner container. */
  style: React.CSSProperties,
}

/**
 * Common props for all components
 */
export interface ComponentProps {
  /** The `className` applied to the outer container element. Use when styling the entire component. */
  className?: string,

  /** The `className` applied to the inner container element. Use for special cases when styling only the inner container and items. */
  innerClassName?: string,

  /** Component height */
  height: number,

   /** Component width */
  width: number
}

/**
 * Common props for {@link DisplayList} and {@link DisplayGrid}
 */
export interface  DisplayBaseProps extends ComponentProps {
  /** Passed as {@link DisplayBaseItemProps.data} to each child item */
  itemData?: unknown,

  /** Passed as {@link DisplayBaseItemProps.isScrolling} to each child item
   * 
   * Provided as a convenience when combining display components with {@link VirtualScroll}
   * Not interpreted by the display component itself
   */
  isScrolling?: boolean,

  /** 
   * Renders the outer viewport div which provides a window onto the inner grid div
   * 
   * Render prop implementing {@link VirtualContainerRender}. Used to customize display component outer container.
   */
  outerRender?: VirtualContainerRender;

  /** 
   * Renders the inner grid div containing all the list items
   * 
   * Render prop implementing {@link VirtualContainerRender}. Used to customize display component inner container.
   */
  innerRender?: VirtualContainerRender;
}

/**
 * Common props for all virtual scrollable components
 */
export interface VirtualScrollableProps extends ComponentProps {
  /** 
   * Determines whether the component should track whether it's being actively scrolled
   * and pass through when rendering its content.
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
   * The minimum number of virtual pages to use when inner container would otherwise be more than {@link VirtualScrollableProps.maxCssSize} big.
   * You should never normally need to change this.
   * 
   * @defaultValue 100
   */
  minNumPages?: number
}

/**
 * Common props for {@link VirtualList} and {@link VirtualGrid}
 */
export interface VirtualBaseProps extends VirtualScrollableProps {
  /** Passed as {@link DisplayBaseItemProps.data} to each child item */
  itemData?: unknown,
}

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

/**
 * Option for {@link VirtualGridProxy.scrollToItem} and {@link VirtualListProxy.scrollToItem}
 * 
 * * `topleft` scrolls the item as far to the top and left as possible
 * * `visible` scrolls the item the minimum amount needed to ensure that it's visible
 * 
 *  @defaultValue `topleft`
 */
export type ScrollToOption = 'topleft' | 'visible';

/** Specifies the direction over which lists should implement virtual scrolling */
export type ScrollLayout = "horizontal" | "vertical";
