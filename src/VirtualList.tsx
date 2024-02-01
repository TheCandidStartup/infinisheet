import React from "react";
import { useVirtualScroll } from './useVirtualScroll';

export type RenderComponentProps = {
   data: any,
   index: number,
   isScrolling?: boolean,
   style: Object, 
};

export type RenderComponent = React.ComponentType<RenderComponentProps>;

export type VirtualListProps = {
  children: RenderComponent,
  height: number,
  width: number,
  itemCount: number,
  itemSize: number,
  itemData?: any,
  itemKey?: (index: number, data: any) => any,
};

type RangeToRender = [overscanStartIndex: number, overscanStopIndex: number, visibleStartIndex: number, visibleStopIndex: number];

const defaultItemKey = (index: number, _data: any) => index;

function getStartIndexForOffset({ itemCount, itemSize}: VirtualListProps, offset: number): number {
    return Math.max(0, Math.min(itemCount-1, Math.floor(offset / itemSize)));
}

function getStopIndexForStartIndex({height, itemCount, itemSize}: VirtualListProps, startIndex: number, offset: number): number {
    const startOffset = startIndex * itemSize;
    const size = height;
    const numVisibleItems = Math.ceil((size+offset-startOffset) / itemSize);
    return Math.max(
        0,
        Math.min(itemCount, startIndex+numVisibleItems) // stop index is exclusive
    );
}

function getRangeToRender(props: VirtualListProps, scrollOffset: number): RangeToRender {
    const { itemCount } = props;

    if (itemCount == 0) {
        return [0,0,0,0];
    }

    const startIndex = getStartIndexForOffset(props, scrollOffset);
    const stopIndex = getStopIndexForStartIndex(props, startIndex, scrollOffset);

    const overscanBackward = 1;
    const overscanForward = 1;

    return [
        Math.max(0, startIndex-overscanBackward),
        Math.max(0, Math.min(itemCount, stopIndex+overscanForward)),
        startIndex,
        stopIndex
    ]
}

function renderItems(props: VirtualListProps, scrollOffset: number) {
    const { children, itemData=undefined, itemSize, itemKey = defaultItemKey } = props;

    const [startIndex, stopIndex] = getRangeToRender(props, scrollOffset);

    const items = [];
    for (let index = startIndex; index < stopIndex; index++) {
        const offset = index * itemSize; 
        items.push(
          React.createElement(children, {
            data: itemData,
            key: itemKey(index, itemData),
            index,
            // isScrolling: useIsScrolling ? isScrolling : undefined,
            style: { position: "absolute", top: offset, height: itemSize, width: "100%" }
          })
        );
      }

    return items;
}

type ScrollEvent = React.SyntheticEvent<HTMLDivElement>;

export function VirtualList(props: VirtualListProps): React.JSX.Element {
    const { width, height, itemCount, itemSize } = props;

    const [{ scrollOffset }, onScrollExtent] = useVirtualScroll();

    const totalSize = itemCount * itemSize;

    function onScroll (event: ScrollEvent) {
        const { clientHeight, scrollHeight, scrollTop } = event.currentTarget;
        onScrollExtent(clientHeight, scrollHeight, scrollTop);
    }

    return (
        <div onScroll={onScroll} style={{ position: "relative", height, width, overflow: "auto", willChange: "transform" }}>
            <div style={{ height: totalSize, width: "100%" }}>
                {renderItems(props, scrollOffset)}
            </div>
        </div>
    );
};

export default VirtualList;
