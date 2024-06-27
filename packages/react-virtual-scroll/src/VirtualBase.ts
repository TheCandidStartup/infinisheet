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

  height: number,
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
   * The minimum number of virtual pages to use when inner container would otherwise be more than {@link VirtualBaseItemProps.maxCssSize} big.
   * You should never normally need to change this.
   * 
   * @defaultValue 100
   */
  minNumPages?: number
}

/**
 * Props that an implementation of {@link VirtualInnerComponent} must accept.
 */
export interface VirtualInnerProps {
  className: string | undefined;
  children: React.ReactNode;
  style: React.CSSProperties;
}

/**
 * Type of inner container in a virtual scrolling component
 *
 * Can be passed to {@link VirtualList} or {@link VirtualGrid} to replace default
 * implementation. Component must render a div and forward {@link VirtualInnerProps}
 * and any `ref` to it. 
 * 
 * @example Minimal compliant implementation
 * ```
 * const Inner = React.forwardRef<HTMLDivElement, VirtualInnerProps >(({...rest}, ref) => (
 *   <div ref={ref} {...rest} />
 * )
 * ```
 */
export type VirtualInnerComponent = React.ComponentType<VirtualInnerProps>;

/**
 * Props that an implementation of {@link VirtualOuterComponent} must accept.
 */
export interface VirtualOuterProps {
  className: string | undefined;
  children: React.ReactNode;
  style: React.CSSProperties;
  onScroll: (event: ScrollEvent) => void;
}

/**
 * Type of outer container in a virtual scrolling component
 *
 * Can be passed to {@link VirtualList} or {@link VirtualGrid} to replace default
 * implementation. Component must render a div and forward {@link VirtualOuterProps}
 * and any `ref` to it. 
 * 
 * @example Minimal compliant implementation
 * ```
 * const Outer = React.forwardRef<HTMLDivElement, VirtualOuterProps >(({...rest}, ref) => (
 *   <div ref={ref} {...rest} />
 * )
 * ```
 */
export type VirtualOuterComponent = React.ComponentType<VirtualOuterProps>;

export interface ItemOffsetMapping {
  itemSize(itemIndex: number): number;
  itemOffset(itemIndex: number): number;
  offsetToItem(offset: number): [itemIndex: number, startOffset: number];
}

export type ScrollEvent = React.SyntheticEvent<HTMLDivElement>;

type RangeToRender = [
  startIndex: number,
  startOffset: number,
  sizes: number[]
];

export function getRangeToRender(itemCount: number, itemOffsetMapping: ItemOffsetMapping, clientExtent: number, scrollOffset: number): RangeToRender {
  if (itemCount == 0) {
    return [0, 0, []];
  }

  let [itemIndex, startOffset] = itemOffsetMapping.offsetToItem(scrollOffset);
  itemIndex = Math.max(0, Math.min(itemCount - 1, itemIndex));
  const endOffset = scrollOffset + clientExtent;

  const overscanBackward = 1;
  const overscanForward = 1;

  for (let step = 0; step < overscanBackward && itemIndex > 0; step ++) {
    itemIndex --;
    startOffset -= itemOffsetMapping.itemSize(itemIndex);
  }

  const startIndex = itemIndex;
  let offset = startOffset;
  const sizes: number[] = [];

  while (offset < endOffset && itemIndex < itemCount) {
    const size = itemOffsetMapping.itemSize(itemIndex);
    sizes.push(size);
    offset += size;
    itemIndex ++;
  }

  for (let step = 0; step < overscanForward && itemIndex < itemCount; step ++) {
    const size = itemOffsetMapping.itemSize(itemIndex);
    sizes.push(size);
    itemIndex ++;
  }

  return [startIndex, startOffset, sizes];
}
