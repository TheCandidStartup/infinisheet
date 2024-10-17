import React from "react";
import { ItemOffsetMapping, ScrollLayout } from './VirtualBase';
import { getRangeToRender } from './VirtualCommon';

/**
 * Props accepted by {@link DisplayListItem}
 */
export interface DisplayListItemProps  {
  /** Index of item in the list being rendered */
  index: number,

  /** Value of {@link DisplayListProps.itemData} from owning component */
  data: unknown,

  /** Style that should be applied to each item rendered. Positions the item within the container. */
  style: React.CSSProperties,
}

/**
 * Type of item in a {@link DisplayList}
 *
 * Must be passed as a child to {@link DisplayList}. 
 * Accepts props defined by {@link DisplayListItemProps}.
 * Component must pass {@link DisplayListItemProps.style} to whatever it renders. 
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
 * Props that an implementation of {@link DisplayContainerRender} must accept.
 */
export interface DisplayContainerProps {
  /** The `className` to apply to the container div. Passed through from {@link DisplayListProps.className} */
  className: string | undefined;

  /** The visible child items rendered into the inner container div */
  children: React.ReactNode;

  /** Style to apply to the inner container div */
  style: React.CSSProperties;
}

/**
 * Render prop for container in a {@link DisplayList}
 *
 * Can be passed to {@link DisplayList} to replace default implementation. 
 * Function must render a div and forward {@link DisplayContainerProps}
 * and any `ref` to it. 
 * 
 * @example Minimal compliant implementation
 * ```
 * const containerRender: DisplayContainerRender = ({...rest}, ref) => (
 *   <div ref={ref} {...rest} />
 * )
 * ```
 */
export type DisplayContainerRender = (props: DisplayContainerProps, ref?: React.ForwardedRef<HTMLDivElement>) => JSX.Element;

/**
 * Props accepted by {@link DisplayList}
 */
export interface DisplayListProps {
  /** Component used as a template to render items in the list. Must implement {@link DisplayListItem} interface. */
  children: DisplayListItem,

  /** The `className` applied to the container element. Use when styling the entire component. */
  className?: string,

  /** Component height */
  height: number,

   /** Component width */
  width: number,

  /** Number of items in the list */
  itemCount: number,

  /** Offset to start of displayed content */
  offset: number,

  /** Passed as {@link DisplayListItemProps.data} to each child item */
  itemData?: unknown,

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

  /** Render prop implementing {@link DisplayContainerRender}. Used to customize {@link DisplayList}. */
  containerRender?: DisplayContainerRender;
}

const defaultItemKey = (index: number, _data: unknown) => index;

interface  DisplayContainerComponentProps extends DisplayContainerProps {
  render: DisplayContainerRender;
}

const Container = React.forwardRef<HTMLDivElement, DisplayContainerComponentProps >(function DisplayListContainer({render, ...rest}, ref) {
  return render(rest, ref)
})

const defaultContainerRender: DisplayContainerRender = ({...rest}, ref) => (
  <div ref={ref} {...rest} />
)

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
  const { width, height, itemCount, itemOffsetMapping, className, offset: renderOffset, children,
    itemData, itemKey = defaultItemKey, layout = 'vertical', containerRender = defaultContainerRender } = props;

  const outerRef = React.useRef<HTMLDivElement>(null);
  const isVertical = layout === 'vertical';

  const [startIndex, startOffset, sizes] = getRangeToRender(itemCount, itemOffsetMapping, 
    isVertical ? height : width, renderOffset);

  // We can decide the JSX child type at runtime as long as we use a variable that uses the same capitalized
  // naming convention as components do.
  const ChildVar = children;

  // Being far too clever. Implementing a complex iteration in JSX in a map expression by abusing the comma operator. 
  // You can't declare local variables in an expression so they need to be hoisted out of the JSX. The comma operator
  // returns the result of the final statement which makes the iteration a little clumsier.
  let nextOffset = startOffset - renderOffset;
  let index, offset;

  return (
    <Container className={className} render={containerRender} ref={outerRef} 
        style={{ position: "relative", height, width, overflow: "hidden", willChange: "transform" }}>
      {sizes.map((size, arrayIndex) => (
        offset = nextOffset,
        nextOffset += size,
        index = startIndex + arrayIndex,
        <ChildVar data={itemData} key={itemKey(index, itemData)} index={index}
          style={{ 
            position: "absolute", 
            top: isVertical ? offset : undefined, 
            left: isVertical ? undefined : offset,
            height: isVertical ? size : "100%", 
            width: isVertical ? "100%" : size, 
          }}/>
      ))}
    </Container>
  );
}

export default DisplayList;
