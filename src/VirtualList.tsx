import React from "react";

export type RenderComponentProps = {
   data: any,
   index: number,
   isScrolling?: boolean,
   style: Object, 
};

export type RenderComponent = React.ComponentType<RenderComponentProps>;

export type VirtualListProps = {
  children: RenderComponent,
  height: number | string,
  width: number | string,
  itemSize: number,
};

export function VirtualList({ height, width }: VirtualListProps): React.JSX.Element {
    return <div>List {height}, {width}</div>
};

export default VirtualList;
