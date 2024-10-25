import React from "react";

/**
 * Props that an implementation of {@link AutoSizerRender} must accept.
 */
export interface AutoSizerRenderProps {
  /** Computed height */
  height: number,

   /** Computed width */
  width: number,
}

/**
 * Render prop for content in an {@link AutoSizer}
 *
 * Function renders content and forwards `width` and `height`
 * to whatever needs it.
 * 
 * @example Simple implementation
 * ```
 * const autoSizeRender: AutoSizeRender = ({width, height}) => (
 *   <VirtualList width={width} height={height} {...props} />
 * )
 * ```
 */
export type AutoSizerRender = (props: AutoSizerRenderProps) => JSX.Element;

/**
 * Props accepted by {@link AutoSizer}
 */
export interface AutoSizerProps {
  /** Function implementing {@link AutoSizerRender} that renders the content that needs explicit sizing */
  children: AutoSizerRender

  /** The `className` applied to the container element */
  className?: string,

  /** Inline style to apply to the container element */
  style?: React.CSSProperties;
}

/**
 * Auto Sizer
 * 
 * HOC that calculates the size available to it and makes the computed size available to children.
 * The size available depends on DOM layout and style applied wherever the AutoSizer finds itself.
 * You will probably want to pass something appropriate via the `className` or `style` props.
 * 
 * Accepts props defined by {@link AutoSizerProps}. 
 * You must pass a single instance of {@link AutoSizerRender} as a child.
 * @group Components
 */
export function AutoSizer(props: AutoSizerProps) {
  const { children, className, style } = props;

  const [[height,width], setState] = React.useState<[number,number]>([0,0]);
  const ref = React.useRef<HTMLDivElement>(null);

  // Need to run effect after every render as no way of knowing how parent
  // might have changed.
  //
  // React lint complains about the use of height and width without listing as
  // dependencies. Of course they can't be dependencies because we're trying to set them.
  // We only access the current values to prevent an infinite loop repeatedly setting the same values.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useLayoutEffect(() => {
    const div = ref.current;
    if (div && (height != div.clientHeight || width != div.clientWidth)) {
      setState([div.clientHeight, div.clientWidth]);
    }
  })

  // No point rendering children until we've measured size and found a usable area
  const renderChildren = height > 0 && width > 0;

  // Ensure that size is driven only by parent. Wrapping child in a zero sized inner div
  // which it can overflow stops child's size having any impact on size of outer div. 
  // Otherwise can end up in infinite loop if child makes itself bigger than the 
  // actual width and height we pass to it. That could be because child has 
  // padding/borders/margins or because child renders itself bigger than size it's given.
  return (
    <div ref={ref} className={className} style={style}>
      <div style={{ overflow: 'visible', width: 0, height: 0 }}>
      {renderChildren && children({height, width})}
      </div>
    </div>
  );
}

export default AutoSizer;
