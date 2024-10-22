import React from "react";
import { ItemOffsetMapping, ScrollLayout } from './VirtualBase';
import { getRangeToRender, getGridTemplate } from './VirtualCommon';

/**
 * Props accepted by {@link DisplayListItem}
 */
export interface DisplayListItemProps  {
  /** Index of item in the list being rendered */
  index: number,

  /** Value of {@link DisplayListProps.itemData} from owning component */
  data: unknown,

  /** Style that should be applied to each item rendered. Positions the item within the inner container. */
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
  /** The `className` to apply to the container div. */
  className: string | undefined;

  /** The child items rendered into the container div */
  children: React.ReactNode;

  /** Style to apply to the container div */
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

  /** The `className` applied to the outer container element. Use when styling the entire component. */
  className?: string,

  /** The `className` applied to the inner container element. Use for special cases when styling only the inner container and items. */
  innerClassName?: string,

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

  /** 
   * Renders the outer viewport div which provides a window onto the inner grid div
   * 
   * Render prop implementing {@link DisplayContainerRender}. Used to customize {@link DisplayList}. */
  outerRender?: DisplayContainerRender;

  /** 
   * Renders the inner grid div containing all the list items
   * 
   * Render prop implementing {@link DisplayContainerRender}. Used to customize {@link DisplayList}. */
  innerRender?: DisplayContainerRender;
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

const boxStyle: React.CSSProperties = { boxSizing: 'border-box' };

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
  const { width, height, itemCount, itemOffsetMapping, className, innerClassName, offset: renderOffset, children,
    itemData, itemKey = defaultItemKey, layout = 'vertical', outerRender = defaultContainerRender,
    innerRender = defaultContainerRender } = props;

  const isVertical = layout === 'vertical';

  const [startIndex, startOffset, sizes] = getRangeToRender(itemCount, itemOffsetMapping, 
    isVertical ? height : width, renderOffset);
  const renderSize = sizes.reduce((accum,current) => accum + current, 0);
  const template = getGridTemplate(sizes);
  const offset = startOffset - renderOffset;

  // We can decide the JSX child type at runtime as long as we use a variable that uses the same capitalized
  // naming convention as components do.
  const ChildVar = children;

  return (
   <Container className={className} render={outerRender}
        style={{ position: "relative", height, width, overflow: "hidden", willChange: "transform" }}>
       <Container className={innerClassName} render={innerRender}
        style={{ position: 'absolute',
          display: 'grid',
          gridTemplateColumns: isVertical ? undefined : template,
          gridTemplateRows: isVertical ? template : undefined,
          top: isVertical ? offset : 0, 
          left: isVertical ? 0 : offset, 
          height: isVertical ? renderSize : "100%", 
          width: isVertical ? "100%" : renderSize }}>
        {sizes.map((_size, arrayIndex) => (
          <ChildVar data={itemData} key={itemKey(startIndex + arrayIndex, itemData)} index={startIndex + arrayIndex} style={boxStyle}/>
        ))}
      </Container>
    </Container>
  );
}

export default DisplayList;
