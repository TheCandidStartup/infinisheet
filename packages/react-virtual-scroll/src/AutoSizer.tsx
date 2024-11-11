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

  // Using separate primitive states rather than one composite so that React
  // can detect duplicates values and bail out of redundant renders.
  const [width, setWidth] = React.useState<number>(0);
  const [height, setHeight] = React.useState<number>(0);
  const ref = React.useRef<HTMLDivElement>(null);

  // Make sure resize callback is a stable value so we're not constantly
  // creating and disconnecting resize observers.
  const resizeCallback: ResizeObserverCallback = React.useCallback((entries) => {
    entries.forEach(entry => {
      // Context box sizes can contain fractional values while clientWidth
      // and clientHeight properties are always rounded to nearest integer.
      // Always use integer values to avoid confusion.
      const newWidth = Math.round(entry.contentBoxSize[0].inlineSize);
      setWidth(newWidth);
      const newHeight = Math.round(entry.borderBoxSize[0].blockSize);
      setHeight(newHeight);
    })
  }, []);

  // Expect effect to run only on initial mount
  React.useLayoutEffect(() => {
    const div = ref.current;
     /* istanbul ignore if*/
    if (!div)
      return;

    // Size on initial mount
    setHeight(div.clientHeight);
    setWidth(div.clientWidth);

    // Updates size on any subsequent resize. Only available in browser
    // environment so avoid crashing out when server side rendering, or
    // running unit test without ResizeObserver being mocked. 
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(resizeCallback);
      resizeObserver.observe(div);
      return () => { resizeObserver.disconnect() }
    }
  }, [resizeCallback])

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
