import React from "react";

/**
 * Props that an implementation of {@link VirtualContainerRender} must accept.
 * 
 * Includes all the props that a {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLDivElement | HTMLDivElement} would accept.
 */
export type VirtualContainerRenderProps = React.ComponentPropsWithoutRef<'div'>;

/**
 * Render prop for a {@link VirtualContainer}
 *
 * Can be passed to {@link VirtualContainer} to replace default implementation. 
 * Function must render a div and forward {@link VirtualContainerRenderProps}
 * and any `ref` to it. 
 * 
 * @example Minimal compliant implementation
 * ```
 * const containerRender: VirtualContainerRender = ({...rest}, ref) => (
 *   <div ref={ref} {...rest} />
 * )
 * ```
 */
export type VirtualContainerRender = (props: VirtualContainerRenderProps, ref?: React.ForwardedRef<HTMLDivElement>) => JSX.Element;

/**
 * Props that {@link VirtualContainer} accepts.
 */
export interface VirtualContainerComponentProps extends VirtualContainerRenderProps {
  /** Render prop implementing {@link VirtualContainerRender}. Used to customize {@link VirtualContainer}. */
  render?: VirtualContainerRender;
}

const defaultContainerRender: VirtualContainerRender = ({...rest}, ref) => (
  <div ref={ref} {...rest} />
)

/**
 * Wrapper around a div used by other components in {@link @candidstartup/react-virtual-scroll!}. Most props are passed through to the div. Use the
 * {@link VirtualContainerComponentProps.render} prop to override the default behavior. 
 * 
 * @group Components
 */
export const VirtualContainer = React.forwardRef<HTMLDivElement, VirtualContainerComponentProps >(
  function VirtualContainer({render = defaultContainerRender, ...rest}, ref) {
    return render(rest, ref)
})
