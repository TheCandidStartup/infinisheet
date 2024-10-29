import React from "react";

/**
 * Props that an implementation of {@link VirtualContainerRender} must accept.
 * 
 * Anything that a div would accept.
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

export interface VirtualContainerComponentProps extends VirtualContainerRenderProps {
  render?: VirtualContainerRender;
}

const defaultContainerRender: VirtualContainerRender = ({...rest}, ref) => (
  <div ref={ref} {...rest} />
)

export const VirtualContainer = React.forwardRef<HTMLDivElement, VirtualContainerComponentProps >(
  function VirtualContainer({render = defaultContainerRender, ...rest}, ref) {
    return render(rest, ref)
})
